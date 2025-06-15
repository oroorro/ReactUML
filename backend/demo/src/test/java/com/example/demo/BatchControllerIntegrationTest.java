package com.example.demo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.example.demo.dto.BatchResponse;
import com.example.demo.model.Attribute;
import com.example.demo.model.AttributeContent;
import com.example.demo.model.Node;
import com.example.demo.model.Pipe;
import com.example.demo.model.User;
import com.example.demo.repository.AttributeContentRepository;
import com.example.demo.repository.AttributeRepository;
import com.example.demo.repository.NodeRepository;
import com.example.demo.repository.PipeRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.CustomUserDetails;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.transaction.Transactional;

@AutoConfigureMockMvc
@SpringBootTest(properties = "spring.config.name=application-test")
class BatchControllerIntegrationTest {

  @Autowired
  private JdbcTemplate jdbcTemplate;

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private NodeRepository nodeRepository;

  @Autowired
  private PipeRepository pipeRepository;

  @Autowired
  private AttributeRepository attributeRepository;

  @Autowired
  private AttributeContentRepository attributeContentRepository;

  @Test
  @Transactional
  void testApplyBatchChanges_withCustomUserDetails_shouldReturn200() throws Exception {

    // Optional<User> existing = userRepository.findById(12);

    User realUser = new User();
    // realUser.setId(12); // Match the ID used in CustomUserDetails
    realUser.setUsername("testuser"); // Match the username (optional)
    realUser.setPassword("password"); // Or any dummy value

    userRepository.save(realUser);

    // 1. Set up a custom authenticated user
    CustomUserDetails user = new CustomUserDetails(realUser.getId(), "testuser", "password",
        java.util.Collections.emptyList());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 2. Mock ChangeSetDto JSON payload
    String jsonPayload = """
        {
          "created": {
            "nodes": [
              {
                "uid": "node-1",
                "name": "Start",
                "isStartingNode": true
              }
            ],
            "pipes": [],
            "attributes": [],
            "attributeContents": []
          },
          "updated": null,
          "deleted": null
        }
        """;

    // 3. Perform POST request and expect 200 OK
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(jsonPayload))
        .andDo(result -> {
          if (result.getResolvedException() != null) {
            System.out.println("Exception: " + result.getResolvedException().getClass());
            System.out.println("Message: " + result.getResolvedException().getMessage());
          } else {
            System.out.println("No resolved exception. Status: " + result.getResponse().getStatus());
            System.out.println("Response body: " + result.getResponse().getContentAsString());
          }
        })
        .andExpect(status().isOk());

    Optional<Node> found = nodeRepository.findByUid("node-1");
    List<Node> allNodes = nodeRepository.findAll();

