package com.example.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ChangeSetDto;
import com.example.demo.security.CustomUserDetails;
import com.example.demo.service.BatchService;

@RestController
@RequestMapping("/batch")
public class BatchController {
    
    private final BatchService batchService;

    public BatchController(BatchService batchService) {
        this.batchService = batchService;
    }

    @PostMapping
    public ResponseEntity<?> applyBatchChanges(@RequestBody ChangeSetDto changes,
                                            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        //batchService.applyChanges(changes, userDetails.getId());

        try {
            batchService.applyChanges(changes, userDetails.getId());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        //return ResponseEntity.ok().build();
    }
}
