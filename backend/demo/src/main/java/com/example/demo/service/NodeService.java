package com.example.demo.service;

import org.springframework.stereotype.Service;

import com.example.demo.model.Node;
import com.example.demo.model.User;
import com.example.demo.repository.NodeRepository;
import com.example.demo.repository.UserRepository;

import java.util.List;
import java.util.Optional;

@Service
public class NodeService {

    private final NodeRepository nodeRepository;
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
        User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        node.setUser(user); 
        return nodeRepository.save(node);
    }

    public boolean deleteNode(Integer userId, Integer nodeId) {
        Optional<Node> nodeOpt = nodeRepository.findById(nodeId);
        if (nodeOpt.isPresent() && nodeOpt.get().getUserId().equals(userId)) {
            nodeRepository.deleteById(nodeId);
            return true;
        }
        return false;
    }

    public Node editNode(Node updated) {

        Integer nodeId = updated.getId();

        Node existing = nodeRepository.findById(nodeId)
                .orElseThrow(() -> new RuntimeException("Node not found"));

        // Update mutable fields (excluding userId)
        existing.setParentId(updated.getParentId());
        existing.setName(updated.getName());
        existing.setColor(updated.getColor());
        existing.setNumberOfPropsIn(updated.getNumberOfPropsIn());
        existing.setChildrenDirection(updated.getChildrenDirection());
        existing.setIsStartingNode(updated.getIsStartingNode());
        existing.setPositionX(updated.getPositionX());
        existing.setPositionY(updated.getPositionY());

        return nodeRepository.save(existing);
    }
}
