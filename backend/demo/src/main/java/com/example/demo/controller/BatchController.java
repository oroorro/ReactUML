package com.example.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.BatchResponse;
import com.example.demo.dto.ChangeSetDto;
import com.example.demo.security.CustomUserDetails;
import com.example.demo.service.BatchService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/batch")
public class BatchController {

    private final BatchService batchService;
    private final ObjectMapper objectMapper;

    public BatchController(BatchService batchService, ObjectMapper objectMapper) {
        this.batchService = batchService;
        this.objectMapper = objectMapper;
    }

    // @PostMapping
    // public ResponseEntity<?> applyBatchChanges(@RequestBody ChangeSetDto changes,
    // @AuthenticationPrincipal CustomUserDetails userDetails) {

    // //batchService.applyChanges(changes, userDetails.getId());

    // // try {
    // // batchService.applyChanges(changes, userDetails.getId());
    // // return ResponseEntity.ok().build();
    // // } catch (Exception e) {
    // // e.printStackTrace();
    // // return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    // // }

    // BatchResponse result = batchService.applyChanges(changes,
    // userDetails.getId());

    // if (result.hasErrors()) {
    // return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
    // }

    // return ResponseEntity.ok(result);

    // //return ResponseEntity.ok().build();
    // }

    @PostMapping
    public ResponseEntity<BatchResponse> applyChanges(@RequestBody JsonNode dto,
            @AuthenticationPrincipal CustomUserDetails user) {
                
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                System.out.println(">> Authentication: " + auth);
                System.out.println(">> Principal: " + auth.getPrincipal());
            
                if (auth.getPrincipal() instanceof CustomUserDetails) {
                    CustomUserDetails user2 = (CustomUserDetails) auth.getPrincipal();
                    System.out.println(">> User ID from SecurityContext: " + user2.getId());
                } else {
                    System.out.println("❌ Principal is NOT CustomUserDetails: " + auth.getPrincipal().getClass());
                }
                System.out.println("User principal: " + user);
        try {
            ChangeSetDto changes = objectMapper.treeToValue(dto, ChangeSetDto.class);
            BatchResponse result = batchService.applyChanges(changes, dto, user.getId());
            return ResponseEntity.ok(result);
        } catch (JsonProcessingException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new BatchResponse(false, "Invalid JSON format: " + e.getMessage()));
        }
    }
}