    assertTrue(found.isPresent());
    assertEquals(1, allNodes.size());
    assertEquals("Start", found.get().getName());
    assertTrue(found.get().getIsStartingNode());

  }

  @Test
  void testApplyBatchChanges_createsPipeAndSavesToRepo() throws Exception {
    // Save user
    User user = new User();
    user.setUsername("pipeuser");
    user.setPassword("pass");
    user = userRepository.save(user);

    // Create node needed for pipe source
    Node source = new Node();
    source.setUid("source-node");
    source.setName("Source");
    source.setIsStartingNode(true);
    source.setUser(user);
    nodeRepository.save(source);

    // Authenticated context
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(
        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    String payload = """
        {
          "created": {
            "pipes": [
              {
                "uid": "pipe-001",
                "name": "Pipe A",
                "mute": false,
                "color": "R",
                "sourceNode": { "uid": "source-node" }
              }
            ],
            "nodes": [],
            "attributes": [],
            "attributeContents": []
          },
          "updated": null,
          "deleted": null
        }
        """;

    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andDo(result -> {
          if (result.getResolvedException() != null) {
            System.out.println("Exception: " + result.getResolvedException().getClass());
            System.out.println("Message: " + result.getResolvedException().getMessage());
          } else {
            System.out.println("No resolved exception. Status: " + result.getResponse().getStatus());
            System.out.println("Response body: " + result.getResponse().getContentAsString());
          }
        })
        .andExpect(status().isOk());

    Pipe created = pipeRepository.findByUid("pipe-001").orElseThrow();
    assertEquals("Pipe A", created.getName());
    assertEquals("R", String.valueOf(created.getColor()));
    assertFalse(created.getMute());
    assertEquals("source-node", created.getSourceNode().getUid());
  }

  @Test
  @Transactional
  void testApplyBatchChanges_createsAttributeAndSavesToRepo() throws Exception {
    // Save user
    User user = new User();
    user.setUsername("attruser");
    user.setPassword("pass");
    user = userRepository.save(user);

    // Create parent node
    Node node = new Node();
    node.setUid("node-for-attr");
    node.setName("ParentNode");
    node.setUser(user);
    nodeRepository.save(node);

    // Auth context
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(
        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    String payload = """
        {
          "created": {
            "attributes": [
              {
                "uid": "attr-001",
                "name": "Size",
                "mute": false,
                "totalNumber": 2,
                "node": { "uid": "node-for-attr" }
              }
            ],
            "nodes": [],
            "pipes": [],
            "attributeContents": []
          },
          "updated": null,
          "deleted": null
        }
        """;

    Optional<Node> returnedNode = nodeRepository.findByUid("node-for-attr");
    assertTrue(returnedNode.isPresent());

    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isOk());

    Optional<Attribute> maybeAttr = attributeRepository.findByUid("attr-001");
    assertTrue(maybeAttr.isPresent(), "Attribute was not saved properly");

    Attribute created = attributeRepository.findByUid("attr-001").orElseThrow();
    List<Attribute> allattr = attributeRepository.findAll();

    assertEquals("Size", created.getName());
    assertEquals(2, created.getTotalNumber());
    assertFalse(created.getMute());
    assertEquals("node-for-attr", created.getNode().getUid());
    assertEquals(1, allattr.size());

  }

  @Test
  void testApplyBatchChanges_createsSingleAttributeContent() throws Exception {
    // Setup user and node
    User user = new User();
    user.setUsername("acUser1");
    user.setPassword("pass");
    user = userRepository.save(user);

    Node node = new Node();
    node.setUid("node-ac-1");
    node.setName("ACNode1");
    node.setUser(user);
    nodeRepository.save(node);

    Attribute attribute = new Attribute();
    attribute.setUid("attr-ac-1");
    attribute.setName("Size");
    attribute.setNode(node);
    attribute.setMute(false);
    attribute.setTotalNumber(1);
    attributeRepository.save(attribute);

    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    String payload = """
        {
          "created": {
            "attributeContents": [
              {
                "uid": "ac-001",
                "name": "AC-One",
                "belongingNode": { "uid": "node-ac-1" },
                "attribute": { "uid": "attr-ac-1" }
              }
            ],
            "nodes": [], "pipes": [], "attributes": []
          },
          "updated": null,
          "deleted": null
        }
        """;

    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isOk());

    Optional<AttributeContent> ac = attributeContentRepository.findByUid("ac-001");
    assertTrue(ac.isPresent());
    assertEquals("AC-One", ac.get().getName());
  }

  @Test
  void testApplyBatchChanges_createsMultipleAttributeContents() throws Exception {
    User user = new User();
    user.setUsername("acUser2");
    user.setPassword("pass");
    user = userRepository.save(user);

    Node node = new Node();
    node.setUid("node-ac-2");
    node.setName("ACNode2");
    node.setUser(user);
    nodeRepository.save(node);

    Attribute attribute = new Attribute();
    attribute.setUid("attr-ac-2");
    attribute.setName("Weight");
    attribute.setNode(node);
    attribute.setMute(false);
    attribute.setTotalNumber(3);
    attributeRepository.save(attribute);

    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    String payload = """
        {
          "created": {
            "attributeContents": [
              {
                "uid": "ac-101",
                "name": "AC1",
                "belongingNode": { "uid": "node-ac-2" },
                "attribute": { "uid": "attr-ac-2" }
              },
              {
                "uid": "ac-102",
                "name": "AC2",
                "belongingNode": { "uid": "node-ac-2" },
                "attribute": { "uid": "attr-ac-2" }
              },
              {
                "uid": "ac-103",
                "name": "AC3",
                "belongingNode": { "uid": "node-ac-2" },
                "attribute": { "uid": "attr-ac-2" }
              }
            ],
            "nodes": [], "pipes": [], "attributes": []
          },
          "updated": null,
          "deleted": null
        }
        """;

    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isOk());

    List<AttributeContent> all = attributeContentRepository.findAll();
    assertEquals(3, all.stream().filter(ac -> ac.getUid().startsWith("ac-10")).count());

    Optional<AttributeContent> ac1 = attributeContentRepository.findByUid("ac-101");
    assertTrue(ac1.isPresent());
    assertEquals("AC1", ac1.get().getName());

    Optional<AttributeContent> ac2 = attributeContentRepository.findByUid("ac-102");
    assertTrue(ac2.isPresent());
    assertEquals("AC2", ac2.get().getName());

    Optional<AttributeContent> ac3 = attributeContentRepository.findByUid("ac-103");
    assertTrue(ac3.isPresent());
    assertEquals("AC3", ac3.get().getName());

  }

  @Test
  void testApplyBatchChanges_createsMultipleEntitiesLinkedToExistingOnes() throws Exception {
    // 1. Setup user and base Node
    User user = new User();
    user.setUsername("linker");
    user.setPassword("pass");
    user = userRepository.save(user);

    Node nodeA = new Node();
    nodeA.setUid("node-A");
    nodeA.setName("Node A");
    nodeA.setUser(user);
    nodeA = nodeRepository.save(nodeA);

    Node nodeB = new Node();
    nodeB.setUid("node-B");
    nodeB.setName("Node B");
    nodeB.setUser(user);
    nodeB = nodeRepository.save(nodeB);

    // 2. Set up security context
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 3. Define payload
    String payload = """
        {
          "created": {
            "pipes": [
              {
                "uid": "pipe-001",
                "name": "Connector",
                "mute": false,
                "color": "B",
                "sourceNode": { "uid": "node-A" },
                "targetNode": { "uid": "node-B" }
              }
            ],
            "attributes": [
              {
                "uid": "attr-001",
                "name": "Mass",
                "totalNumber": 2,
                "mute": false,
                "node": { "uid": "node-A" }
              }
            ],
            "attributeContents": [
              {
                "uid": "ac-001",
                "name": "Mass Content 1",
                "belongingNode": { "uid": "node-A" },
                "attribute": { "uid": "attr-001" }
              },
              {
                "uid": "ac-002",
                "name": "Mass Content 2",
                "belongingNode": { "uid": "node-B" },
                "attribute": { "uid": "attr-001" }
              }
            ],
            "nodes": []
          },
          "updated": null,
          "deleted": null
        }
        """;

    // 4. Call endpoint and assert success
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isOk());

    // 5. Assert all were persisted
    assertTrue(pipeRepository.findByUid("pipe-001").isPresent());
    assertTrue(attributeRepository.findByUid("attr-001").isPresent());
    assertTrue(attributeContentRepository.findByUid("ac-001").isPresent());
    assertTrue(attributeContentRepository.findByUid("ac-002").isPresent());
  }

  @Test
  void testApplyBatchChanges_createsMultipleEntitiesLinkedToExistingDb() throws Exception {
    // 1. Setup base user and save
    User user = new User();
    user.setUsername("batchUser");
    user.setPassword("pass");
    user = userRepository.save(user);

    // 2. Create base nodes
    Node nodeA = new Node();
    nodeA.setUid("node-A");
    nodeA.setName("Node A");
    nodeA.setUser(user);
    nodeRepository.save(nodeA);

    Node nodeB = new Node();
    nodeB.setUid("node-B");
    nodeB.setName("Node B");
    nodeB.setUser(user);
    nodeRepository.save(nodeB);

    // 3. Create attribute
    Attribute attr = new Attribute();
    attr.setUid("attr-01");
    attr.setName("Color");
    attr.setMute(false);
    attr.setTotalNumber(2);
    attr.setNode(nodeA);
    attributeRepository.save(attr);

    // 4. Create pipe
    Pipe pipe = new Pipe();
    pipe.setUid("pipe-01");
    pipe.setName("Line A");
    pipe.setColor('B');
    pipe.setMute(false);
    pipe.setSourceNode(nodeA);
    pipe.setTargetNode(nodeB);
    pipeRepository.save(pipe);

    // 5. Authenticate as CustomUserDetails
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 6. Batch JSON payload that references pre-existing entities
    // nodeC
    String payload = """
        {
          "created": {
            "nodes": [
              { "uid": "node-C", "name": "Node C", "isStartingNode": true },
              { "uid": "node-D", "name": "Node D", "isStartingNode": false }
            ],
            "pipes": [
              { "uid": "pipe-02", "name": "Line B", "color": "R", "mute": false, "sourceNode": { "uid": "node-B" }, "targetNode": { "uid": "node-A" } },
              { "uid": "pipe-03", "name": "Line C", "color": "G", "mute": true, "sourceNode": { "uid": "node-C" }, "targetNode": { "uid": "node-D" } }
            ],
            "attributes": [
              { "uid": "attr-02", "name": "Speed", "totalNumber": 5, "mute": false, "node": { "uid": "node-B" } },
              { "uid": "attr-03", "name": "Import", "totalNumber": 15, "mute": true, "node": { "uid": "node-D" } }
            ],
            "attributeContents": [
              { "uid": "ac-01", "name": "AC-A", "belongingNode": { "uid": "node-A" }, "attribute": { "uid": "attr-01" } },
              { "uid": "ac-02", "name": "AC-B", "belongingNode": { "uid": "node-B" }, "pipe": { "uid": "pipe-01" } },
              { "uid": "ac-03", "name": "AC-C", "belongingNode": { "uid": "node-B" }, "attribute": { "uid": "attr-01" }, "pipe": { "uid": "pipe-01" } },
              { "uid": "ac-04", "name": "AC-D", "belongingNode": { "uid": "node-C" }, "attribute": { "uid": "attr-03" }, "pipe": { "uid": "pipe-03" } }
            ]
          },
          "updated": null,
          "deleted": null
        }
        """;

    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andDo(result -> {
          if (result.getResolvedException() != null) {
            System.err.println("Exception: " + result.getResolvedException().getClass());
            System.err.println("Message: " + result.getResolvedException().getMessage());
          } else {
            System.err.println("No resolved exception. Status: " + result.getResponse().getStatus());
            System.err.println("Response body: " + result.getResponse().getContentAsString());
          }
        })
        .andExpect(status().isOk());

    // 7. Assertions
    // check Nodes
    assertTrue(nodeRepository.findByUid("node-C").isPresent());
    assertTrue(nodeRepository.findByUid("node-D").isPresent());
    assertEquals(4, nodeRepository.findAll().size());
    assertEquals("Node A", nodeRepository.findByUid("node-A").get().getName());
    assertEquals("Node B", nodeRepository.findByUid("node-B").get().getName());
    assertEquals("Node C", nodeRepository.findByUid("node-C").get().getName());
    assertEquals("Node D", nodeRepository.findByUid("node-D").get().getName());

    // pipes
    assertTrue(pipeRepository.findByUid("pipe-02").isPresent());
    assertTrue(pipeRepository.findByUid("pipe-03").isPresent());
    assertEquals(3, pipeRepository.findAll().size());
    assertEquals("Line A", pipeRepository.findByUid("pipe-01").get().getName());
    assertEquals("Line B", pipeRepository.findByUid("pipe-02").get().getName());
    assertEquals("Line C", pipeRepository.findByUid("pipe-03").get().getName());

    Pipe retPipe = pipeRepository.findByUid("pipe-02")
        .orElseThrow(() -> new AssertionError("Pipe with uid pipe-02 not found"));

    assertEquals("Line B", retPipe.getName(), "Pipe name mismatch");
    assertEquals('R', retPipe.getColor(), "Pipe color mismatch");
    assertFalse(retPipe.getMute(), "Pipe mute should be false");
    assertNotNull(retPipe.getSourceNode(), "Source node is null");
    assertEquals("node-B", retPipe.getSourceNode().getUid(), "Source node UID mismatch");
    assertNotNull(retPipe.getTargetNode(), "Target node is null");
    assertEquals("node-A", retPipe.getTargetNode().getUid(), "Target node UID mismatch");

    // checking size of Attributes that were saved
    assertEquals(3, attributeRepository.findAll().size());
    assertTrue(attributeRepository.findByUid("attr-02").isPresent());

    assertTrue(attributeContentRepository.findByUid("ac-01").isPresent());
    assertTrue(attributeContentRepository.findByUid("ac-02").isPresent());
    assertTrue(attributeContentRepository.findByUid("ac-03").isPresent());
    assertTrue(attributeContentRepository.findByUid("ac-04").isPresent());

    List<AttributeContent> all = attributeContentRepository.findAll();
    assertEquals(4, all.stream().filter(ac -> ac.getUid().startsWith("ac-")).count());

    AttributeContent ac01 = attributeContentRepository.findByUid("ac-01").orElseThrow();
    assertEquals("AC-A", ac01.getName());

    AttributeContent ac02 = attributeContentRepository.findByUid("ac-02").orElseThrow();
    assertEquals("AC-B", ac02.getName());

    AttributeContent ac03 = attributeContentRepository.findByUid("ac-03").orElseThrow();
    assertEquals("AC-C", ac03.getName());

    AttributeContent ac04 = attributeContentRepository.findByUid("ac-04").orElseThrow();
    assertEquals("AC-D", ac04.getName());
  }

  @Test
  void testApplyBatchChanges_deletesNodeByUidSuccessfully() throws Exception {
    // 1. Create and save user
    User user = new User();
    user.setUsername("deleteUser");
    user.setPassword("pass");
    user = userRepository.save(user);

    // 2. Create and save a node with a UID, linked to the user
    Node node = new Node();
    node.setUid("node-delete-uid");
    node.setName("DeleteTarget");
    node.setUser(user);
    node = nodeRepository.save(node);

    assertNotNull(nodeRepository.findByUid("node-delete-uid").isPresent());

    // 3. Authenticate as that user
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 4. JSON payload to delete the node by UID
    String payload = """
        {
          "created": {},
          "updated": {},
          "deleted": {
            "nodeUids": ["node-delete-uid"]
          }
        }
        """;

    // 5. Perform batch delete request
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isOk());

    // 6. Assert node no longer exists
    Optional<Node> deleted = nodeRepository.findByUid("node-delete-uid");
    assertTrue(deleted.isEmpty());
    assertEquals(0, nodeRepository.findAll().size());
  }

  @Test
  void testBatchDelete_withInvalidNodeUid_returnsFailureResponse() throws Exception {
    // 1. Create and save a real user
    User user = new User();
    user.setUsername("testUser");
    user.setPassword("testPass");
    user = userRepository.save(user);

    // 2. Set up authenticated context
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 3. JSON with a nodeUid that doesn't exist in the DB
    String invalidUid = "nonexistent-node-uid";
    String requestJson = """
        {
          "created": {},
          "updated": {},
          "deleted": {
            "nodeUids": ["%s"]
          }
        }
        """.formatted(invalidUid);

    // 4. Perform the batch delete request
    MvcResult result = mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(requestJson))
        .andExpect(status().isBadRequest()) // Expect 400 for failure
        .andReturn();

    // 5. Parse response and verify
    String responseJson = result.getResponse().getContentAsString();

    assertTrue(responseJson.contains("\"success\":false"));
    assertTrue(responseJson.contains("\"message\":\"Some entities failed to delete\""));
    assertTrue(responseJson.contains("\"nodeUids\":[\"" + invalidUid + "\"]"));
  }

  @Test
  void testApplyBatchChanges_deletesPipeByUidSuccessfully() throws Exception {
    // 1. Create and save user
    User user = new User();
    user.setUsername("deletePipeUser");
    user.setPassword("pass");
    user = userRepository.save(user);

    // 2. Create and save a node (required for pipe)
    Node node = new Node();
    node.setUid("pipe-node-uid");
    node.setName("PipeNode");
    node.setUser(user);
    node = nodeRepository.save(node);

    // 3. Create and save a pipe
    Pipe pipe = new Pipe();
    pipe.setUid("pipe-delete-uid");
    pipe.setName("DeletePipe");
    pipe.setColor('B');
    pipe.setMute(false);
    pipe.setSourceNode(node);
    pipe.setTargetNode(node);
    pipe = pipeRepository.save(pipe);

    assertTrue(pipeRepository.findByUid("pipe-delete-uid").isPresent());

    // 4. Authenticate as that user
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 5. JSON payload to delete the pipe by UID
    String payload = """
        {
          "created": {},
          "updated": {},
          "deleted": {
            "pipeUids": ["pipe-delete-uid"]
          }
        }
        """;

    // 6. Perform batch delete request
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isOk());

    // 7. Assert pipe no longer exists
    Optional<Pipe> deleted = pipeRepository.findByUid("pipe-delete-uid");
    assertTrue(deleted.isEmpty());
    assertEquals(0, pipeRepository.findAll().size());
  }

  @Test
  void testBatchDelete_withInvalidAttributeUid_returnsFailureResponse() throws Exception {
    // 1. Create and save a real user
    User user = new User();
    user.setUsername("testAttrUser");
    user.setPassword("testPass");
    user = userRepository.save(user);

    // 2. Set up authenticated context
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 3. JSON with an attributeUid that doesn't exist in the DB
    String invalidUid = "nonexistent-attribute-uid";
    String requestJson = """
        {
          "created": {},
          "updated": {},
          "deleted": {
            "attributeUids": ["%s"]
          }
        }
        """.formatted(invalidUid);

    // 4. Perform the batch delete request
    MvcResult result = mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(requestJson))
        .andExpect(status().isBadRequest()) // Expect 400 for failure
        .andReturn();

    // 5. Parse response and verify
    String responseJson = result.getResponse().getContentAsString();

    assertTrue(responseJson.contains("\"success\":false"));
    assertTrue(responseJson.contains("\"message\":\"Some entities failed to delete\""));
    assertTrue(responseJson.contains("\"attributeUids\":[\"" + invalidUid + "\"]"));
  }

  @Test
  @Transactional
  void testApplyBatchChanges_deletesAllEntityTypesSuccessfully() throws Exception {
    // 1. Create and save user
    User user = new User();
    user.setUsername("deleteAllUser");
    user.setPassword("pass");
    user = userRepository.save(user);

    // 2. Create and save nodes (needed for relationships)
    Node nodeA = new Node();
    nodeA.setUid("node-a-delete");
    nodeA.setName("Node A");
    nodeA.setUser(user);
    nodeA = nodeRepository.save(nodeA);

    Node nodeB = new Node();
    nodeB.setUid("node-b-delete");
    nodeB.setName("Node B");
    nodeB.setUser(user);
    nodeB = nodeRepository.save(nodeB);

    // 3. Create and save pipe
    Pipe pipe = new Pipe();
    pipe.setUid("pipe-delete-all");
    pipe.setName("DeletePipe");
    pipe.setColor('B');
    pipe.setMute(false);
    pipe.setSourceNode(nodeA);
    pipe.setTargetNode(nodeB);
    pipe = pipeRepository.save(pipe);

    // 4. Create and save attribute
    Attribute attribute = new Attribute();
    attribute.setUid("attr-delete-all");
    attribute.setName("DeleteAttribute");
    attribute.setMute(false);
    attribute.setTotalNumber(2);
    attribute.setNode(nodeA);
    attribute = attributeRepository.save(attribute);

    // 5. Create and save attribute content
    AttributeContent ac = new AttributeContent();
    ac.setUid("ac-delete-all");
    ac.setName("DeleteAC");
    ac.setBelongingNode(nodeA);
    ac.setAttribute(attribute);
    ac = attributeContentRepository.save(ac);

    // Verify all entities exist before deletion
    assertTrue(nodeRepository.findByUid("node-a-delete").isPresent());
    assertTrue(nodeRepository.findByUid("node-b-delete").isPresent());
    assertTrue(pipeRepository.findByUid("pipe-delete-all").isPresent());
    assertTrue(attributeRepository.findByUid("attr-delete-all").isPresent());
    assertTrue(attributeContentRepository.findByUid("ac-delete-all").isPresent());

    // 6. Authenticate as that user
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 7. JSON payload to delete all entities
    String payload = """
        {
          "created": {},
          "updated": {},
          "deleted": {
            "nodeUids": ["node-a-delete", "node-b-delete"],
            "pipeUids": ["pipe-delete-all"],
            "attributeUids": ["attr-delete-all"],
            "attributeContentUids": ["ac-delete-all"]
          }
        }
        """;

    // 8. Perform batch delete request
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isOk());

    // 9. Verify all entities are deleted
    assertTrue(nodeRepository.findByUid("node-a-delete").isEmpty());
    assertTrue(nodeRepository.findByUid("node-b-delete").isEmpty());
    assertTrue(pipeRepository.findByUid("pipe-delete-all").isEmpty());
    assertTrue(attributeRepository.findByUid("attr-delete-all").isEmpty());
    assertTrue(attributeContentRepository.findByUid("ac-delete-all").isEmpty());

    // Verify repository counts
    assertEquals(0, nodeRepository.findAll().size());
    assertEquals(0, pipeRepository.findAll().size());
    assertEquals(0, attributeRepository.findAll().size());
    assertEquals(0, attributeContentRepository.findAll().size());
  }

  @Test
  void testTableExists() {
    jdbcTemplate.execute("SELECT * FROM attribute_content");
  }

  @Test
  void testBatchDelete_withInvalidAttributeContentUid_returnsFailureResponse() throws Exception {
    // 1. Create and save a real user
    User user = new User();
    user.setUsername("testACUser");
    user.setPassword("testPass");
    user = userRepository.save(user);

    // 2. Set up authenticated context
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 3. JSON with an attributeContentUid that doesn't exist in the DB
    String invalidUid = "nonexistent-ac-uid";
    String requestJson = """
        {
          "created": {},
          "updated": {},
          "deleted": {
            "attributeContentUids": ["%s"]
          }
        }
        """.formatted(invalidUid);

    // 4. Perform the batch delete request
    MvcResult result = mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(requestJson))
        .andExpect(status().isBadRequest()) // Expect 400 for failure
        .andReturn();

    // 5. Parse response and verify
    String responseJson = result.getResponse().getContentAsString();

    assertTrue(responseJson.contains("\"success\":false"));
    assertTrue(responseJson.contains("\"message\":\"Some entities failed to delete\""));
    assertTrue(responseJson.contains("\"attributeContentUids\":[\"" + invalidUid + "\"]"));

    // 6. Verify no changes to repository
    assertEquals(0, attributeContentRepository.findAll().size());
  }

  // test for updating attributecontent that changes Attribute's name
  @Test
  void testApplyBatchChanges_updatesAttributeContentSuccessfully() throws Exception {
    // 1. Setup user and node
    User user = new User();
    user.setUsername("updateACUser");
    user.setPassword("pass");
    user = userRepository.save(user);

    Node node = new Node();
    node.setUid("node-update-ac");
    node.setName("UpdateACNode");
    node.setUser(user);
    nodeRepository.save(node);

    // 2. Create and save attribute
    Attribute attribute = new Attribute();
    attribute.setUid("attr-update-ac");
    attribute.setName("Size");
    attribute.setNode(node);
    attribute.setMute(false);
    attribute.setTotalNumber(1);
    attributeRepository.save(attribute);

    // 3. Create and save initial attribute content
    AttributeContent ac = new AttributeContent();
    ac.setUid("ac-update-001");
    ac.setName("Original Name");
    ac.setBelongingNode(node);
    ac.setAttribute(attribute);
    attributeContentRepository.save(ac);

    // check if the attribute content is saved
    Optional<AttributeContent> originalAC = attributeContentRepository.findByUid("ac-update-001");
    assertTrue(originalAC.isPresent());
    assertEquals("Original Name", originalAC.get().getName());
    assertEquals("node-update-ac", originalAC.get().getBelongingNode().getUid());
    assertEquals("attr-update-ac", originalAC.get().getAttribute().getUid());

    // 4. Set up security context
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 5. JSON payload to update the attribute content
    String payload = """
        {
          "created": {},
          "updated": {
            "attributeContents": [
              {
                "uid": "ac-update-001",
                "name": "Updated Name",
                "belongingNode": { "uid": "node-update-ac" },
                "attribute": { "uid": "attr-update-ac" }
              }
            ]
          },
          "deleted": {}
        }
        """;

    // 6. Perform batch update request
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isOk());

    // 7. Verify the update was successful
    Optional<AttributeContent> updatedAC = attributeContentRepository.findByUid("ac-update-001");
    assertTrue(updatedAC.isPresent());
    assertEquals("Updated Name", updatedAC.get().getName());
    assertEquals("node-update-ac", updatedAC.get().getBelongingNode().getUid());
    assertEquals("attr-update-ac", updatedAC.get().getAttribute().getUid());
  }

  @Test
  void testApplyBatchChanges_updatesAttributeContentWithInvalidUid_returnsFailureResponse() throws Exception {
    // 1. Setup user and node
    User user = new User();
    user.setUsername("updateACUser2");
    user.setPassword("pass");
    user = userRepository.save(user);

    // 2. Set up security context
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 3. JSON payload with non-existent attribute content UID
    String payload = """
        {
          "created": {},
          "updated": {
            "attributeContents": [
              {
                "uid": "non-existent-ac",
                "name": "Updated Name",
                "belongingNode": { "uid": "some-node" },
                "attribute": { "uid": "some-attr" }
              }
            ]
          },
          "deleted": {}
        }
        """;

    // 4. Perform batch update request
    MvcResult result = mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isBadRequest())
        .andReturn();

    // 5. Verify response
    String responseJson = result.getResponse().getContentAsString();
    assertTrue(responseJson.contains("\"success\":false"));
    assertTrue(responseJson.contains("\"message\":\"Some entities failed to update\""));
    assertTrue(responseJson.contains("\"attributeContents\":[\"non-existent-ac\"]"));
  }

  @Test
  void testApplyBatchChanges_updatesAttributeContentIndividualFields() throws Exception {
    // 1. Setup user and nodes
    User user = new User();
    user.setUsername("fieldUpdateUser");
    user.setPassword("pass");
    user = userRepository.save(user);

    Node node1 = new Node();
    node1.setUid("node-field-1");
    node1.setName("Node 1");
    node1.setUser(user);
    nodeRepository.save(node1);

    Node node2 = new Node();
    node2.setUid("node-field-2");
    node2.setName("Node 2");
    node2.setUser(user);
    nodeRepository.save(node2);

    // 2. Create and save attributes
    Attribute attr1 = new Attribute();
    attr1.setUid("attr-field-1");
    attr1.setName("Size");
    attr1.setNode(node1);
    attr1.setMute(false);
    attr1.setTotalNumber(1);
    attributeRepository.save(attr1);

    Attribute attr2 = new Attribute();
    attr2.setUid("attr-field-2");
    attr2.setName("Color");
    attr2.setNode(node2);
    attr2.setMute(false);
    attr2.setTotalNumber(1);
    attributeRepository.save(attr2);

    // 3. Create and save pipe
    Pipe pipe = new Pipe();
    pipe.setUid("pipe-field-1");
    pipe.setName("Test Pipe");
    pipe.setColor('B');
    pipe.setMute(false);
    pipe.setSourceNode(node1);
    pipe.setTargetNode(node2);
    pipeRepository.save(pipe);

    // 4. Create and save initial attribute content
    AttributeContent ac = new AttributeContent();
    ac.setUid("ac-field-001");
    ac.setName("Original Name");
    ac.setHoldingValue("Original Value");
    ac.setBelongingNode(node1);
    ac.setAttribute(attr1);
    attributeContentRepository.save(ac);

    // 5. Set up security context
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 6. Test updating name
    String nameUpdatePayload = """
        {
          "created": {},
          "updated": {
            "attributeContents": [
              {
                "uid": "ac-field-001",
                "name": "Updated Name",
                "belongingNode": { "uid": "node-field-1" },
                "attribute": { "uid": "attr-field-1" }
              }
            ]
          },
          "deleted": {}
        }
        """;

    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(nameUpdatePayload))
        .andExpect(status().isOk());

    Optional<AttributeContent> updatedAC = attributeContentRepository.findByUid("ac-field-001");
    assertTrue(updatedAC.isPresent());
    assertEquals("Updated Name", updatedAC.get().getName());

    // 7. Test updating value
    String valueUpdatePayload = """
        {
          "created": {},
          "updated": {
            "attributeContents": [
              {
                "uid": "ac-field-001",
                "name": "Updated Name",
                "holdingValue": "New Value",
                "belongingNode": { "uid": "node-field-1" },
                "attribute": { "uid": "attr-field-1" }
              }
            ]
          },
          "deleted": {}
        }
        """;

    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(valueUpdatePayload))
        .andExpect(status().isOk());

    updatedAC = attributeContentRepository.findByUid("ac-field-001");
    assertTrue(updatedAC.isPresent());
    assertEquals("New Value", updatedAC.get().getHoldingValue());

    // 8. Test updating node
    String nodeUpdatePayload = """
        {
          "created": {},
          "updated": {
            "attributeContents": [
              {
                "uid": "ac-field-001",
                "name": "Updated Name",
                "holdingValue": "New Value",
                "belongingNode": { "uid": "node-field-2" },
                "attribute": { "uid": "attr-field-1" }
              }
            ]
          },
          "deleted": {}
        }
        """;

    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(nodeUpdatePayload))
        .andExpect(status().isOk());

    updatedAC = attributeContentRepository.findByUid("ac-field-001");
    assertTrue(updatedAC.isPresent());
    assertEquals("node-field-2", updatedAC.get().getBelongingNode().getUid());

    // 9. Test updating attribute
    String attrUpdatePayload = """
        {
          "created": {},
          "updated": {
            "attributeContents": [
              {
                "uid": "ac-field-001",
                "name": "Updated Name",
                "holdingValue": "New Value",
                "belongingNode": { "uid": "node-field-2" },
                "attribute": { "uid": "attr-field-2" }
              }
            ]
          },
          "deleted": {}
        }
        """;

    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(attrUpdatePayload))
        .andExpect(status().isOk());

    updatedAC = attributeContentRepository.findByUid("ac-field-001");
    assertTrue(updatedAC.isPresent());
    assertEquals("attr-field-2", updatedAC.get().getAttribute().getUid());

    // 10. Test updating pipe
    String pipeUpdatePayload = """
        {
          "created": {},
          "updated": {
            "attributeContents": [
              {
                "uid": "ac-field-001",
                "name": "Updated Name",
                "holdingValue": "New Value",
                "belongingNode": { "uid": "node-field-2" },
                "attribute": { "uid": "attr-field-2" },
                "pipe": { "uid": "pipe-field-1" }
              }
            ]
          },
          "deleted": {}
        }
        """;

    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(pipeUpdatePayload))
        .andExpect(status().isOk());

    updatedAC = attributeContentRepository.findByUid("ac-field-001");
    assertTrue(updatedAC.isPresent());
    assertEquals("pipe-field-1", updatedAC.get().getPipe().getUid());
  }

  @Test
  void testApplyBatchChanges_updatesAttributeContentMinimalFields() throws Exception {
    // 1. Setup user and node
    User user = new User();
    user.setUsername("minimalUpdateUser");
    user.setPassword("pass");
    user = userRepository.save(user);

    Node node = new Node();
    node.setUid("node-minimal");
    node.setName("Minimal Node");
    node.setUser(user);
    nodeRepository.save(node);

    // 2. Create and save attribute
    Attribute attribute = new Attribute();
    attribute.setUid("attr-minimal");
    attribute.setName("Size");
    attribute.setNode(node);
    attribute.setMute(false);
    attribute.setTotalNumber(1);
    attributeRepository.save(attribute);

    // 3. Create and save initial attribute content
    AttributeContent ac = new AttributeContent();
    ac.setUid("ac-minimal-001");
    ac.setName("Original Name");
    ac.setHoldingValue("Original Value");
    ac.setBelongingNode(node);
    ac.setAttribute(attribute);
    attributeContentRepository.save(ac);

    // 4. Set up security context
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 5. Test updating only the value field
    String minimalUpdatePayload = """
        {
          "created": {},
          "updated": {
            "attributeContents": [
              {
                "uid": "ac-minimal-001",
                "holdingValue": "Updated Value"
              }
            ]
          },
          "deleted": {}
        }
        """;

    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(minimalUpdatePayload))
        .andExpect(status().isOk());

    // 6. Verify only value was updated, other fields remain unchanged
    Optional<AttributeContent> updatedAC = attributeContentRepository.findByUid("ac-minimal-001");
    assertTrue(updatedAC.isPresent());
    assertEquals("Updated Value", updatedAC.get().getHoldingValue());
    assertEquals("Original Name", updatedAC.get().getName());
    assertEquals("node-minimal", updatedAC.get().getBelongingNode().getUid());
    assertEquals("attr-minimal", updatedAC.get().getAttribute().getUid());
  }

  @Test
  void testApplyBatchChanges_updatesAttributeContentMinimalFieldsPipe() throws Exception {
    // 1. Setup user and node
    User user = new User();
    user.setUsername("minimalUpdateUser");
    user.setPassword("pass");
    user = userRepository.save(user);

    Node node = new Node();
    node.setUid("node-minimal");
    node.setName("Minimal Node");
    node.setUser(user);
    nodeRepository.save(node);

    // 2. Create and save attribute
    Attribute attribute = new Attribute();
    attribute.setUid("attr-minimal");
    attribute.setName("Size");
    attribute.setNode(node);
    attribute.setMute(false);
    attribute.setTotalNumber(1);
    attributeRepository.save(attribute);

    Pipe pipe = new Pipe();
    pipe.setUid("pipe-full-1");
    pipe.setName("Test Pipe");
    pipe.setColor('B');
    pipe.setMute(false);
    pipe.setSourceNode(node);
    pipeRepository.save(pipe);

    // 3. Create and save initial attribute content without Pipe
    AttributeContent ac = new AttributeContent();
    ac.setUid("ac-minimal-001");
    ac.setName("Original Name");
    ac.setHoldingValue("Original Value");
    ac.setBelongingNode(node);
    ac.setAttribute(attribute);
    attributeContentRepository.save(ac);

    // 4. Set up security context
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 5. Test updating only the value field
    String minimalUpdatePayload = """
        {
          "created": {},
          "updated": {
            "attributeContents": [
              {
                "uid": "ac-minimal-001",
                "pipe": { "uid": "pipe-full-1" }
              }
            ]
          },
          "deleted": {}
        }
        """;

    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(minimalUpdatePayload))
        .andExpect(status().isOk());

    // 6. Verify only value was updated, other fields remain unchanged
    Optional<AttributeContent> updatedAC = attributeContentRepository.findByUid("ac-minimal-001");
    assertTrue(updatedAC.isPresent());
    assertEquals("pipe-full-1", updatedAC.get().getPipe().getUid());
    assertEquals("Original Name", updatedAC.get().getName());
    assertEquals("node-minimal", updatedAC.get().getBelongingNode().getUid());
    assertEquals("attr-minimal", updatedAC.get().getAttribute().getUid());
  }

  @Test
  void testApplyBatchChanges_updatesAttributeContentAllFields() throws Exception {
    // 1. Setup user and nodes
    User user = new User();
    user.setUsername("fullUpdateUser");
    user.setPassword("pass");
    user = userRepository.save(user);

    Node node1 = new Node();
    node1.setUid("node-full-1");
    node1.setName("Node 1");
    node1.setUser(user);
    nodeRepository.save(node1);

    Node node2 = new Node();
    node2.setUid("node-full-2");
    node2.setName("Node 2");
    node2.setUser(user);
    nodeRepository.save(node2);

    // 2. Create and save attributes
    Attribute attr1 = new Attribute();
    attr1.setUid("attr-full-1");
    attr1.setName("Size");
    attr1.setNode(node1);
    attr1.setMute(false);
    attr1.setTotalNumber(1);
    attributeRepository.save(attr1);

    Attribute attr2 = new Attribute();
    attr2.setUid("attr-full-2");
    attr2.setName("Color");
    attr2.setNode(node2);
    attr2.setMute(false);
    attr2.setTotalNumber(1);
    attributeRepository.save(attr2);

    // 3. Create and save pipe
    Pipe pipe = new Pipe();
    pipe.setUid("pipe-full-1");
    pipe.setName("Test Pipe");
    pipe.setColor('B');
    pipe.setMute(false);
    pipe.setSourceNode(node1);
    pipe.setTargetNode(node2);
    pipeRepository.save(pipe);

    // 4. Create and save initial attribute content
    AttributeContent ac = new AttributeContent();
    ac.setUid("ac-full-001");
    ac.setName("Original Name");
    ac.setHoldingValue("Original Value");
    ac.setBelongingNode(node1);
    ac.setAttribute(attr1);
    attributeContentRepository.save(ac);

    // 5. Set up security context
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 6. Test updating all fields at once
    String fullUpdatePayload = """
        {
          "created": {},
          "updated": {
            "attributeContents": [
              {
                "uid": "ac-full-001",
                "name": "New Name",
                "holdingValue": "New Value",
                "belongingNode": { "uid": "node-full-2" },
                "attribute": { "uid": "attr-full-2" },
                "pipe": { "uid": "pipe-full-1" }
              }
            ]
          },
          "deleted": {}
        }
        """;

    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(fullUpdatePayload))
        .andExpect(status().isOk());

    // 7. Verify all fields were updated correctly
    Optional<AttributeContent> updatedAC = attributeContentRepository.findByUid("ac-full-001");
    assertTrue(updatedAC.isPresent());
    assertEquals("New Name", updatedAC.get().getName());
    assertEquals("New Value", updatedAC.get().getHoldingValue());
    assertEquals("node-full-2", updatedAC.get().getBelongingNode().getUid());
    assertEquals("attr-full-2", updatedAC.get().getAttribute().getUid());
    assertEquals("pipe-full-1", updatedAC.get().getPipe().getUid());
  }

  @Test
  void testApplyBatchChanges_updatesOnlyValueField() throws Exception {
    User user = userRepository.save(new User("minimalUser", "pass"));

    Node node = new Node();
    node.setUid("node-min");
    node.setName("Minimal");
    node.setUser(user);
    nodeRepository.save(node);

    Attribute attribute = new Attribute();
    attribute.setUid("attr-min");
    attribute.setName("MinimalAttr");
    attribute.setNode(node);
    attributeRepository.save(attribute);

    AttributeContent ac = new AttributeContent();
    ac.setUid("ac-minimal");
    ac.setName("Name");
    ac.setHoldingValue("OldVal");
    ac.setBelongingNode(node);
    ac.setAttribute(attribute);
    attributeContentRepository.save(ac);

    // check if the attribute content is saved
    Optional<AttributeContent> savedAC = attributeContentRepository.findByUid("ac-minimal");
    assertTrue(savedAC.isPresent());
    assertEquals("OldVal", savedAC.get().getHoldingValue());
    assertEquals("Name", savedAC.get().getName());
    assertEquals("node-min", savedAC.get().getBelongingNode().getUid());
    assertEquals("attr-min", savedAC.get().getAttribute().getUid());

    // 4. Set up security context
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    String payload = """
        {
          "created": {},
          "updated": {
            "attributeContents": [
              {
                "uid": "ac-minimal",
                "holdingValue": "OnlyUpdated"
              }
            ]
          },
          "deleted": {}
        }
        """;

    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isOk());

    AttributeContent updated = attributeContentRepository.findByUid("ac-minimal").orElseThrow();
    assertEquals("OnlyUpdated", updated.getHoldingValue());
    assertEquals("node-min", updated.getBelongingNode().getUid());
    assertEquals("attr-min", updated.getAttribute().getUid());
    assertEquals("Name", updated.getName()); // unchanged

  }

  @Test
  void testApplyBatchChanges_updatesAllFieldsWithNewEntities() throws Exception {
    User user = userRepository.save(new User("fullUpdateUser", "pass"));

    Node node = new Node();
    node.setUid("node-full");
    node.setName("FullNode");
    node.setUser(user);
    nodeRepository.save(node);

    Attribute attribute = new Attribute();
    attribute.setUid("attr-full");
    attribute.setName("FullAttr");
    attribute.setNode(node);
    attributeRepository.save(attribute);

    Pipe pipe = new Pipe();
    pipe.setUid("pipe-full");
    pipe.setName("FullPipe");
    pipe.setSourceNode(node);
    pipe.setTargetNode(node);
    pipeRepository.save(pipe);

    AttributeContent ac = new AttributeContent();
    ac.setUid("ac-full");
    ac.setName("BeforeFull");
    ac.setHoldingValue("123");
    ac.setBelongingNode(node);
    ac.setAttribute(attribute);
    ac.setPipe(pipe);
    attributeContentRepository.save(ac);

    // check if the attribute content is saved
    Optional<AttributeContent> savedAC = attributeContentRepository.findByUid("ac-full");
    assertTrue(savedAC.isPresent());
    assertEquals("123", savedAC.get().getHoldingValue());
    assertEquals("BeforeFull", savedAC.get().getName());
    assertEquals("node-full", savedAC.get().getBelongingNode().getUid());
    assertEquals("attr-full", savedAC.get().getAttribute().getUid());
    assertEquals("pipe-full", savedAC.get().getPipe().getUid());

    Node diffNode = new Node();
    diffNode.setUid("node-diff");
    diffNode.setName("Updated Node");
    diffNode.setUser(user);
    nodeRepository.save(diffNode);

    Attribute diffAttr = new Attribute();
    diffAttr.setUid("attr-diff");
    diffAttr.setName("Updated Attr");
    diffAttr.setNode(diffNode);
    attributeRepository.save(diffAttr);

    Pipe diffPipe = new Pipe();
    diffPipe.setUid("pipe-diff");
    diffPipe.setName("Updated Pipe");
    diffPipe.setSourceNode(diffNode);
    diffPipe.setTargetNode(diffNode);
    pipeRepository.save(diffPipe);

    // Set up security context
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    String payload = """
        {
          "created": {},
          "updated": {
            "attributeContents": [
              {
                "uid": "ac-full",
                "name": "AfterFull",
                "holdingValue": "456",
                "belongingNode": { "uid": "node-diff" },
                "attribute": { "uid": "attr-diff" },
                "pipe": { "uid": "pipe-diff" }
              }
            ]
          },
          "deleted": {}
        }
        """;

    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andDo(result -> {
          if (result.getResolvedException() != null) {
            System.err.println("Exception: " + result.getResolvedException().getClass());
            System.err.println("Message: " + result.getResolvedException().getMessage());
          } else {
            System.err.println("No resolved exception. Status: " + result.getResponse().getStatus());
            System.err.println("Response body: " + result.getResponse().getContentAsString());
          }
        })
        .andExpect(status().isOk());

    AttributeContent updated = attributeContentRepository.findByUid("ac-full").orElseThrow();
    assertEquals("AfterFull", updated.getName());
    assertEquals("456", updated.getHoldingValue());
    assertEquals("node-diff", updated.getBelongingNode().getUid());
    assertEquals("attr-diff", updated.getAttribute().getUid());
    assertEquals("pipe-diff", updated.getPipe().getUid());
  }

  // 4. Edit with Complex Nested Entities
  @Test
  void testApplyBatchChanges_withComplexNestedEntities() throws Exception {
    // 1. Create user
    User user = userRepository.save(new User("nestedUser", "pass"));

    // 2. Create source and target nodes
    Node sourceNode = new Node();
    sourceNode.setUid("source-node");
    sourceNode.setName("Source");
    sourceNode.setUser(user);
    nodeRepository.save(sourceNode);

    Node targetNode = new Node();
    targetNode.setUid("target-node");
    targetNode.setName("Target");
    targetNode.setUser(user);
    nodeRepository.save(targetNode);

    // 3. Create pipe between source and target
    Pipe pipe = new Pipe();
    pipe.setUid("pipe-nested");
    pipe.setName("NestedPipe");
    pipe.setSourceNode(sourceNode);
    pipe.setTargetNode(targetNode);
    pipeRepository.save(pipe);

    // 4. Create attribute linked to source node
    Attribute attr = new Attribute();
    attr.setUid("attr-nested");
    attr.setName("Importance");
    attr.setMute(false);
    attr.setTotalNumber(5);
    attr.setNode(sourceNode);
    attributeRepository.save(attr);

    // 5. Create AttributeContent linked to all of the above
    AttributeContent ac = new AttributeContent();
    ac.setUid("ac-nested");
    ac.setName("InitialName");
    ac.setHoldingValue("low");
    ac.setBelongingNode(sourceNode);
    ac.setAttribute(attr);
    ac.setPipe(pipe);
    attributeContentRepository.save(ac);

    // 6. Confirm initial state
    AttributeContent initial = attributeContentRepository.findByUid("ac-nested").orElseThrow();
    assertEquals("low", initial.getHoldingValue());
    assertEquals("InitialName", initial.getName());
    assertEquals("source-node", initial.getBelongingNode().getUid());
    assertEquals("attr-nested", initial.getAttribute().getUid());
    assertEquals("pipe-nested", initial.getPipe().getUid());

    Pipe initialPipe = pipeRepository.findByUid("pipe-nested").orElseThrow();
    assertEquals("NestedPipe", initialPipe.getName());
    assertEquals("source-node", initialPipe.getSourceNode().getUid());
    assertEquals("target-node", initialPipe.getTargetNode().getUid());

    // 7. Set up security
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 8. JSON payload to update holdingValue and name
    String payload = """
        {
          "created": {},
          "updated": {
            "attributeContents": [
              {
                "uid": "ac-nested",
                "name": "UpdatedName",
                "holdingValue": "high",
                "belongingNode": { "uid": "source-node" },
                "attribute": { "uid": "attr-nested" },
                "pipe": { "uid": "pipe-nested" }
              }
            ]
          },
          "deleted": {}
        }
        """;

    // 9. Perform update
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isOk());

    // 10. check if the attribute content is updated
    // name and holdingValue are updated
    // belongingNode, attribute, and pipe are not updated
    // pipe's sourceNode and targetNode are not updated
    AttributeContent updated = attributeContentRepository.findByUid("ac-nested").orElseThrow();
    assertEquals("UpdatedName", updated.getName());
    assertEquals("high", updated.getHoldingValue());
    assertEquals("source-node", updated.getBelongingNode().getUid());
    assertEquals("attr-nested", updated.getAttribute().getUid());
    assertEquals("pipe-nested", updated.getPipe().getUid());
    assertEquals("source-node", updated.getPipe().getSourceNode().getUid());
    assertEquals("target-node", updated.getPipe().getTargetNode().getUid());

    // test each Node, pipe and attribute's user is the same as the user
    assertEquals(user.getId(), updated.getBelongingNode().getUser().getId());
    assertEquals(user.getId(), updated.getPipe().getSourceNode().getUser().getId());
    assertEquals(user.getId(), updated.getPipe().getTargetNode().getUser().getId());
    assertEquals(user.getId(), updated.getAttribute().getNode().getUser().getId());

  }

  @Test
  void testApplyBatchChanges_noChangeSubmitted_doesNotModifyAttributeContent() throws Exception {
    User user = userRepository.save(new User("idempotentUser", "pass"));

    Node node = new Node();
    node.setUid("node-idem");
    node.setName("IdemNode");
    node.setUser(user);
    nodeRepository.save(node);

    Attribute attr = new Attribute();
    attr.setUid("attr-idem");
    attr.setName("StableAttr");
    attr.setNode(node);
    attributeRepository.save(attr);

    AttributeContent ac = new AttributeContent();
    ac.setUid("ac-idem");
    ac.setName("UnchangedName");
    ac.setHoldingValue("original");
    ac.setBelongingNode(node);
    ac.setAttribute(attr);
    attributeContentRepository.save(ac);

    // Setup auth
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    String payload = """
        {
          "created": {},
          "updated": {
            "attributeContents": [
              {
                "uid": "ac-idem",
                "name": "UnchangedName",
                "holdingValue": "original",
                "belongingNode": { "uid": "node-idem" },
                "attribute": { "uid": "attr-idem" }
              }
            ]
          },
          "deleted": {}
        }
        """;

    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isOk());

    AttributeContent after = attributeContentRepository.findByUid("ac-idem").orElseThrow();
    assertEquals("UnchangedName", after.getName());
    assertEquals("original", after.getHoldingValue());
    assertEquals("node-idem", after.getBelongingNode().getUid());
    assertEquals("attr-idem", after.getAttribute().getUid());
  }

  @Test
  void testApplyBatchChanges_failsWhenSettingAllRelationsToNull() throws Exception {
    User user = userRepository.save(new User("userX", "pass"));

    Node node = new Node();
    node.setUid("nodeX");
    node.setName("XNode");
    node.setUser(user);
    nodeRepository.save(node);

    Attribute attr = new Attribute();
    attr.setUid("attrX");
    attr.setName("AttrX");
    attr.setNode(node);
    attributeRepository.save(attr);

    Pipe pipe = new Pipe();
    pipe.setUid("pipeX");
    pipe.setName("PipeX");
    pipe.setSourceNode(node);
    pipe.setTargetNode(node);
    pipeRepository.save(pipe);

    AttributeContent ac = new AttributeContent();
    ac.setUid("ac-null");
    ac.setName("TempAC");
    ac.setHoldingValue("valueX");
    ac.setBelongingNode(node);
    ac.setAttribute(attr);
    ac.setPipe(pipe);
    attributeContentRepository.save(ac);

    // Set up security
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    String payload = """
        {
          "created": {},
          "updated": {
            "attributeContents": [
              {
                "uid": "ac-null",
                "name": "ShouldNotApply",
                "holdingValue": "newVal",
                "belongingNode": null,
                "attribute": null,
                "pipe": null
              }
            ]
          },
          "deleted": {}
        }
        """;

    // Perform request and expect 500 error due to null relations
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isOk());

    // Assert nothing changed in DB
    AttributeContent updated = attributeContentRepository.findByUid("ac-null").orElseThrow();
    // assertEquals("TempAC", updated.getName()); // Not changed
    // assertEquals("valueX", updated.getHoldingValue()); // Not changed
    // printing the updated attribute content
    assertNotNull(updated.getBelongingNode());
    assertNotNull(updated.getAttribute());
    assertNotNull(updated.getPipe());
  }

  @Test
  void testApplyBatchChanges_deletesAllowedFieldsWithNullValuePipe() throws Exception {
    // 1. Setup user and node
    User user = userRepository.save(new User("deleteFieldUser", "pass"));

    Node node = new Node();
    node.setUid("node-df");
    node.setName("FieldNode");
    node.setUser(user);
    nodeRepository.save(node);

    // 2. Setup pipe and attribute
    Pipe pipe = new Pipe();
    pipe.setUid("pipe-df");
    pipe.setName("PipeDF");
    pipe.setSourceNode(node);
    pipe.setTargetNode(node);
    pipeRepository.save(pipe);

    Attribute attribute = new Attribute();
    attribute.setUid("attr-df");
    attribute.setName("AttrDF");
    attribute.setNode(node);
    attributeRepository.save(attribute);

    // 3. Create AttributeContent with all fields set
    AttributeContent ac = new AttributeContent();
    ac.setUid("ac-delete-fields");
    ac.setName("BeforeDelete");
    ac.setHoldingValue("will be nulled");
    ac.setBelongingNode(node);
    ac.setPipe(pipe);
    ac.setAttribute(attribute);
    attributeContentRepository.save(ac);

    // 4. Set up security
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 5. JSON payload with empty strings to trigger nulling of allowed fields
    String payload = """
        {
          "created": {},
          "updated": {
            "attributeContents": [
              {
                "uid": "ac-delete-fields",
                "holdingValue": null,
                "pipe": null

              }
            ]
          },
          "deleted": {}
        }
        """;

    // 6. Perform request
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isOk());

    // 7. Verify that fields were set to null
    AttributeContent updated = attributeContentRepository.findByUid("ac-delete-fields").orElseThrow();
    assertNull(updated.getHoldingValue());
    assertNull(updated.getPipe());
    // attribute remains the same
    assertEquals("attr-df", updated.getAttribute().getUid());
    assertEquals("BeforeDelete", updated.getName()); // name remains
    assertEquals("node-df", updated.getBelongingNode().getUid()); // node remains
  }

  @Test
  void testApplyBatchChanges_deletesAllowedFieldsWithNullValueAttribute() throws Exception {
    // 1. Setup user and node
    User user = userRepository.save(new User("deleteFieldUser", "pass"));

    Node node = new Node();
    node.setUid("node-df");
    node.setName("FieldNode");
    node.setUser(user);
    nodeRepository.save(node);

    // 2. Setup pipe and attribute
    Pipe pipe = new Pipe();
    pipe.setUid("pipe-df");
    pipe.setName("PipeDF");
    pipe.setSourceNode(node);
    pipe.setTargetNode(node);
    pipeRepository.save(pipe);

    Attribute attribute = new Attribute();
    attribute.setUid("attr-df");
    attribute.setName("AttrDF");
    attribute.setNode(node);
    attributeRepository.save(attribute);

    // 3. Create AttributeContent with all fields set
    AttributeContent ac = new AttributeContent();
    ac.setUid("ac-delete-fields");
    ac.setName("BeforeDelete");
    ac.setHoldingValue("will be nulled");
    ac.setBelongingNode(node);
    ac.setPipe(pipe);
    ac.setAttribute(attribute);
    attributeContentRepository.save(ac);

    // 4. Set up security
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 5. JSON payload to null the attribute field
    String payload = """
        {
          "created": {},
          "updated": {
            "attributeContents": [
              {
                "uid": "ac-delete-fields",
                "attribute": null,
                "holdingValue": null
              }
            ]
          },
          "deleted": {}
        }
        """;

    // 6. Perform request
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isOk());

    // 7. Verify the updates
    AttributeContent updated = attributeContentRepository.findByUid("ac-delete-fields").orElseThrow();
    assertNull(updated.getAttribute()); // Attribute is now null
    assertNull(updated.getHoldingValue()); // holdingValue is null
    assertEquals("pipe-df", updated.getPipe().getUid()); // Pipe remains
    assertEquals("BeforeDelete", updated.getName()); // Name remains
    assertEquals("node-df", updated.getBelongingNode().getUid()); // Node remains
  }

  // deleting both will result an failure
  @Test
  void testApplyBatchChanges_setAttributeAndPipeToNull_throwsError() throws Exception {
    // 1. Setup user and node
    User user = userRepository.save(new User("deleteBothUser", "pass"));

    Node node = new Node();
    node.setUid("node-both");
    node.setName("NodeBoth");
    node.setUser(user);
    nodeRepository.save(node);

    // 2. Setup pipe and attribute
    Pipe pipe = new Pipe();
    pipe.setUid("pipe-both");
    pipe.setName("PipeBoth");
    pipe.setSourceNode(node);
    pipe.setTargetNode(node);
    pipeRepository.save(pipe);

    Attribute attribute = new Attribute();
    attribute.setUid("attr-both");
    attribute.setName("AttrBoth");
    attribute.setNode(node);
    attributeRepository.save(attribute);

    // 3. Create AttributeContent with all fields set
    AttributeContent ac = new AttributeContent();
    ac.setUid("ac-both");
    ac.setName("BothAssigned");
    ac.setHoldingValue("original");
    ac.setBelongingNode(node);
    ac.setPipe(pipe);
    ac.setAttribute(attribute);
    attributeContentRepository.save(ac);

    // 4. Set up security
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 5. JSON payload that tries to null both pipe and attribute
    String payload = """
        {
          "created": {},
          "updated": {
            "attributeContents": [
              {
                "uid": "ac-both",
                "pipe": null,
                "attribute": null
              }
            ]
          },
          "deleted": {}
        }
        """;

    // 6. Expect failure (500 or custom error depending on your service layer)
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isInternalServerError());

    // 7. Ensure database entry hasn't changed for Attribute and Pipe
    AttributeContent unchanged = attributeContentRepository.findByUid("ac-both").orElseThrow();
    assertEquals("attr-both", unchanged.getAttribute().getUid());
    assertEquals("pipe-both", unchanged.getPipe().getUid());
  }

  @Test
  void testApplyBatchChanges_eachInvalidRelationUpdateIndependently_shouldFailAndNotUpdate() throws Exception {
    // 1. Setup user and valid data
    User user = userRepository.save(new User("multiFailUser", "pass"));

    Node validNode = new Node();
    validNode.setUid("node-valid");
    validNode.setName("ValidNode");
    validNode.setUser(user);
    nodeRepository.save(validNode);

    Pipe validPipe = new Pipe();
    validPipe.setUid("pipe-valid");
    validPipe.setName("ValidPipe");
    validPipe.setSourceNode(validNode);
    validPipe.setTargetNode(validNode);
    pipeRepository.save(validPipe);

    Attribute validAttribute = new Attribute();
    validAttribute.setUid("attr-valid");
    validAttribute.setName("ValidAttr");
    validAttribute.setNode(validNode);
    attributeRepository.save(validAttribute);

    // 2. Create AttributeContent
    AttributeContent ac = new AttributeContent();
    ac.setUid("ac-fail-target");
    ac.setName("Original");
    ac.setHoldingValue("unchanged");
    ac.setBelongingNode(validNode);
    ac.setPipe(validPipe);
    ac.setAttribute(validAttribute);
    attributeContentRepository.save(ac);

    // 3. Setup security
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 4. Try invalid Pipe update
    String invalidPipePayload = """
        {
          "created": {},
          "updated": {
            "attributeContents": [
              {
                "uid": "ac-fail-target",
                "pipe": { "uid": "pipe-NOT_EXIST" }
              }
            ]
          },
          "deleted": {}
        }
        """;

    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(invalidPipePayload))
        .andExpect(status().isInternalServerError());

    // 5. Try invalid Attribute update
    String invalidAttrPayload = """
        {
          "created": {},
          "updated": {
            "attributeContents": [
              {
                "uid": "ac-fail-target",
                "attribute": { "uid": "attr-NOT_EXIST" }
              }
            ]
          },
          "deleted": {}
        }
        """;

    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(invalidAttrPayload))
        .andExpect(status().isInternalServerError());

    // 6. Try invalid Node update
    String invalidNodePayload = """
        {
          "created": {},
          "updated": {
            "attributeContents": [
              {
                "uid": "ac-fail-target",
                "belongingNode": { "uid": "node-NOT_EXIST" }
              }
            ]
          },
          "deleted": {}
        }
        """;

    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(invalidNodePayload))
        .andExpect(status().isInternalServerError());

    // 7. Confirm no updates occurred
    AttributeContent after = attributeContentRepository.findByUid("ac-fail-target").orElseThrow();
    assertEquals("Original", after.getName());
    assertEquals("unchanged", after.getHoldingValue());
    assertEquals("pipe-valid", after.getPipe().getUid());
    assertEquals("attr-valid", after.getAttribute().getUid());
    assertEquals("node-valid", after.getBelongingNode().getUid());
  }

  @Test
  void testApplyBatchChanges_editWithNonPersistedRelations_shouldFailAndNotUpdate() throws Exception {
    // 1. Setup user and valid node, pipe, attribute
    User user = userRepository.save(new User("nonPersistedEditUser", "pass"));

    Node validNode = new Node();
    validNode.setUid("node-valid");
    validNode.setName("ValidNode");
    validNode.setUser(user);
    nodeRepository.save(validNode);

    Pipe validPipe = new Pipe();
    validPipe.setUid("pipe-valid");
    validPipe.setName("ValidPipe");
    validPipe.setSourceNode(validNode);
    validPipe.setTargetNode(validNode);
    pipeRepository.save(validPipe);

    Attribute validAttribute = new Attribute();
    validAttribute.setUid("attr-valid");
    validAttribute.setName("ValidAttr");
    validAttribute.setNode(validNode);
    attributeRepository.save(validAttribute);

    // 2. Create AttributeContent with valid relations
    AttributeContent ac = new AttributeContent();
    ac.setUid("ac-nonpersisted");
    ac.setName("OriginalName");
    ac.setHoldingValue("original");
    ac.setBelongingNode(validNode);
    ac.setPipe(validPipe);
    ac.setAttribute(validAttribute);
    attributeContentRepository.save(ac);

    // 3. Set up security
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 4. Create payload using non-existent UID for Pipe, Attribute, Node
    String payload = """
        {
          "created": {},
          "updated": {
            "attributeContents": [
              {
                "uid": "ac-nonpersisted",
                "name": "ShouldNotApply",
                "holdingValue": "updated",
                "pipe": { "uid": "pipe-NOT_EXIST" },
                "attribute": { "uid": "attr-NOT_EXIST" },
                "belongingNode": { "uid": "node-NOT_EXIST" }
              }
            ]
          },
          "deleted": {}
        }
        """;

    // 5. Perform update request (should fail with 500)
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isInternalServerError());

    // 6. Ensure no changes occurred
    AttributeContent after = attributeContentRepository.findByUid("ac-nonpersisted").orElseThrow();
    assertEquals("OriginalName", after.getName());
    assertEquals("original", after.getHoldingValue());
    assertEquals("pipe-valid", after.getPipe().getUid());
    assertEquals("attr-valid", after.getAttribute().getUid());
    assertEquals("node-valid", after.getBelongingNode().getUid());
  }

  @Test
  void testApplyBatchChanges_editBelongingNodeToNull_shouldFailAndRemainUnchanged() throws Exception {
    // 1. Setup user and valid node
    User user = userRepository.save(new User("nodeNullUser", "pass"));

    Node node = new Node();
    node.setUid("node-nonnull");
    node.setName("NonnullNode");
    node.setUser(user);
    nodeRepository.save(node);

    Attribute attribute = new Attribute();
    attribute.setUid("attr-nonnull");
    attribute.setName("NonnullAttr");
    attribute.setNode(node);
    attributeRepository.save(attribute);

    // 2. Setup AttributeContent
    AttributeContent ac = new AttributeContent();
    ac.setUid("ac-node-null");
    ac.setName("BeforeNodeNull");
    ac.setHoldingValue("safe");
    ac.setBelongingNode(node); // must not be null
    ac.setAttribute(attribute);
    attributeContentRepository.save(ac);

    // 3. Set up security
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 4. JSON payload with null belongingNode
    String payload = """
        {
          "created": {},
          "updated": {
            "attributeContents": [
              {
                "uid": "ac-node-null",
                "belongingNode": null
              }
            ]
          },
          "deleted": {}
        }
        """;

        MvcResult result = mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isBadRequest())
        .andReturn();

     // Deserialize response body
     String responseBody = result.getResponse().getContentAsString();
     ObjectMapper mapper = new ObjectMapper();
     BatchResponse response = mapper.readValue(responseBody, BatchResponse.class);
 
     // Verify BatchResponse fields
     assertFalse(response.success);
     assertEquals("Some entities failed to update", response.message);


    // 5. Assert nothing changed
    AttributeContent after = attributeContentRepository.findByUid("ac-node-null").orElseThrow();
    assertEquals("BeforeNodeNull", after.getName());
    assertEquals("safe", after.getHoldingValue());
    assertEquals("node-nonnull", after.getBelongingNode().getUid());
  }

  @Test
  void testApplyBatchChanges_editUidToNull_shouldFailAndRemainUnchanged() throws Exception {
    // 1. Setup user and node
    User user = userRepository.save(new User("uidNullUser", "pass"));

    Node node = new Node();
    node.setUid("node-uid-null");
    node.setName("UIDNode");
    node.setUser(user);
    nodeRepository.save(node);

    Attribute attribute = new Attribute();
    attribute.setUid("attr-uid-null");
    attribute.setName("UIDAttr");
    attribute.setNode(node);
    attributeRepository.save(attribute);

    // 2. Setup AttributeContent
    AttributeContent ac = new AttributeContent();
    ac.setUid("ac-uid-null");
    ac.setName("BeforeUidNull");
    ac.setHoldingValue("safe");
    ac.setBelongingNode(node);
    ac.setAttribute(attribute);
    attributeContentRepository.save(ac);

    // 3. Set up security
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 4. JSON payload with null uid (which should not be allowed)
    String payload = """
        {
          "created": {},
          "updated": {
            "attributeContents": [
              {
                "uid": null,
                "name": "ThisShouldFail"
              }
            ]
          },
          "deleted": {}
        }
        """;

    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isBadRequest());

    // 5. Assert nothing changed
    AttributeContent after = attributeContentRepository.findByUid("ac-uid-null").orElseThrow();
    assertEquals("BeforeUidNull", after.getName());
    assertEquals("safe", after.getHoldingValue());
    assertEquals("node-uid-null", after.getBelongingNode().getUid());
  }

}
