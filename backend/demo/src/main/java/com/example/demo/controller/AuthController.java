package com.example.demo.controller;

import com.example.demo.dto.UserResponse;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public Map<String, String> registerUser(@RequestBody Map<String, String> user) {
        String username = user.get("username");
        String password = user.get("password");
        User registeredUser = userService.registerUser(username, password);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User registered successfully!");
        return response;
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

    // @GetMapping("/verify")
    // public UserResponse getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
    //     User user = userRepository.findByUsername(userDetails.getUsername())
    //         .orElseThrow(() -> new RuntimeException("User not found"));
    //     return new UserResponse(user.getId(), user.getUsername());
    // }
}
