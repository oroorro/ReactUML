package com.example.demo;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void testUserRegisterfailure_empty_password() throws Exception {
        Map<String, String> request = Map.of("username", "chole", "password", "");

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testRegisterUser_duplicateUsername() throws Exception {
        User user = new User("john", passwordEncoder.encode("123"));
        userRepository.save(user);

        Map<String, String> request = Map.of("username", "john", "password", "newpass");

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").value("User already exists!"));
    }

    @Test
    void testRegisterUser_emptyCredentials() throws Exception {
        Map<String, String> request = Map.of("username", "", "password", "");

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid user credential"));
    }


    @Test
    void testUserCreationWithUserDetailObject_success() throws Exception {
        User user = new User();
        user.setUsername("john");
        user.setPassword("encodedPassword");
        userRepository.save(user);
        // Save a user directly into the DB
        UserDetails springUser = org.springframework.security.core.userdetails.User.withUsername("john")
                .password("whatever")
                .roles("USER")
                .build();

        // call to /veify
        mockMvc.perform(get("/auth/verify")
                .with(user(springUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("john"))
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void testUserCreation_failure_notAuthorizedUser() throws Exception {
        //register the user
        Map<String, String> request = Map.of("username", "chole", "password", "password123");

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
        //call verify and fail since, the registered user has not logged in yet 
        mockMvc.perform(get("/auth/verify"))
                .andExpect(status().isInternalServerError())
                .andDo(result -> {
                    // check runtime exception has occurred
                    Exception resolvedException = result.getResolvedException();
                    assertNotNull(resolvedException);
                    // System.err.println("Exception: " + resolvedException.getClass());
                    assertTrue(resolvedException instanceof RuntimeException);
                });
    }

    // after login, use session to verify logged-in user
    @Test
    void testUserLogin_success() throws Exception {
        User user = new User();
        user.setUsername("john");
        user.setPassword(passwordEncoder.encode("password123"));
        userRepository.save(user);

        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .param("username", "john")
                .param("password", "password123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andReturn();

        MockHttpSession session = (MockHttpSession) loginResult.getRequest().getSession(false);

        mockMvc.perform(get("/auth/verify")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("john"))
                .andExpect(jsonPath("$.id").value(user.getId()))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    // testing to call /verify when user has not been logged in
    @Test
    void testUserVerify_failure_notLoggedInUser() throws Exception {
        User user = new User();
        user.setUsername("john");
        user.setPassword(passwordEncoder.encode("password123"));
        userRepository.save(user);

        mockMvc.perform(get("/auth/verify"))
                .andExpect(status().isInternalServerError())
                .andDo(result -> {
                    // check runtime exception has occurred
                    Exception resolvedException = result.getResolvedException();
                    assertNotNull(resolvedException);
                    // System.err.println("Exception: " + resolvedException.getClass());
                    assertTrue(resolvedException instanceof RuntimeException);
                });
    }

    @Test
    void testUserLogin_failure_wrong_userName() throws Exception {
        User user = new User();
        user.setUsername("john");
        user.setPassword(passwordEncoder.encode("password123"));
        userRepository.save(user);

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .param("username", "chole")
                .param("password", "password123"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testUserLogin_failure_wrong_password() throws Exception {
        User user = new User();
        user.setUsername("john");
        user.setPassword(passwordEncoder.encode("password123"));
        userRepository.save(user);

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .param("username", "jhon")
                .param("password", "password"))
                .andExpect(status().isUnauthorized());

        //re-attempting logging in with correct password and user name
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .param("username", "john")
                .param("password", "password123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Login successful"));
    }

}
