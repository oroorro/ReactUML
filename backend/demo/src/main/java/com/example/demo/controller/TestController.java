package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.NodeDTO;
import com.example.demo.model.Node;
import com.example.demo.model.Pipe;
import com.example.demo.repository.PipeRepository;
import com.example.demo.repository.NodeRepository;
import com.example.demo.security.CustomUserDetails;
import com.example.demo.service.NodeService;

@RestController
@RequestMapping("/test-debug")
@Profile("test") 
public class TestController {

    private final NodeService nodeService;

    private final PipeRepository pipeRepository;

    private final NodeRepository nodeRepository;

    @Autowired
    public TestController(NodeService nodeService, PipeRepository pipeRepository, NodeRepository nodeRepository) {
        this.nodeService = nodeService;
        this.pipeRepository = pipeRepository;
        this.nodeRepository = nodeRepository;
    }
    @GetMapping("/tree")
    public ResponseEntity<List<NodeDTO>> getTestTree(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(nodeService.getFullTreeFromRoot(user.getId()));
    }

    @GetMapping("/nodes")
    public ResponseEntity<List<Node>> getNodes(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(nodeRepository.findAllByUserId(user.getId()));
    }

    @GetMapping("/node/{uid}")
    public ResponseEntity<Node> getNodeByUid(@PathVariable String uid) {
        System.err.println("uid in Testcontroller :" + uid);
        return nodeService.getNodeByUid(uid)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/pipes/from/{uid}")
    public ResponseEntity<List<Pipe>> getPipes(@PathVariable String uid) {
        return ResponseEntity.ok(pipeRepository.findBySourceNodeUid(uid));
    }
}
