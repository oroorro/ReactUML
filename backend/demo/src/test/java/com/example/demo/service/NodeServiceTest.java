package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.model.Node;
import com.example.demo.model.User;
import com.example.demo.repository.NodeRepository;
import com.example.demo.repository.UserRepository;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;


@ExtendWith(MockitoExtension.class)
class NodeServiceTest {

    @Mock
    private NodeRepository nodeRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NodeService nodeService;

    @Test
    void testCreateNodeAssignsUser() {
        User user = new User();
        user.setId(1);
        when(userRepository.findById(1)).thenReturn(Optional.of(user)); 
        // this will happen in nodeService layer, we are just pretending it 
        // when userRepository.findById(1) is called in nodeService, it should return user with id 1

        Node node = new Node();
        node.setName("ServiceNode");

        when(nodeRepository.save(any(Node.class))).thenAnswer(i -> i.getArgument(0));


        Node created = nodeService.createNode(1, node);
        assertEquals("ServiceNode", created.getName());
        assertEquals(user, created.getUser());//gets mockUser
    }


     @Test
    void testDeleteNode_success() {
        
        User user = new User();
        user.setId(1);
        Integer userId = 1;
        Integer nodeId = 10;

        Node node = new Node();
        node.setId(nodeId);
        node.setUser(user); 

        when(nodeRepository.findById(nodeId)).thenReturn(Optional.of(node));

        // When
        boolean result = nodeService.deleteNode(userId, nodeId);

        // Then
        assertTrue(result);
        verify(nodeRepository).deleteById(nodeId);
    }

    @Test
    void testDeleteNode_wrongUser() {
        
        User user = new User();
        user.setId(2);
        Integer userId = 1;
        Integer nodeId = 10;

        Node node = new Node();
        node.setId(nodeId);
        node.setUser(user);  

        when(nodeRepository.findById(nodeId)).thenReturn(Optional.of(node));

        // When
        boolean result = nodeService.deleteNode(userId, nodeId);

        // Then
        assertFalse(result);
        verify(nodeRepository, never()).deleteById(any());
    }

    @Test
    void testDeleteNode_notFound() {
        
        Integer userId = 1;
        Integer nodeId = 10;

        when(nodeRepository.findById(nodeId)).thenReturn(Optional.empty());


        boolean result = nodeService.deleteNode(userId, nodeId);

        assertFalse(result);
        verify(nodeRepository, never()).deleteById(any());
    }

}

