package com.example.demo;

import com.example.demo.model.Node;
import com.example.demo.model.Pipe;
import com.example.demo.model.User;
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

}
