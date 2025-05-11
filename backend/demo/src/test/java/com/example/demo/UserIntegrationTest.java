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
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
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
    // @Bean
    // public PasswordEncoder passwordEncoder() {
    // return new BCryptPasswordEncoder();
    // }

    // @BeforeEach
    // void setup() {
    // User user = new User();
    // user.setUsername("john");
    // user.setPassword("encodedPassword");
    // userRepository.save(user);
    // }

    @Test
    void testUserRegisterAndFetch_failure_success() throws Exception {

    }

    @Test
    void testUserRegisterAndFetch_failure_wrong_password() throws Exception {

    }

    //isn't this repetitive ? and meaningless
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
    void testUserCreation_failure_notAuthorizedUser() throws Exception {

    }

    //after login, use session to verify logged-in user
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
                .andExpect(jsonPath("$.username").value("john"));
    }

    //testing to call /verify when user has not been logged in 
    @Test
    void testUserVerify_failure_notLoggedInUser() throws Exception {
        User user = new User();
        user.setUsername("john");
        user.setPassword(passwordEncoder.encode("password123"));
        userRepository.save(user);

        mockMvc.perform(get("/auth/verify"))
                .andExpect(status().isInternalServerError())
                .andDo(result -> {
                //check runtime exception has occurred 
                Exception resolvedException = result.getResolvedException();
                assertNotNull(resolvedException);
                //System.err.println("Exception: " + resolvedException.getClass());
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
    }

}
