package com.example.demo;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.example.demo.model.Node;
import com.example.demo.repository.NodeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class NodeControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private NodeRepository nodeRepository;

    @Test
    void testCreateNode() throws Exception {
        Node node = new Node();
        node.setName("Test");
        node.setColor("red");
        node.setPositionX(100);
        node.setPositionY(100);
        node.setIsStartingNode(true);
        node.setNumberOfPropsIn(12);
        node.setChildrenDirection("vertical");

        mockMvc.perform(post("/node/create/1")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(node)))
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
         assertTrue(storedNode.getIsStartingNode());
        
    }
}

