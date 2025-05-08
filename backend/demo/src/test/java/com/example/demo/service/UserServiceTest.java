package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    void testFindByUsername() {
        User user = new User();
        user.setUsername("john");
        when(userRepository.findByUsername("john")).thenReturn(Optional.of(user));

        User result = userService.findByUsername("john");
        //assertEquals("john", result.get().getUsername());
        assertEquals("john", result.getUsername());
        assertThrows(RuntimeException.class, () -> {
            userService.findByUsername("chole");
        });
    }

    @Test
    void testRegisterUser_success() {
        when(userRepository.findByUsername("newUser")).thenReturn(Optional.empty()); //showing that before registration, the user doesn't existBefore registration, the user doesn't exist 
        lenient().when(passwordEncoder.encode("password123")).thenReturn("hashedPassword");

        
        User savedUser = new User("newUser", "hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = userService.registerUser("newUser", "password123");
        verify(passwordEncoder).encode("password123");
        assertEquals("newUser", result.getUsername());
        assertEquals("hashedPassword", result.getPassword());
    }

    @Test
    void testRegisterUser_duplicateUsername_throws() {
        User existing = new User("existingUser", "hashed");
        when(userRepository.findByUsername("existingUser")).thenReturn(Optional.of(existing));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            userService.registerUser("existingUser", "password123");
        });

        assertEquals("User already exists!", ex.getMessage());
    }

    @Test
    void testAuthenticateUser_success() {
        User user = new User("john", "hashedPassword");
        when(userRepository.findByUsername("john")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashedPassword")).thenReturn(true);

        User result = userService.authenticateUser("john", "password123");

        assertEquals("john", result.getUsername());
    }

    @Test
    void testAuthenticateUser_invalidCredentials_throws() {
        User user = new User("john", "hashedPassword");
        when(userRepository.findByUsername("john")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "hashedPassword")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            userService.authenticateUser("john", "wrongPassword");
        });

        assertEquals("Invalid username or password", ex.getMessage());
    }

    @Test
    void testAuthenticateUser_userNotFound_throws() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            userService.authenticateUser("ghost", "any");
        });

        assertEquals("Invalid username or password", ex.getMessage());
    }
}

