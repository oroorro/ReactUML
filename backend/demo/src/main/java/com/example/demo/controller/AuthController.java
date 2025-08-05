package com.example.demo.controller;

import com.example.demo.dto.UserResponse;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> registerUser(@RequestBody Map<String, String> user) {
        String username = user.get("username");
        String password = user.get("password");

        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid user credential");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        userService.registerUser(username, password);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User registered successfully!");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public Map<String, String> loginUser(@RequestBody Map<String, String> user) {
        String username = user.get("username");
        String password = user.get("password");

        try {
            userService.authenticateUser(username, password);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Login successful!");
            return response;
        } catch (RuntimeException e) {
            throw new RuntimeException("Invalid credentials!");
        }
    }

    @GetMapping("/verify")
    public UserResponse getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        return new UserResponse(user.getId(), user.getUsername());
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getAuthStatus() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        Map<String, Object> response = new HashMap<>();
        
        if (authentication != null && authentication.isAuthenticated() && 
            !"anonymousUser".equals(authentication.getName())) {
            response.put("authenticated", true);
            response.put("user", authentication.getName());
        } else {
            response.put("authenticated", false);
            response.put("user", null);
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unauthorized")
    public ResponseEntity<Map<String, Object>> unauthorized() {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Authentication required");
        response.put("redirect", "http://localhost:5173/login");
        return ResponseEntity.status(401).body(response);
    }
}
