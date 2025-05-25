package com.example.demo.controller;

import com.example.demo.model.Node;
import com.example.demo.service.NodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/node")
public class NodeController {

    private final NodeService nodeService;

    @Autowired
    public NodeController(NodeService nodeService) {
        this.nodeService = nodeService;
    }

    // + getAllNodesForUserId
    // GET /node/get/{userId}
    @GetMapping("/get/{userId}")
    public ResponseEntity<List<Node>> getAllNodesForUser(@PathVariable Integer userId) {
        List<Node> nodes = nodeService.getAllNodesWithAttributesAndContents(userId);
        return ResponseEntity.ok(nodes);
    }

    // + CreateNode
    // POST /node/create/{userId}
    @PostMapping("/create/{userId}")
    public ResponseEntity<Node> createNode(@PathVariable Integer userId, @RequestBody Node node) {
        Node created = nodeService.createNode(userId, node);
        //System.out.println("CREATED: " + created); 
        return ResponseEntity.ok(created);
    }

    // + DeleteNode
    // DELETE /node/delete/{userId}/{nodeId}
    @DeleteMapping("/delete/{userId}/{nodeId}")
    public ResponseEntity<String> deleteNode(@PathVariable Integer userId, @PathVariable Integer nodeId) {
        boolean deleted = nodeService.deleteNode(userId, nodeId);
        if (deleted) {
            return ResponseEntity.ok("Node deleted successfully");
        } else {
            return ResponseEntity.badRequest().body("Node not found or not owned by user");
        }
    }

    // + EditNode
    // PUT /node/edit/{nodeId}
    @PutMapping("/edit/{nodeId}")
    public ResponseEntity<Node> editNode(@PathVariable Integer nodeId, @RequestBody Node updatedNode) {
        Node updated = nodeService.editNode(updatedNode);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/test-return")
    public ResponseEntity<Node> testReturn() {
        Node test = new Node();
        test.setName("Hardcoded");
        test.setUid("abc-123");
        return ResponseEntity.ok(test);
    }
}
