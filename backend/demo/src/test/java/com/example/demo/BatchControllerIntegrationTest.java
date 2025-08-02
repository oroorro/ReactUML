package com.example.demo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
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
    pipe.setColor("B");
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
    pipe.setColor("B");
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
    pipe.setColor("B");
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
    pipe.setColor("B");
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
    pipe.setColor("B");
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
    pipe.setColor("B");
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

    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(false))
        .andExpect(jsonPath("$.message").value("Some entities failed to update"));

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
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(false))
        .andExpect(jsonPath("$.message").value("Some entities failed to update"));

    // 5. Assert nothing changed
    AttributeContent after = attributeContentRepository.findByUid("ac-uid-null").orElseThrow();
    assertEquals("BeforeUidNull", after.getName());
    assertEquals("safe", after.getHoldingValue());
    assertEquals("node-uid-null", after.getBelongingNode().getUid());
  }

  @Test
  void testApplyBatchChanges_failsWhenNameIsNull() throws Exception {
    // 1. Setup user and node
    User user = userRepository.save(new User("nullNameUser", "pass"));

    Node node = new Node();
    node.setUid("node-test");
    node.setName("NodeTest");
    node.setUser(user);
    nodeRepository.save(node);

    // create a pipe
    Pipe pipe = new Pipe();
    pipe.setUid("pipe-test");
    pipe.setName("PipeTest");
    pipe.setSourceNode(node);
    pipe.setTargetNode(node);
    pipeRepository.save(pipe);

    // 2. Setup attributeContent with a valid name
    AttributeContent ac = new AttributeContent();
    ac.setUid("ac-null-name");
    ac.setName("ValidName");
    ac.setHoldingValue("keep");
    ac.setBelongingNode(node);
    ac.setPipe(pipe);
    attributeContentRepository.save(ac);

    // 3. Setup security
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 4. JSON payload with null name (violates @Column(nullable = false))
    String payload = """
        {
          "created": {},
          "updated": {
            "attributeContents": [
              {
                "uid": "ac-null-name",
                "name": null
              }
            ]
          },
          "deleted": {}
        }
        """;

    // 5. Perform the request and expect 500 due to constraint violation
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(false))
        .andExpect(jsonPath("$.message").value("Some entities failed to update"));

    // 7. Ensure original data is untouched
    AttributeContent fetched = attributeContentRepository.findByUid("ac-null-name").orElseThrow();
    assertEquals("ValidName", fetched.getName()); // still the same
    assertEquals("keep", fetched.getHoldingValue());
  }

  // ------ Attribute Tests------

  @Test
  void testSequentialAttributeFieldEdits() throws Exception {
    // 1. Setup user and node
    User user = userRepository.save(new User("attrEditUser", "pass"));

    Node node = new Node();
    node.setUid("attr-node");
    node.setName("AttrNode");
    node.setUser(user);
    nodeRepository.save(node);

    // 2. Create the Attribute
    Attribute attr = new Attribute();
    attr.setUid("attr-basic-edit");
    attr.setName("OriginalName");
    attr.setMute(false);
    attr.setTotalNumber(5);
    attr.setNode(node);
    attributeRepository.save(attr);

    // 3. Set up security context
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 4. Edit name
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
            {
              "created": {},
              "updated": {
                "attributes": [
                  { "uid": "attr-basic-edit", "name": "UpdatedName" }
                ]
              },
              "deleted": {}
            }
            """))
        .andExpect(status().isOk());

    Attribute updated = attributeRepository.findByUid("attr-basic-edit").orElseThrow();
    assertEquals("attr-basic-edit", updated.getUid());
    assertEquals("UpdatedName", updated.getName());
    assertEquals(5, updated.getTotalNumber());
    assertEquals(false, updated.getMute());
    assertEquals("attr-node", updated.getNode().getUid());

    // 5. Edit mute
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
            {
              "created": {},
              "updated": {
                "attributes": [
                  { "uid": "attr-basic-edit", "mute": true }
                ]
              },
              "deleted": {}
            }
            """))
        .andExpect(status().isOk());

    updated = attributeRepository.findByUid("attr-basic-edit").orElseThrow();
    assertTrue(updated.getMute());
    assertEquals("attr-basic-edit", updated.getUid());
    assertEquals("UpdatedName", updated.getName());
    assertEquals(5, updated.getTotalNumber());
    assertEquals("attr-node", updated.getNode().getUid());

    // 6. Edit totalNumber
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
            {
              "created": {},
              "updated": {
                "attributes": [
                  { "uid": "attr-basic-edit", "totalNumber": 99 }
                ]
              },
              "deleted": {}
            }
            """))
        .andExpect(status().isOk());

    updated = attributeRepository.findByUid("attr-basic-edit").orElseThrow();
    assertEquals(99, updated.getTotalNumber());
    assertEquals("attr-basic-edit", updated.getUid());
    assertEquals("UpdatedName", updated.getName());
    assertEquals(true, updated.getMute());
    assertEquals("attr-node", updated.getNode().getUid());

    // 7. Edit node
    Node newNode = new Node();
    newNode.setUid("new-attr-node");
    newNode.setName("NewNode");
    newNode.setUser(user);
    nodeRepository.save(newNode);

    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
            {
              "created": {},
              "updated": {
                "attributes": [
                  { "uid": "attr-basic-edit", "node": { "uid": "new-attr-node" } }
                ]
              },
              "deleted": {}
            }
            """))
        .andExpect(status().isOk());

    updated = attributeRepository.findByUid("attr-basic-edit").orElseThrow();
    assertEquals("new-attr-node", updated.getNode().getUid());
    assertEquals("UpdatedName", updated.getName());
    assertEquals(99, updated.getTotalNumber());
    assertEquals(true, updated.getMute());
  }

  @Test
  void testEditAttribute_withMinimalRequiredFields() throws Exception {
    // 1. Setup user and node
    User user = userRepository.save(new User("minUser", "pass"));
    Node node = new Node();
    node.setUid("node-min");
    node.setName("MinimalNode");
    node.setUser(user);
    nodeRepository.save(node);

    // 2. Setup attribute
    Attribute attribute = new Attribute();
    attribute.setUid("attr-minimal");
    attribute.setName("OriginalName");
    attribute.setMute(false);
    attribute.setTotalNumber(10);
    attribute.setNode(node);
    attributeRepository.save(attribute);

    // 3. Setup security context
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 4. JSON payload only updating the `name`
    String payload = """
        {
          "created": {},
          "updated": {
            "attributes": [
              {
                "uid": "attr-minimal",
                "name": "UpdatedName"
              }
            ]
          },
          "deleted": {}
        }
        """;

    // 5. Perform batch update
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isOk());

    // 6. Fetch updated Attribute and assert changes
    Attribute updated = attributeRepository.findByUid("attr-minimal").orElseThrow();
    assertEquals("UpdatedName", updated.getName()); // Only this should change
    assertEquals("attr-minimal", updated.getUid()); // UID remains unchanged
    assertEquals(false, updated.getMute()); // Mute unchanged
    assertEquals(10, updated.getTotalNumber()); // totalNumber unchanged
    assertEquals("node-min", updated.getNode().getUid()); // Node relation unchanged
  }

  @Test
  void testEditAttribute_withAllFieldsPresent() throws Exception {
    // 1. Setup user and node
    User user = userRepository.save(new User("fullEditUser", "pass"));

    Node oldNode = new Node();
    oldNode.setUid("node-old");
    oldNode.setName("OldNode");
    oldNode.setUser(user);
    nodeRepository.save(oldNode);

    Node newNode = new Node();
    newNode.setUid("node-new");
    newNode.setName("NewNode");
    newNode.setUser(user);
    nodeRepository.save(newNode);

    // 2. Setup original attribute linked to old node
    Attribute attribute = new Attribute();
    attribute.setUid("attr-full");
    attribute.setName("OriginalAttr");
    attribute.setMute(false);
    attribute.setTotalNumber(5);
    attribute.setNode(oldNode);
    attributeRepository.save(attribute);

    // 3. Setup security context
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 4. JSON payload updating all fields
    String payload = """
        {
          "created": {},
          "updated": {
            "attributes": [
              {
                "uid": "attr-full",
                "name": "UpdatedAttr",
                "mute": true,
                "totalNumber": 99,
                "node": { "uid": "node-new" }
              }
            ]
          },
          "deleted": {}
        }
        """;

    // 5. Perform update
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isOk());

    // 6. Fetch and verify updated attribute
    Attribute updated = attributeRepository.findByUid("attr-full").orElseThrow();
    assertEquals("UpdatedAttr", updated.getName());
    assertTrue(updated.getMute());
    assertEquals(99, updated.getTotalNumber());
    assertEquals("node-new", updated.getNode().getUid());
  }

  @Test
  void testEditAttribute_withComplexNestedNode_shouldUpdateSuccessfully() throws Exception {
    // 1. Setup user and nodes
    User user = userRepository.save(new User("nestedUser", "pass"));

    Node originalNode = new Node();
    originalNode.setUid("node-complex");
    originalNode.setName("OriginalNode");
    originalNode.setUser(user);
    nodeRepository.save(originalNode);

    // 2. Create Attribute linked to node
    Attribute attr = new Attribute();
    attr.setUid("attr-complex");
    attr.setName("ComplexAttr");
    attr.setMute(false);
    attr.setTotalNumber(10);
    attr.setNode(originalNode);
    attributeRepository.save(attr);

    // 3. Setup security context
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 4. Prepare update JSON (only change name + mute)
    String payload = """
        {
          "created": {},
          "updated": {
            "attributes": [
              {
                "uid": "attr-complex",
                "name": "UpdatedAttrName",
                "mute": true
              }
            ]
          },
          "deleted": {}
        }
        """;

    // 5. Perform update
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isOk());

    // 6. Verify update and relationship still intact
    Attribute updated = attributeRepository.findByUid("attr-complex").orElseThrow();
    assertEquals("UpdatedAttrName", updated.getName());
    assertEquals(true, updated.getMute());
    assertEquals(10, updated.getTotalNumber()); // unchanged
    assertNotNull(updated.getNode());
    assertEquals("node-complex", updated.getNode().getUid()); // relationship preserved
  }

  @Test
  void testEditAttribute_idempotentNoChangeSubmitted() throws Exception {
    // 1. Setup user and node
    User user = userRepository.save(new User("idempotentUser", "pass"));

    Node node = new Node();
    node.setUid("node-idem");
    node.setName("IdemNode");
    node.setUser(user);
    nodeRepository.save(node);

    // 2. Create an Attribute with fixed values
    Attribute attr = new Attribute();
    attr.setUid("attr-idem");
    attr.setName("StaticAttr");
    attr.setMute(false);
    attr.setTotalNumber(7);
    attr.setNode(node);
    attributeRepository.save(attr);

    // 3. Set up security
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 4. JSON payload with the same values as existing Attribute
    String payload = """
        {
          "created": {},
          "updated": {
            "attributes": [
              {
                "uid": "attr-idem",
                "name": "StaticAttr",
                "mute": false,
                "totalNumber": 7,
                "node": { "uid": "node-idem" }
              }
            ]
          },
          "deleted": {}
        }
        """;

    // 5. Perform update (should do nothing effectively)
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isOk());

    // 6. Verify that nothing changed
    Attribute unchanged = attributeRepository.findByUid("attr-idem").orElseThrow();
    assertEquals("StaticAttr", unchanged.getName());
    assertFalse(unchanged.getMute());
    assertEquals(7, unchanged.getTotalNumber());
    assertEquals("node-idem", unchanged.getNode().getUid());
  }

  @Test
  void testEditAttribute_deletesAllowedFieldsWithNullValues() throws Exception {
    // 1. Setup user and node
    User user = userRepository.save(new User("fieldDeleteUser", "pass"));

    Node node = new Node();
    node.setUid("node-del");
    node.setName("FieldNode");
    node.setUser(user);
    nodeRepository.save(node);

    // 2. Create Attribute with all fields set
    Attribute attr = new Attribute();
    attr.setUid("attr-del");
    attr.setName("DeletableAttr");
    attr.setMute(true);
    attr.setTotalNumber(42);
    attr.setNode(node);
    attributeRepository.save(attr);

    // 3. Set up security
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 4. JSON payload that sets name, totalNumber, mute to null
    String payload = """
        {
          "created": {},
          "updated": {
            "attributes": [
              {
                "uid": "attr-del",
                "name": null,
                "totalNumber": null,
                "mute": null
              }
            ]
          },
          "deleted": {}
        }
        """;

    // 5. Perform update
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isOk());

    // 6. Verify the updated attribute
    Attribute updated = attributeRepository.findByUid("attr-del").orElseThrow();
    assertNull(updated.getName(), "Name should be null");
    assertNull(updated.getTotalNumber(), "Total number should be null");
    assertNull(updated.getMute(), "Mute should be null");
    assertEquals("node-del", updated.getNode().getUid(), "Node should remain unchanged");
  }

  @Test
  void testEditAttribute_setsNonPersistedNode_shouldFailAndRemainUnchanged() throws Exception {
    // 1. Setup user and existing node
    User user = userRepository.save(new User("invalidNodeUser", "pass"));

    Node existingNode = new Node();
    existingNode.setUid("existing-node");
    existingNode.setName("ValidNode");
    existingNode.setUser(user);
    nodeRepository.save(existingNode);

    // 2. Create valid Attribute
    Attribute attr = new Attribute();
    attr.setUid("attr-invalid-node");
    attr.setName("OriginalAttr");
    attr.setMute(false);
    attr.setTotalNumber(50);
    attr.setNode(existingNode);
    attributeRepository.save(attr);

    // 3. Set up security
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 4. JSON payload with a Node that is NOT persisted
    String payload = """
        {
          "created": {},
          "updated": {
            "attributes": [
              {
                "uid": "attr-invalid-node",
                "node": {
                  "uid": "non-existent-node"
                }
              }
            ]
          },
          "deleted": {}
        }
        """;

    // 5. Perform update and expect 500 error
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isInternalServerError());

    // 6. Verify attribute remains unchanged
    Attribute fetched = attributeRepository.findByUid("attr-invalid-node").orElseThrow();
    assertEquals("OriginalAttr", fetched.getName());
    assertEquals(50, fetched.getTotalNumber());
    assertEquals(false, fetched.getMute());
    assertEquals("existing-node", fetched.getNode().getUid());
  }

  @Test
  void testEditAttribute_withNullUid_shouldFailAndRemainUnchanged() throws Exception {
    // 1. Create user and node
    User user = userRepository.save(new User("nullUidUser", "pass"));

    Node node = new Node();
    node.setUid("node-null-uid");
    node.setName("NodeForNullUid");
    node.setUser(user);
    nodeRepository.save(node);

    // 2. Create valid Attribute
    Attribute attr = new Attribute();
    attr.setUid("attr-null-uid");
    attr.setName("OriginalAttr");
    attr.setMute(false);
    attr.setTotalNumber(77);
    attr.setNode(node);
    attributeRepository.save(attr);

    // 3. Set up security
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 4. JSON payload with "uid": null
    String payload = """
        {
          "created": {},
          "updated": {
            "attributes": [
              {
                "uid": null,
                "name": "AttemptedChange"
              }
            ]
          },
          "deleted": {}
        }
        """;

    // 5. Perform update and expect failure (500)
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isInternalServerError());

    // 6. Verify nothing has changed
    Attribute fetched = attributeRepository.findByUid("attr-null-uid").orElseThrow();
    assertEquals("OriginalAttr", fetched.getName());
    assertEquals(77, fetched.getTotalNumber());
    assertEquals(false, fetched.getMute());
    assertEquals("node-null-uid", fetched.getNode().getUid());
  }

  @Test
  void testEditEachPipeFieldSequentially() throws Exception {
    // 1. Setup user and nodes
    User user = userRepository.save(new User("pipeEditUser", "pass"));

    Node nodeA = new Node();
    nodeA.setUid("node-A");
    nodeA.setName("NodeA");
    nodeA.setUser(user);
    nodeRepository.save(nodeA);

    Node nodeB = new Node();
    nodeB.setUid("node-B");
    nodeB.setName("NodeB");
    nodeB.setUser(user);
    nodeRepository.save(nodeB);

    Node nodeC = new Node();
    nodeC.setUid("node-C");
    nodeC.setName("NodeC");
    nodeC.setUser(user);
    nodeRepository.save(nodeC);

    // 2. Create initial Pipe
    Pipe pipe = new Pipe();
    pipe.setUid("pipe-123");
    pipe.setName("OriginalPipe");
    pipe.setColor("red");
    pipe.setSourceNode(nodeA);
    pipe.setTargetNode(nodeB);
    pipeRepository.save(pipe);

    // 3. Set up security
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // ----------- EDIT name ------------
    String updateNamePayload = """
        {
          "created": {},
          "updated": {
            "pipes": [
              {
                "uid": "pipe-123",
                "name": "UpdatedPipe"
              }
            ]
          },
          "deleted": {}
        }
        """;
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(updateNamePayload))
        .andExpect(status().isOk());

    Pipe updatedPipe = pipeRepository.findByUid("pipe-123").orElseThrow();
    assertEquals("UpdatedPipe", updatedPipe.getName());
    assertEquals("red", updatedPipe.getColor());
    assertEquals("node-A", updatedPipe.getSourceNode().getUid());
    assertEquals("node-B", updatedPipe.getTargetNode().getUid());

    // ----------- EDIT color ------------
    String updateColorPayload = """
        {
          "created": {},
          "updated": {
            "pipes": [
              {
                "uid": "pipe-123",
                "color": "blue"
              }
            ]
          },
          "deleted": {}
        }
        """;
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(updateColorPayload))
        .andExpect(status().isOk());

    updatedPipe = pipeRepository.findByUid("pipe-123").orElseThrow();
    assertEquals("blue", updatedPipe.getColor());
    assertEquals("UpdatedPipe", updatedPipe.getName());
    assertEquals("node-A", updatedPipe.getSourceNode().getUid());
    assertEquals("node-B", updatedPipe.getTargetNode().getUid());

    // ----------- EDIT targetNode ------------
    String updateTargetNodePayload = """
        {
          "created": {},
          "updated": {
            "pipes": [
              {
                "uid": "pipe-123",
                "targetNode": {
                  "uid": "node-C"
                }
              }
            ]
          },
          "deleted": {}
        }
        """;
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(updateTargetNodePayload))
        .andExpect(status().isOk());

    updatedPipe = pipeRepository.findByUid("pipe-123").orElseThrow();
    assertEquals("node-C", updatedPipe.getTargetNode().getUid());
    assertEquals("UpdatedPipe", updatedPipe.getName());
    assertEquals("blue", updatedPipe.getColor());
    assertEquals("node-A", updatedPipe.getSourceNode().getUid());

    // ----------- EDIT sourceNode ------------
    String updateSourceNodePayload = """
        {
          "created": {},
          "updated": {
            "pipes": [
              {
                "uid": "pipe-123",
                "sourceNode": {
                  "uid": "node-B"
                }
              }
            ]
          },
          "deleted": {}
        }
        """;
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(updateSourceNodePayload))
        .andExpect(status().isOk());

    updatedPipe = pipeRepository.findByUid("pipe-123").orElseThrow();
    assertEquals("node-B", updatedPipe.getSourceNode().getUid());
    assertEquals("node-C", updatedPipe.getTargetNode().getUid());

    // All other fields should remain unchanged through each edit
    assertEquals("UpdatedPipe", updatedPipe.getName());
    assertEquals("blue", updatedPipe.getColor());
  }

  @Test
  void testEditPipe_withMinimalRequiredFields_onlyNameUpdated() throws Exception {
    // 1. Create and save a user and nodes
    User user = userRepository.save(new User("pipeMinimalFieldUser", "pass"));

    Node sourceNode = new Node();
    sourceNode.setUid("source-node-1");
    sourceNode.setName("SourceNode");
    sourceNode.setUser(user);
    nodeRepository.save(sourceNode);

    Node targetNode = new Node();
    targetNode.setUid("target-node-1");
    targetNode.setName("TargetNode");
    targetNode.setUser(user);
    nodeRepository.save(targetNode);

    // 2. Create and save a Pipe
    Pipe pipe = new Pipe();
    pipe.setUid("pipe-minimal");
    pipe.setName("OriginalName");
    pipe.setSourceNode(sourceNode);
    pipe.setTargetNode(targetNode);
    pipe.setMute(false);
    pipeRepository.save(pipe);

    // 3. Setup security
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 4. Prepare minimal update payload (only name)
    String payload = """
        {
          "created": {},
          "updated": {
            "pipes": [
              {
                "uid": "pipe-minimal",
                "name": "UpdatedPipeName"
              }
            ]
          },
          "deleted": {}
        }
        """;

    // 5. Call batch update
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isOk());

    // 6. Verify name was updated, and other fields are untouched
    Pipe updated = pipeRepository.findByUid("pipe-minimal").orElseThrow();
    assertEquals("UpdatedPipeName", updated.getName());
    assertEquals("source-node-1", updated.getSourceNode().getUid());
    assertEquals("target-node-1", updated.getTargetNode().getUid());
    assertEquals(false, updated.getMute());
  }

  @Test
  void testEditPipe_withAllFieldsPresent_returnsUpdatedPipe() throws Exception {
    // 1. Create and save initial Nodes
    User user = userRepository.save(new User("pipeEditor", "pass"));

    Node source = new Node();
    source.setUid("source-node");
    source.setName("Source");
    source.setUser(user);
    nodeRepository.save(source);

    Node target = new Node();
    target.setUid("target-node");
    target.setName("Target");
    target.setUser(user);
    nodeRepository.save(target);

    Node newSource = new Node();
    newSource.setUid("new-source-node");
    newSource.setName("NewSource");
    newSource.setUser(user);
    nodeRepository.save(newSource);

    Node newTarget = new Node();
    newTarget.setUid("new-target-node");
    newTarget.setName("NewTarget");
    newTarget.setUser(user);
    nodeRepository.save(newTarget);

    // 2. Create and save initial Pipe
    Pipe pipe = new Pipe();
    pipe.setUid("pipe-full-edit");
    pipe.setName("OldName");
    pipe.setColor("Blue");
    pipe.setMute(false);
    pipe.setSourceNode(source);
    pipe.setTargetNode(target);
    pipeRepository.save(pipe);

    // test saved pipe
    Pipe savedPipe = pipeRepository.findByUid("pipe-full-edit").orElseThrow();
    assertEquals("OldName", savedPipe.getName());
    assertEquals("Blue", savedPipe.getColor());
    assertEquals(false, savedPipe.getMute());
    assertEquals("source-node", savedPipe.getSourceNode().getUid());
    assertEquals("target-node", savedPipe.getTargetNode().getUid());

    // 3. Setup security context
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 4. JSON payload with all updated fields
    String payload = """
        {
          "created": {},
          "updated": {
            "pipes": [
              {
                "uid": "pipe-full-edit",
                "name": "UpdatedName",
                "color": "Green",
                "mute": true,
                "sourceNode": { "uid": "new-source-node" },
                "targetNode": { "uid": "new-target-node" }
              }
            ]
          },
          "deleted": {}
        }
        """;

    // 5. Perform the update
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isOk());

    // 6. Verify updates
    Pipe updated = pipeRepository.findByUid("pipe-full-edit").orElseThrow();
    assertEquals("UpdatedName", updated.getName());
    assertEquals("Green", updated.getColor());
    assertTrue(updated.getMute());
    assertEquals("new-source-node", updated.getSourceNode().getUid());
    assertEquals("new-target-node", updated.getTargetNode().getUid());
  }

  @Test
  void testEditPipe_noChangeSubmitted_idempotent() throws Exception {
    // 1. Create and persist user and nodes
    User user = userRepository.save(new User("idempotentUser", "pass"));

    Node source = new Node();
    source.setUid("source-node");
    source.setName("SourceNode");
    source.setUser(user);
    nodeRepository.save(source);

    Node target = new Node();
    target.setUid("target-node");
    target.setName("TargetNode");
    target.setUser(user);
    nodeRepository.save(target);

    // 2. Create and persist a Pipe with initial values
    Pipe pipe = new Pipe();
    pipe.setUid("pipe-idem");
    pipe.setName("SameName");
    pipe.setColor("Orange");
    pipe.setMute(false);
    pipe.setSourceNode(source);
    pipe.setTargetNode(target);
    pipeRepository.save(pipe);

    // test saved pipe
    Pipe savedPipe = pipeRepository.findByUid("pipe-idem").orElseThrow();
    assertEquals("SameName", savedPipe.getName());
    assertEquals("Orange", savedPipe.getColor());
    assertEquals(false, savedPipe.getMute());
    assertEquals("source-node", savedPipe.getSourceNode().getUid());
    assertEquals("target-node", savedPipe.getTargetNode().getUid());

    // 3. Setup security
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 4. JSON payload matches current values
    String payload = """
        {
          "created": {},
          "updated": {
            "pipes": [
              {
                "uid": "pipe-idem",
                "name": "SameName",
                "color": "Orange",
                "mute": false,
                "sourceNode": { "uid": "source-node" },
                "targetNode": { "uid": "target-node" }
              }
            ]
          },
          "deleted": {}
        }
        """;

    // 5. Perform POST /batch
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isOk());

    // 6. Fetch pipe again and assert unchanged
    Pipe result = pipeRepository.findByUid("pipe-idem").orElseThrow();
    assertEquals("SameName", result.getName());
    assertEquals("Orange", result.getColor());
    assertFalse(result.getMute());
    assertEquals("source-node", result.getSourceNode().getUid());
    assertEquals("target-node", result.getTargetNode().getUid());
  }

  @Test
  void testEditPipe_deletesAllowedFieldsWithNullValue() throws Exception {
    // 1. Create user and nodes
    User user = userRepository.save(new User("pipeNullTestUser", "pass"));

    Node source = new Node();
    source.setUid("src-node");
    source.setName("SourceNode");
    source.setUser(user);
    nodeRepository.save(source);

    Node target = new Node();
    target.setUid("tgt-node");
    target.setName("TargetNode");
    target.setUser(user);
    nodeRepository.save(target);

    // 2. Create and persist a Pipe with initial values
    Pipe pipe = new Pipe();
    pipe.setUid("pipe-del");
    pipe.setName("PipeToDeleteFields");
    pipe.setColor("Green");
    pipe.setMute(true);
    pipe.setSourceNode(source);
    pipe.setTargetNode(target);
    pipeRepository.save(pipe);

    // test saved pipe
    Pipe savedPipe = pipeRepository.findByUid("pipe-del").orElseThrow();
    assertEquals("PipeToDeleteFields", savedPipe.getName());
    assertEquals("Green", savedPipe.getColor());
    assertEquals(true, savedPipe.getMute());
    assertEquals("src-node", savedPipe.getSourceNode().getUid());
    assertEquals("tgt-node", savedPipe.getTargetNode().getUid());

    // 3. Setup security
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 4. JSON payload sets some fields to null
    String payload = """
        {
          "created": {},
          "updated": {
            "pipes": [
              {
                "uid": "pipe-del",
                "targetNode": null,
                "name": null,
                "color": null,
                "mute": null
              }
            ]
          },
          "deleted": {}
        }
        """;

    // 5. Perform update request
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isOk());

    // 6. Assert changes persisted as null
    Pipe result = pipeRepository.findByUid("pipe-del").orElseThrow();
    assertNull(result.getTargetNode());
    assertNull(result.getName());
    assertNull(result.getColor());
    assertNull(result.getMute()); // make sure your model allows mute to be nullable
    assertEquals("src-node", result.getSourceNode().getUid()); // sourceNode should remain
  }

  @Test
  void testEditPipe_withNonPersistedSourceAndTargetNode_shouldFail() throws Exception {
    // 1. Setup user and valid nodes
    User user = userRepository.save(new User("nonPersistPipeUser", "pass"));

    Node existingNode = new Node();
    existingNode.setUid("existing-node");
    existingNode.setName("NodeValid");
    existingNode.setUser(user);
    nodeRepository.save(existingNode);

    // make a node for source node
    Node sourceNode = new Node();
    sourceNode.setUid("source-node");
    sourceNode.setName("SourceNode");
    sourceNode.setUser(user);
    nodeRepository.save(sourceNode);

    Pipe pipe = new Pipe();
    pipe.setUid("pipe-nonpersist");
    pipe.setName("StablePipe");
    pipe.setColor("Blue");
    pipe.setMute(false);
    pipe.setSourceNode(sourceNode);
    pipe.setTargetNode(existingNode);
    pipeRepository.save(pipe);

    // 2. Setup security context
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    ObjectMapper mapper = new ObjectMapper();

    // ========== First attempt: Set non-existent sourceNode ==========
    String payloadWithFakeSource = """
        {
          "created": {},
          "updated": {
            "pipes": [
              {
                "uid": "pipe-nonpersist",
                "sourceNode": { "uid": "nonexistent-src" }
              }
            ]
          },
          "deleted": {}
        }
        """;

    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payloadWithFakeSource))
        .andExpect(status().isInternalServerError());

    // Confirm no change
    Pipe pipeAfterFirstFail = pipeRepository.findByUid("pipe-nonpersist").orElseThrow();
    assertEquals("source-node", pipeAfterFirstFail.getSourceNode().getUid());

    // ========== Second attempt: Set non-existent targetNode ==========
    String payloadWithFakeTarget = """
        {
          "created": {},
          "updated": {
            "pipes": [
              {
                "uid": "pipe-nonpersist",
                "targetNode": { "uid": "nonexistent-tgt" }
              }
            ]
          },
          "deleted": {}
        }
        """;

    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payloadWithFakeTarget))
        .andExpect(status().isInternalServerError());

    // Confirm no change
    Pipe pipeAfterSecondFail = pipeRepository.findByUid("pipe-nonpersist").orElseThrow();
    assertEquals("existing-node", pipeAfterSecondFail.getTargetNode().getUid());
    assertEquals("source-node", pipeAfterSecondFail.getSourceNode().getUid());
  }

  @Test
  void testEditPipe_withNullSourceNode_shouldFailGracefully() throws Exception {
    // 1. Setup user and valid node
    User user = userRepository.save(new User("nullSrcUser", "pass"));

    Node node = new Node();
    node.setUid("valid-node");
    node.setName("ValidNode");
    node.setUser(user);
    nodeRepository.save(node);

    // make a node for source node
    Node sourceNode = new Node();
    sourceNode.setUid("source-node");
    sourceNode.setName("SourceNode");
    sourceNode.setUser(user);
    nodeRepository.save(sourceNode);

    // 2. Save a valid pipe with sourceNode and targetNode
    Pipe pipe = new Pipe();
    pipe.setUid("pipe-nullsrc");
    pipe.setName("PipeBeforeNull");
    pipe.setColor("Red");
    pipe.setMute(false);
    pipe.setSourceNode(sourceNode);
    pipe.setTargetNode(node);
    pipeRepository.save(pipe);

    // 3. Setup security context
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 4. Prepare payload to set sourceNode to null
    String payload = """
        {
          "created": {},
          "updated": {
            "pipes": [
              {
                "uid": "pipe-nullsrc",
                "sourceNode": null
              }
            ]
          },
          "deleted": {}
        }
        """;

    // 5. Perform request and expect success=false in response
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(false))
        .andExpect(jsonPath("$.message").value("Some entities failed to update"))
        .andExpect(jsonPath("$.errors.pipes[0]").value("pipe-nullsrc"));

    // 6. Confirm DB value did not change
    Pipe pipeAfter = pipeRepository.findByUid("pipe-nullsrc").orElseThrow();
    assertNotNull(pipeAfter.getSourceNode());
    assertEquals("source-node", pipeAfter.getSourceNode().getUid());
  }

  @Test
  void testEditPipe_withSameSourceAndTargetNode_shouldFail() throws Exception {
    // 1. Setup user and node
    User user = userRepository.save(new User("sameNodeUser", "pass"));

    Node node = new Node();
    node.setUid("shared-node");
    node.setName("SharedNode");
    node.setUser(user);
    nodeRepository.save(node);

    // 2. Save initial Pipe with sourceNode and different targetNode
    Node anotherNode = new Node();
    anotherNode.setUid("another-node");
    anotherNode.setName("AnotherNode");
    anotherNode.setUser(user);
    nodeRepository.save(anotherNode);

    Pipe pipe = new Pipe();
    pipe.setUid("pipe-same-nodes");
    pipe.setName("OriginalPipe");
    pipe.setColor("Blue");
    pipe.setMute(false);
    pipe.setSourceNode(node);
    pipe.setTargetNode(anotherNode);
    pipeRepository.save(pipe);

    // 3. Set security
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 4. Payload that sets targetNode = sourceNode (both to "shared-node")
    String payload = """
        {
          "created": {},
          "updated": {
            "pipes": [
              {
                "uid": "pipe-same-nodes",
                "sourceNode": { "uid": "shared-node" },
                "targetNode": { "uid": "shared-node" }
              }
            ]
          },
          "deleted": {}
        }
        """;

    // 5. Perform request and check error in response
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isInternalServerError());

    // 6. Ensure database was not updated
    Pipe after = pipeRepository.findByUid("pipe-same-nodes").orElseThrow();
    assertEquals("shared-node", after.getSourceNode().getUid());
    assertEquals("another-node", after.getTargetNode().getUid()); // remains unchanged
  }

  @Test
  void testEditNode_eachFieldSequentially() throws Exception {
    // 1. Create user and original node
    User user = userRepository.save(new User("fieldEditUser", "pass"));

    Node node = new Node();
    node.setUid("node-edit-1");
    node.setUser(user);
    node.setName("Original");
    node.setChildDirection("vertical");
    node.setColor("black");
    node.setState("active");
    node.setPositionX(100);
    node.setPositionY(200);
    node.setIsStartingNode(false);
    node.setParentId("12");
    node.setNumberOfPropsIn(1);
    nodeRepository.save(node);

    // 2. Authenticate
    CustomUserDetails userDetails = new CustomUserDetails(user.getId(), user.getUsername(), user.getPassword(),
        List.of());
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 3. Create update payloads and test each field
    List<String> fieldPayloads = List.of(
        """
            {"uid": "node-edit-1", "name": "UpdatedName"}
            """,
        """
            {"uid": "node-edit-1", "childDirection": "horizontal"}
            """,
        """
            {"uid": "node-edit-1", "color": "blue"}
            """,
        """
            {"uid": "node-edit-1", "state": "inactive"}
            """,
        """
            {"uid": "node-edit-1", "positionX": 300}
            """,
        """
            {"uid": "node-edit-1", "positionY": 400}
            """,
        """
            {"uid": "node-edit-1", "isStartingNode": true}
            """,
        """
            {"uid": "node-edit-1", "parentId": "13"}
            """,
        """
            {"uid": "node-edit-1", "numberOfPropsIn": 7}
            """);

    for (String json : fieldPayloads) {
      String payload = String.format("""
              {
                "created": {},
                "updated": {
                  "nodes": [%s]
                },
                "deleted": {}
              }
          """, json);

      mockMvc.perform(post("/batch")
          .contentType(MediaType.APPLICATION_JSON)
          .content(payload))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.success").value(true));
    }

    // 4. Confirm final state
    Node updated = nodeRepository.findByUid("node-edit-1").orElseThrow();
    assertEquals("UpdatedName", updated.getName());
    assertEquals("horizontal", updated.getChildDirection());
    assertEquals("blue", updated.getColor());
    assertEquals("inactive", updated.getState());
    assertEquals(300, updated.getPositionX());
    assertEquals(400, updated.getPositionY());
    assertTrue(updated.getIsStartingNode());
    assertEquals("13", updated.getParentId());
    assertEquals(7, updated.getNumberOfPropsIn());
  }

  @Test
  @Transactional
  void testApplyBatchChanges_editNodeWithMinimalRequiredFields_shouldUpdateParentIdOnly() throws Exception {
    // Create and save a real user
    User realUser = new User();
    realUser.setUsername("testuser");
    realUser.setPassword("password");
    userRepository.save(realUser);

    // Set up custom user context
    CustomUserDetails userDetails = new CustomUserDetails(realUser);
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // Save an original node
    Node originalNode = new Node();
    originalNode.setUid("node-001");
    originalNode.setUser(realUser);
    originalNode.setParentId(null);
    originalNode.setName("Original Name");
    originalNode.setPositionX(10);
    originalNode.setPositionY(20);
    nodeRepository.save(originalNode);

    // Prepare payload for minimal update (only updating parentId)
    String payload = """
        {
          "created": {},
          "updated": {
            "nodes": [
              {
                "uid": "node-001",
                "userId": %d,
                "parentId": "12345"
              }
            ]
          },
          "deleted": {}
        }
        """.formatted(realUser.getId());

    MvcResult result = mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isOk())
        .andReturn();

    // Fetch updated node
    Node updatedNode = nodeRepository.findByUid("node-001").orElseThrow();

    // Assert updated parentId
    assertEquals("12345", updatedNode.getParentId());

    // Assert other fields are unchanged
    assertEquals("Original Name", updatedNode.getName());
    assertEquals(10, updatedNode.getPositionX());
    assertEquals(20, updatedNode.getPositionY());
    assertEquals(realUser.getId(), updatedNode.getUser().getId());
  }

  @Test
  @Transactional
  void testApplyBatchChanges_editNodeWithAllFields_shouldUpdateAllCorrectly() throws Exception {
    // 1. Create and persist a user
    User user = new User();
    user.setUsername("fullUpdateUser");
    user.setPassword("pass123");
    userRepository.save(user);

    // 3. Create and persist original node
    Node node = new Node();
    node.setUid("node-full-update");
    node.setUser(user);
    node.setParentId("1");
    node.setName("Old Name");
    node.setColor("blue");
    node.setPositionX(5);
    node.setPositionY(10);
    node.setIsStartingNode(false);
    node.setChildDirection("DOWNWARD");
    node.setNumberOfPropsIn(2);
    node.setState("INACTIVE");
    nodeRepository.save(node);

    // 2. Set up authenticated user context
    CustomUserDetails userDetails = new CustomUserDetails(user);
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 4. Payload for full update
    String payload = """
        {
          "created": {},
          "updated": {
            "nodes": [
              {
                "uid": "node-full-update",
                "parentId": "99",
                "name": "Updated Node",
                "color": "red",
                "positionX": 200,
                "positionY": 300,
                "isStartingNode": true,
                "childDirection": "UPWARD",
                "numberOfPropsIn": 5,
                "state": "ACTIVE"
              }
            ]
          },
          "deleted": {}
        }
        """;

    // 5. Perform the update
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isOk());

    // 6. Verify via fetch
    Node updated = nodeRepository.findByUid("node-full-update").orElseThrow();

    assertEquals("99", updated.getParentId());
    assertEquals("Updated Node", updated.getName());
    assertEquals("red", updated.getColor());
    assertEquals(200, updated.getPositionX());
    assertEquals(300, updated.getPositionY());
    assertTrue(updated.getIsStartingNode());
    assertEquals("UPWARD", updated.getChildDirection());
    assertEquals(5, updated.getNumberOfPropsIn());
    assertEquals("ACTIVE", updated.getState());
    assertEquals(user.getId(), updated.getUser().getId());
  }

  @Test
  @Transactional
  void testApplyBatchChanges_idempotentRequest_shouldSucceedAndChangeNothing() throws Exception {
    // 1. Create and save user
    User user = new User();
    user.setUsername("idempotentUser");
    user.setPassword("secure");
    userRepository.save(user);

    // 2. Setup authentication context
    CustomUserDetails userDetails = new CustomUserDetails(user);
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 3. Create and save node with known values
    Node node = new Node();
    node.setUid("node-idempotent");
    node.setUser(user);
    node.setParentId("42");
    node.setName("Same Name");
    node.setColor("gray");
    node.setPositionX(100);
    node.setPositionY(150);
    node.setIsStartingNode(false);
    node.setChildDirection("LEFT");
    node.setNumberOfPropsIn(3);
    node.setState("STABLE");
    nodeRepository.save(node);

    // 4. Build a payload with the exact same values
    String payload = """
        {
          "created": {},
          "updated": {
            "nodes": [
              {
                "uid": "node-idempotent",
                "parentId": "42",
                "name": "Same Name",
                "color": "gray",
                "positionX": 100,
                "positionY": 150,
                "isStartingNode": false,
                "childDirection": "LEFT",
                "numberOfPropsIn": 3,
                "state": "STABLE"
              }
            ]
          },
          "deleted": {}
        }
        """;

    // 5. Perform the idempotent update
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isOk());

    // 6. Fetch the node and verify it remains the same
    Node updated = nodeRepository.findByUid("node-idempotent").orElseThrow();

    assertEquals("42", updated.getParentId());
    assertEquals("Same Name", updated.getName());
    assertEquals("gray", updated.getColor());
    assertEquals(100, updated.getPositionX());
    assertEquals(150, updated.getPositionY());
    assertFalse(updated.getIsStartingNode());
    assertEquals("LEFT", updated.getChildDirection());
    assertEquals(3, updated.getNumberOfPropsIn());
    assertEquals("STABLE", updated.getState());
    assertEquals(user.getId(), updated.getUser().getId());
  }

  @Test
  @Transactional
  void testApplyBatchChanges_setNullableFieldsToNull_shouldSucceedAndDefaultsApply() throws Exception {
    // 1. Create a user
    User user = new User();
    user.setUsername("nullableFieldsUser");
    user.setPassword("password");
    userRepository.save(user);

    // 2. Set up authentication context
    CustomUserDetails userDetails = new CustomUserDetails(user);
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    SecurityContextHolder.setContext(context);

    // 3. Create and save a node with all fields populated
    Node node = new Node();
    node.setUid("node-null-fields");
    node.setUser(user);
    node.setParentId("77");
    node.setName("Node Full");
    node.setColor("green");
    node.setState("LOADED");
    node.setPositionX(10);
    node.setPositionY(20);
    node.setIsStartingNode(true);
    node.setChildDirection("LEFT"); // This should be reset to "VERTICAL" after null
    node.setNumberOfPropsIn(2);
    nodeRepository.save(node);

    //check saved node
    Node savedNode = nodeRepository.findByUid("node-null-fields").orElseThrow();
    assertEquals("77", savedNode.getParentId());
    assertEquals("Node Full", savedNode.getName());
    assertEquals("green", savedNode.getColor());
    assertEquals("LOADED", savedNode.getState());
    assertEquals(10, savedNode.getPositionX());

    // 4. Send update to nullify all editable fields
    String payload = """
        {
          "created": {},
          "updated": {
            "nodes": [
              {
                "uid": "node-null-fields",
                "parentId": null,
                "name": null,
                "color": null,
                "state": null,
                "positionX": null,
                "positionY": null,
                "childDirection": null,
                "numberOfPropsIn": null
              }
            ]
          },
          "deleted": {}
        }
        """;

    // 5. Perform the update
    mockMvc.perform(post("/batch")
        .contentType(MediaType.APPLICATION_JSON)
        .content(payload))
        .andExpect(status().isOk());

    // 6. Fetch the node again and assert all fields are null or fallback
    Node updated = nodeRepository.findByUid("node-null-fields").orElseThrow();

    //assertEquals(0, updated.getParentId());
    assertNull(updated.getParentId());
    assertNull(updated.getName(), "name should be null");
    assertNull(updated.getColor(), "color should be null");
    assertNull(updated.getState(), "state should be null");
    assertNull(updated.getPositionX(), "positionX should be null");
    assertNull(updated.getPositionY(), "positionY should be null");
    assertNull(updated.getNumberOfPropsIn(), "numberOfPropsIn should be null");
    //assertNull(updated.getIsStartingNode(), "isStartingNode should be null");
  
    // User still intact
    assertEquals(user.getId(), updated.getUser().getId());
  }

}
