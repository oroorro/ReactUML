package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;

import com.example.demo.dto.NodeDTO;
import com.example.demo.security.CustomUserDetails;
import com.example.demo.service.NodeService;

public class TestController {
    private final NodeService nodeService;

    @Autowired
    public TestController(NodeService nodeService) {
        this.nodeService = nodeService;
    }
    @GetMapping("/test/tree")
    public ResponseEntity<List<NodeDTO>> getTestTree(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(nodeService.getFullTreeFromRoot(user.getId()));
    }
}
