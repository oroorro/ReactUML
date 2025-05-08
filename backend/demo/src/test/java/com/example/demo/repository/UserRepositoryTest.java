package com.example.demo.repository;

import com.example.demo.model.User;

import jakarta.persistence.PersistenceException;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
public class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void testSaveAndFindByUsername() {
        User user = new User();
        user.setUsername("junit_user");
        user.setPassword("secure123");

        userRepository.save(user);

        Optional<User> found = userRepository.findByUsername("junit_user");
        assertTrue(found.isPresent());
        assertEquals("junit_user", found.get().getUsername());
    }

    @Test
    void testFindByUsername_NotFound() {
        Optional<User> found = userRepository.findByUsername("nonexistent");
        assertTrue(found.isEmpty());
    }

    @Test
    void testInsertDuplicateUsername_throwsException() {
        User user1 = new User();
        user1.setUsername("duplicateUser");
        user1.setPassword("secret123");
        userRepository.saveAndFlush(user1);

        User user2 = new User();
        user2.setUsername("duplicateUser"); // same username
        user2.setPassword("anotherSecret");

        //catching an wrapped exception 
        // assertThrows(DataIntegrityViolationException.class, () -> {
        //     userRepository.saveAndFlush(user2); // triggers constraint violation
        // });

        //more detailed exception
        DataIntegrityViolationException ex = assertThrows(DataIntegrityViolationException.class, () -> {
            userRepository.saveAndFlush(user2);
        });
    
        assertTrue(ex.getCause() instanceof org.hibernate.exception.ConstraintViolationException);
    }

    @Test
    void testInsertWithoutUsername_throwsException() {
        User user = new User();
        user.setPassword("password123"); // no username is

        assertThrows(DataIntegrityViolationException.class, () -> {
            userRepository.saveAndFlush(user);
        });
    }

    @Test
    void testInsertWithoutPassword_throwsException() {
        User user = new User();
        user.setUsername("missingPassword"); // no password is given 

        assertThrows(DataIntegrityViolationException.class, () -> {
            userRepository.saveAndFlush(user);
        });
    }
}
