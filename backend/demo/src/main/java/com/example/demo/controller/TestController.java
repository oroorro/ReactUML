package com.example.demo.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.NodeDTO;
import com.example.demo.model.Attribute;
import com.example.demo.model.AttributeContent;
import com.example.demo.model.Node;
import com.example.demo.model.Pipe;
import com.example.demo.repository.PipeRepository;
import com.example.demo.repository.AttributeContentRepository;
import com.example.demo.repository.AttributeRepository;
import com.example.demo.repository.NodeRepository;
import com.example.demo.security.CustomUserDetails;
import com.example.demo.service.NodeService;
import com.example.demo.service.TestCleanupService;

@RestController
@RequestMapping("/test-debug")
@Profile("test")
public class TestController {

    private final NodeService nodeService;

    private final AttributeRepository attributeRepository;

    private final AttributeContentRepository attributeContentRepository;

    private final PipeRepository pipeRepository;

    private final NodeRepository nodeRepository;

    private final TestCleanupService testCleanupService;

    @Autowired
    public TestController(NodeService nodeService, PipeRepository pipeRepository, NodeRepository nodeRepository, AttributeRepository attributeRepository,  AttributeContentRepository attributeContentRepository,
            TestCleanupService testCleanupService) {
        this.nodeService = nodeService;
        this.pipeRepository = pipeRepository;
        this.nodeRepository = nodeRepository;
        this.attributeContentRepository = attributeContentRepository;
        this.attributeRepository = attributeRepository;
        this.testCleanupService = testCleanupService;
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

    @GetMapping("/pipes/byUid/{uid}")
    public ResponseEntity<Pipe> getPipeByUid(@PathVariable String uid) {

        // return ResponseEntity.ok(pipeRepository.findByUid(uid));
        return pipeRepository.findByUid(uid)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // getting Attribute
    @GetMapping("/attribute/{uid}")
    public ResponseEntity<Attribute> getAttributeByUid(@PathVariable String uid) {
        return attributeRepository.findByUid(uid)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // getting AttributeContent
    @GetMapping("/attribute-content/{uid}")
    public ResponseEntity<AttributeContent> getAttributeContentByUid(@PathVariable String uid) {
        System.err.println("uid in AttributeContent  :" + uid);
        return attributeContentRepository.findByUid(uid)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/cleanup")
    public ResponseEntity<?> cleanupForUser(@RequestParam String username) {
        testCleanupService.deleteAllDataForUser(username);
        return ResponseEntity.ok().build();
    }
}
