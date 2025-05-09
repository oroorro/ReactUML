package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.dto.UserResponse;
import com.example.demo.service.UserService;
import com.example.demo.repository.UserRepository;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.Optional;

import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;


import com.fasterxml.jackson.databind.ObjectMapper;

//@WebMvcTest(AuthController.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testRegisterUser_success() throws Exception {
        Map<String, String> request = Map.of("username", "john", "password", "1234");
        User dummyUser = new User("john", "hashedPassword");

        when(userService.registerUser("john", "1234")).thenReturn(dummyUser);

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message", is("User registered successfully!")));

        verify(userService).registerUser("john", "1234");
    }


    @Test
    void testLoginUser_success() throws Exception {
        Map<String, String> request = Map.of("username", "john", "password", "1234");

        when(userService.authenticateUser("john", "1234"))
        .thenReturn(new User("john", "hashedPassword"));

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message", is("Login successful!")));

        verify(userService).authenticateUser("john", "1234");
    }

    @Test
    void testLoginUser_invalidCredentials() throws Exception {
        Map<String, String> request = Map.of("username", "john", "password", "wrong");

        doThrow(new RuntimeException("Invalid credentials!"))
            .when(userService).authenticateUser("john", "wrong");

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isInternalServerError());
    }

    @Test
    void testGetCurrentUser_success() throws Exception {
        // Simulate authenticated principal
        //UserDetails mockPrincipal = mock(UserDetails.class);

        UserDetails fakeUserDetails = org.springframework.security.core.userdetails.User
        .withUsername("john")
        .password("whatever")
        .roles("USER")
        .build();
        //when(fakeUserDetails.getUsername()).thenReturn("john");

        User mockUser = new User();
        mockUser.setId(1);
        mockUser.setUsername("john");

        when(userRepository.findByUsername("john")).thenReturn(Optional.of(mockUser));

        mockMvc.perform(get("/auth/verify")
                //.principal(() -> "john")) 
                .with(user(fakeUserDetails)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id", is(1)))
            .andExpect(jsonPath("$.username", is("john")));
    }

    @Test 
    void testGetCurrentUser_fail() throws Exception {

    }
}

