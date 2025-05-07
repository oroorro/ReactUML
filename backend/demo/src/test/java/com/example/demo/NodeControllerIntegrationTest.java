package com.example.demo;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.core.env.Environment;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.example.demo.model.Node;
import com.example.demo.model.User;
import com.example.demo.repository.NodeRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.NodeService;
import com.fasterxml.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

import java.util.List;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class NodeControllerIntegrationTest {

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    private String generateUniqueId() {
        String timestamp = Long.toString(System.currentTimeMillis(), 36);
        String randomValue = Long.toString((long)(Math.random() * 2176782336L), 36); // base-36 with 6 digits max
        randomValue = String.format("%6s", randomValue).replace(' ', '0'); // pad to 6 chars if needed
        return timestamp + "-" + randomValue;
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private NodeRepository nodeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    Environment env;

    @Autowired
    private NodeService nodeService;

    @MockBean
    private NodeService nodeMockService;

    @Test
    void verifyTestProfileAndDatasource() {
        assertEquals("test", env.getActiveProfiles()[0]);
        assertEquals("jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1", env.getProperty("spring.datasource.url"));
    }

    @Test
    void testCreateNode() throws Exception {

        User user = new User();
        
        user.setUsername("testuser");
        user.setPassword("password"); 
        //userRepository.save(user);

        User savedUser = userRepository.save(user);
        assertNotNull(savedUser.getId(), "1");
        List<User> usersInDb = userRepository.findAll();
        assertEquals(1, usersInDb.size());


        Node node = new Node();
        String uid = generateUniqueId();
        node.setName("Test");
        node.setUid(uid);
        node.setColor("red");
        node.setPositionX(100);
        node.setPositionY(100);
        node.setIsStartingNode(true);
        node.setNumberOfPropsIn(12);
        node.setChildrenDirection("vertical");
 
        //persist Node into DB through calling api endpoint (nodeController -> nodeService -> nodeRepo)
        mockMvc.perform(post("/node/create/1")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(node)))
                .andDo(result -> {
                    System.out.println("Response: " + result.getResponse().getContentAsString());
                })
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test"));

         // check that the node is in the database
         List<Node> nodesInDb = nodeRepository.findAll();
         assertEquals(1, nodesInDb.size());
 
         Node storedNode = nodesInDb.get(0);
         assertEquals("Test", storedNode.getName());
         assertEquals("red", storedNode.getColor());
         assertEquals(100, storedNode.getPositionX());
         assertEquals(100, storedNode.getPositionY());
         assertEquals(uid, storedNode.getUid());
         assertNotEquals(generateUniqueId(), storedNode.getUid());
         assertTrue(storedNode.getIsStartingNode());

        nodeRepository.deleteAll();
        userRepository.delete(user);

    }

    @Test
    void testGetAllNodesForUser() throws Exception {
        Node node1 = new Node();
        node1.setId(1);
        node1.setUid("test-uid-1");

        Node node2 = new Node();
        node2.setId(2);
        node2.setUid("test-uid-2");

        when(nodeMockService.getAllNodesWithAttributesAndContents(1)).thenReturn(List.of(node1, node2));

        mockMvc.perform(get("/node/get/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].uid").value("test-uid-1"))
                .andExpect(jsonPath("$[1].uid").value("test-uid-2"));

        verify(nodeMockService).getAllNodesWithAttributesAndContents(1);
    }

    @Test
    void testDeleteNode_success() throws Exception {
        when(nodeService.deleteNode(1, 10)).thenReturn(true);

        mockMvc.perform(delete("/node/delete/1/10"))
                .andExpect(status().isOk())
                .andExpect(content().string("Node deleted successfully"));

        verify(nodeService).deleteNode(1, 10);
    }

    @Test
    void testDeleteNode_failure() throws Exception {
        when(nodeService.deleteNode(1, 999)).thenReturn(false);

        mockMvc.perform(delete("/node/delete/1/999"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Node not found or not owned by user"));

        verify(nodeService).deleteNode(1, 999);
    }

}

