package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.model.Pipe;
import com.example.demo.model.User;
import com.example.demo.repository.AttributeContentRepository;
import com.example.demo.repository.AttributeRepository;
import com.example.demo.repository.NodeRepository;
import com.example.demo.repository.PipeRepository;
import com.example.demo.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class TestCleanupService {
    private final UserRepository userRepository;
    private final NodeRepository nodeRepository;
    private final PipeRepository pipeRepository;
    private final AttributeRepository attributeRepository;
    private final AttributeContentRepository attributeContentRepository;

    public TestCleanupService(
            UserRepository userRepository,
            NodeRepository nodeRepository,
            PipeRepository pipeRepository,
            AttributeRepository attributeRepository,
            AttributeContentRepository attributeContentRepository) {
        this.userRepository = userRepository;
        this.nodeRepository = nodeRepository;
        this.pipeRepository = pipeRepository;
        this.attributeRepository = attributeRepository;
        this.attributeContentRepository = attributeContentRepository;
    }

    @Transactional
    public void deleteAllDataForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        Integer userId = user.getId();

        // Debug: Log pipes before deletion

        List<Pipe> pipes = pipeRepository.findPipesByUserId(11);
        System.out.println("Found pipes: " + pipes.size());
        for (Pipe pipe : pipes) {
            System.out.println("Pipe UID: " + pipe.getUid());
            System.out.println("Source Node: " + pipe.getSourceNode().getUid());
            System.out.println("Target Node: " + (pipe.getTargetNode() != null ? pipe.getTargetNode().getUid() : "null"));
        }

        List<Pipe> pipesToDelete = pipeRepository.findBySourceNodeUserIdOrTargetNodeUserId(userId);
        
        System.out.println("Pipes to delete: " + pipesToDelete.size());
        pipesToDelete
                .forEach(p -> System.out.println("Pipe: " + p.getUid() + " source: " + p.getSourceNode().getUid()));

        // Delete AttributeContents linked to user's attributes or pipes
        attributeContentRepository.deleteByUserId(userId);

        // Delete Attributes linked to user's nodes
        attributeRepository.deleteByUserId(userId);

        // Delete Pipes where source or target node belongs to user
        pipeRepository.deletePipesByUserId(userId);

        // Delete Nodes
        nodeRepository.deleteByUserId(userId);

        // Optionally: delete the user itself if we want a full cleanup
        // userRepository.delete(user);
    }
}
