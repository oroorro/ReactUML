package com.example.demo.repository;

import com.example.demo.util.IdUtil;

import jakarta.persistence.PersistenceException;

import com.example.demo.model.Attribute;
import com.example.demo.model.Node;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DataJpaTest
public class AttributeRepositoryTest {

    @Autowired
    private AttributeRepository attributeRepository;

    @Autowired
    private NodeRepository nodeRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    @DisplayName("Save Attribute and retrieve by ID")
    void testSaveAndFindById() {
        Node node = new Node();
        node.setUid(IdUtil.generateUniqueId());
        node.setName("Root Node");
        node.setIsStartingNode(true);
        Node savedNode = nodeRepository.save(node);

        Attribute attr = new Attribute();
        attr.setUid(IdUtil.generateUniqueId());
        attr.setName("Speed");
        attr.setMute(false);
        attr.setTotalNumber(10);
        attr.setNode(savedNode);
        Attribute savedAttr = attributeRepository.save(attr);

        Optional<Attribute> fetched = attributeRepository.findById(savedAttr.getId());

        assertThat(fetched).isPresent();
        assertThat(fetched.get().getName()).isEqualTo("Speed");
        assertThat(fetched.get().getNode().getId()).isEqualTo(savedNode.getId());
    }

    @Test
    @DisplayName("Find Attribute by UID")
    void testFindByUid() {
        Node node = new Node();
        node.setUid(IdUtil.generateUniqueId());
        node.setName("Node1");
        node.setIsStartingNode(false);
        Node savedNode = nodeRepository.save(node);

        String uid = IdUtil.generateUniqueId();
        Attribute attr = new Attribute();
        attr.setUid(uid);
        attr.setName("Import");
        attr.setMute(true);
        attr.setTotalNumber(5);
        attr.setNode(savedNode);
        attributeRepository.save(attr);

        Optional<Attribute> found = attributeRepository.findByUid(uid);
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Import");
    }

    @Test
    @DisplayName("Delete Attribute")
    void testDeleteAttribute() {
        Node node = new Node();
        node.setUid("uid-ge1g-123f");
        node.setName("Node2");
        Node savedNode = nodeRepository.save(node);

        Attribute attr = new Attribute();
        attr.setUid("uid-dw123-dwad");
        attr.setName("Weight");
        attr.setMute(false);
        attr.setTotalNumber(3);
        attr.setNode(savedNode);
        Attribute savedAttr = attributeRepository.save(attr);

        attributeRepository.delete(savedAttr);
        Optional<Attribute> deleted = attributeRepository.findById(savedAttr.getId());

        assertThat(deleted).isNotPresent();
    }

    @Test
    void testCreateAttribute_failure_noUID() {
        Node node = new Node();
        node.setUid("uid-ge1g-123f");
        node.setName("Node2");
        Node savedNode = nodeRepository.save(node);

        Attribute attr = new Attribute();
        attr.setName("Weight");
        attr.setMute(false);
        attr.setTotalNumber(3);
        attr.setNode(savedNode);
        attributeRepository.save(attr); //fails as well

        // triggers DB constraint violation on Attribute not having UID
        assertThrows(PersistenceException.class, () -> {
            entityManager.persist(attr);
            entityManager.flush(); 
        });
    }
}

