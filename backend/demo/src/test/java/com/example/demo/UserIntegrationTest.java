package com.example.demo;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.MediaType;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
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
    // @Bean
    // public PasswordEncoder passwordEncoder() {
    //     return new BCryptPasswordEncoder();
    // }

    // @BeforeEach
    // void setup() {
    //     User user = new User();
    //     user.setUsername("john");
    //     user.setPassword("encodedPassword");
    //     userRepository.save(user);
    // }

    @Test
    void testUserRegisterAndFetch_failure_success() throws Exception {

    }

    @Test
    void testUserRegisterAndFetch_failure_wrong_password() throws Exception {

    }

    @Test
    void testUserCreationAndFetch_success() throws Exception {
        User user = new User();
        user.setUsername("john");
        user.setPassword("encodedPassword");
        userRepository.save(user);
        // Save a user directly into the DB
        UserDetails springUser = org.springframework.security.core.userdetails.User.withUsername("john")
            .password("whatever")
            .roles("USER")
            .build();
            
        // Fetch via REST API
        mockMvc.perform(get("/auth/verify")
            .with(user(springUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("john"))
                .andExpect(jsonPath("$.id").isNumber());
    }


    @Test
    void testUserCreationAndFetch_failure_notAuthorizedUser() throws Exception {


    }


    @Test
    void testUserLoginAndFetch_success() throws Exception {
        User user = new User();
        user.setUsername("john");
        user.setPassword(passwordEncoder.encode("password123")); 
        userRepository.save(user);

        mockMvc.perform(post("/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                "username": "john",
                "password": "password123"
                }
            """))
        .andDo(result -> {
                //check runtime exception has occurred 
                Exception resolvedException = result.getResolvedException();
                //assertNotNull(resolvedException);
                System.err.println("Exception: " + resolvedException.getClass());
                //assertTrue(resolvedException instanceof NullPointerException);
        })
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("Login successful!"));
    }

    @Test
    void testUserLoginAndFetch_failure_wrong_userName() throws Exception {

    }

    @Test
    void testUserLoginAndFetch_failure_wrong_password() throws Exception {

    }

}
