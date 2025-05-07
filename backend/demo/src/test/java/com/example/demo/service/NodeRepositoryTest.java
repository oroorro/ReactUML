package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import com.example.demo.model.Node;
import com.example.demo.repository.NodeRepository;

import jakarta.persistence.PersistenceException;

@DataJpaTest
class NodeRepositoryTest {

    @Autowired
    private NodeRepository nodeRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void testSaveAndFindById() {
        Node node = new Node();
        node.setName("RepoTest");
        node.setUid("uid-ge1g-123f");
        Node saved = nodeRepository.save(node);

        Node nodeAnother = new Node();
        nodeAnother.setName("RepoTestAgain");
        nodeAnother.setUid("uid-dw123-dwad");
        Node savedAnother = nodeRepository.save(nodeAnother);

        Node found = nodeRepository.findById(saved.getId()).orElse(null);
        assertNotNull(found);
        Node foundAnother = nodeRepository.findById(savedAnother.getId()).orElse(null);
        assertNotNull(foundAnother);
        assertEquals("RepoTest", found.getName());
        assertEquals("uid-ge1g-123f", found.getUid());
        assertEquals("RepoTestAgain", foundAnother.getName());
        assertEquals("uid-dw123-dwad", foundAnother.getUid());

    }

    @Test
    void testFlushDetectsConstraintViolation() {
        Node node = new Node();
        //node.setUid(null); // Assume this is @Column(nullable = false)

        entityManager.persist(node);
        
        assertThrows(PersistenceException.class, () -> {
            //entityManager.persist(node);
            //entityManager.flush(); // forces DB to validate constraints
        });
    }
}
