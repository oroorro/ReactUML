package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.exception.InvalidRequestDataException;
import com.example.demo.model.Node;
import com.example.demo.model.User;
import com.example.demo.repository.NodeRepository;
import com.example.demo.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;
import com.fasterxml.jackson.databind.JsonNode;

@Service
public class NodeService {

    @Autowired
    private final NodeRepository nodeRepository;

    @Autowired
    private final UserRepository userRepository;

    public NodeService(NodeRepository nodeRepository, UserRepository userRepository) {
        this.nodeRepository = nodeRepository;
        this.userRepository = userRepository;
    }

    public List<Node> getAllNodesWithAttributesAndContents(Integer userId) {
        return nodeRepository.getAllNodesWithAttributesAndContents(userId);
    }

    public Node createNode(Integer userId, Node node) {
        // node.setUserId(userId); 

        // System.err.println("node:" + node.getUid());
        // //if node has no uid, throw an exception
        // if (node.getUid() == null || node.getUid().trim().isEmpty()) {
        //     throw new InvalidRequestDataException("uid must not be null");
        // }

        User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        node.setUser(user); 
        return nodeRepository.save(node);
    }

    // public Boolean createNode(Integer userId, Node node) {
    //     // node.setUserId(userId); 
    //     User user = userRepository.findById(userId)
    //             .orElseThrow(() -> new EntityNotFoundException("user does not exist " + userId));
    //     node.setUser(user);
    //     nodeRepository.save(node);
    //     return true;
    // }

    public boolean deleteNode(Integer userId, Integer nodeId) {
        Optional<Node> nodeOpt = nodeRepository.findById(nodeId);
        if (nodeOpt.isPresent() && nodeOpt.get().getUserId().equals(userId)) {
            nodeRepository.deleteById(nodeId);
            return true;
        }
        return false;
    }

    @Transactional
    public boolean deleteNodeByUid(String uid) {
        if (uid == null || uid.isBlank()) return false;
        
        Optional<Node> nodeOpt = nodeRepository.findByUid(uid);
        if (nodeOpt.isPresent()) {
            nodeRepository.delete(nodeOpt.get());
            return true;
        }
        return false;
    }

    @Transactional
    public Node editNode(Node updated, JsonNode rawNode) {
        if (updated == null || updated.getUid() == null) {
            throw new IllegalArgumentException("Updated node or UID cannot be null.");
        }

        Node existing = nodeRepository.findByUid(updated.getUid())
                .orElseThrow(() -> new EntityNotFoundException("Node not found with UID: " + updated.getUid()));

        boolean modified = false;

        if (rawNode.has("parentId")) {
            Integer newParentId = rawNode.get("parentId").asInt();
            if (!java.util.Objects.equals(existing.getParentId(), newParentId)) {
                System.err.println("parentId updated");
                existing.setParentId(newParentId);
                modified = true;
            }
        }

        if (rawNode.has("userId")) {
            Integer newUserId = rawNode.get("userId").asInt();
            User newUser = userRepository.findById(newUserId)
                    .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + newUserId));
            if (!java.util.Objects.equals(existing.getUser().getId(), newUserId)) {
                existing.setUser(newUser);
                modified = true;
            }
        }
        
        if (rawNode.has("name") && !java.util.Objects.equals(existing.getName(), updated.getName())) {
            existing.setName(updated.getName());
            modified = true;
        }
        if (rawNode.has("color") && !java.util.Objects.equals(existing.getColor(), updated.getColor())) {
            existing.setColor(updated.getColor());
            modified = true;
        }
        if (rawNode.has("numberOfPropsIn") && !java.util.Objects.equals(existing.getNumberOfPropsIn(), updated.getNumberOfPropsIn())) {
            existing.setNumberOfPropsIn(updated.getNumberOfPropsIn());
            modified = true;
        }
        if (rawNode.has("childDirection")) {
            String newDirection = rawNode.get("childDirection").asText();
            if (!java.util.Objects.equals(existing.getChildDirection(), newDirection)) {
                existing.setChildDirection(newDirection);
                modified = true;
            }
        }
        if (rawNode.has("isStartingNode") && !java.util.Objects.equals(existing.getIsStartingNode(), updated.getIsStartingNode())) {
            existing.setIsStartingNode(updated.getIsStartingNode());
            modified = true;
        }
        if (rawNode.has("positionX") && !java.util.Objects.equals(existing.getPositionX(), updated.getPositionX())) {
            existing.setPositionX(updated.getPositionX());
            modified = true;
        }
        if (rawNode.has("positionY") && !java.util.Objects.equals(existing.getPositionY(), updated.getPositionY())) {
            existing.setPositionY(updated.getPositionY());
            modified = true;
        }
        // Optionally handle state if needed
        if (rawNode.has("state") && !java.util.Objects.equals(existing.getState(), updated.getState())) {
            existing.setState(updated.getState());
            modified = true;
        }


        if (rawNode.has("user")) {
            JsonNode userNode = rawNode.get("user");
            if (userNode.has("id")) {
                Integer newUserId = userNode.get("id").asInt();
                if (existing.getUser() == null || !java.util.Objects.equals(existing.getUser().getId(), newUserId)) {
                    User newUser = userRepository.findById(newUserId)
                        .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + newUserId));
                    existing.setUser(newUser);
                    modified = true;
                }
            }
        }
        

        if (modified) {
            nodeRepository.save(existing);
        }
        return existing;
    }
}
