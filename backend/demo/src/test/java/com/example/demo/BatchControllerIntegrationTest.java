package com.example.demo;

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

import jakarta.transaction.Transactional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Optional;

@AutoConfigureMockMvc
@SpringBootTest(properties = "spring.config.name=application-test")
class BatchControllerIntegrationTest {

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

}
