package com.example.demo.repository;

import com.example.demo.util.IdUtil;

import jakarta.persistence.PersistenceException;

import com.example.demo.model.Attribute;
import com.example.demo.model.AttributeContent;
import com.example.demo.model.Node;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.InvalidDataAccessApiUsageException;

import java.util.List;
import java.util.Optional;

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

    @Autowired
    private AttributeContentRepository attributeContentRepository;

    //testing using attributeRepository's findById and retrieving Attribute successfully 
    @Test
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

    //testing using attributeRepository's findByUid and retrieving Attribute successfully 
    @Test
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

    //testing deleting Attribute successfully
    @Test
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

    //testing a failure case about creating Attribute with no UID
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
        attr.setId(null);

        Exception ex1 = assertThrows(DataIntegrityViolationException.class, () -> {
            attributeRepository.save(attr); // triggers Hibernate-level error
        });

        Throwable rootCause1 = ex1.getCause();
        assertThat(rootCause1).isInstanceOf(org.hibernate.PropertyValueException.class);

        // incomplete entities with bi-directional relationships causes AssertionFailure
        // entityManager.persist(attr);

        // triggers DB constraint violation on Attribute not having UID
        // Exception ex2 = assertThrows(PersistenceException.class, () -> {

        // entityManager.flush();
        // });

        // Throwable rootCause2 = ex2.getCause();
        // assertThat(rootCause2).isInstanceOf(org.hibernate.exception.ConstraintViolationException.class);
    }

    //testing creating Attribute that fails by having to save a duplicate Attribute with same UID
    @Test
    void testCreateAttribute_failure_duplicate_UID() {
        Node node = new Node();
        node.setUid(IdUtil.generateUniqueId());
        node.setName("Node1");
        node = nodeRepository.save(node);

        String duplicateUid = "fixed-uid-123"; // duplicate UID for both attributes

        Attribute attr1 = new Attribute();
        attr1.setUid(duplicateUid);
        attr1.setName("Attr1");
        attr1.setMute(false);
        attr1.setTotalNumber(1);
        attr1.setNode(node);
        attributeRepository.save(attr1); // should succeed

        Attribute attr2 = new Attribute();
        attr2.setUid(duplicateUid); // same UID!
        attr2.setName("Attr2");
        attr2.setMute(true);
        attr2.setTotalNumber(2);
        attr2.setNode(node);

        Exception ex = assertThrows(DataIntegrityViolationException.class, () -> {
            attributeRepository.save(attr2);
            attributeRepository.flush(); // this triggers DB UNIQUE constraint
        });

        Throwable root = ex.getCause();
        assertThat(root).isInstanceOf(org.hibernate.exception.ConstraintViolationException.class);
    }

    //testing finding Attribute by it's UID after Attribute has been created
    @Test
    void testFindByUid_returnsAttribute() {
        Node node = new Node();
        node.setUid(IdUtil.generateUniqueId());
        node.setName("NodeX");
        node = nodeRepository.save(node);

        Attribute attribute = new Attribute();
        attribute.setUid("attr-123");
        attribute.setName("Speed");
        attribute.setMute(false);
        attribute.setTotalNumber(10);
        attribute.setNode(node);
        attributeRepository.save(attribute);

        Optional<Attribute> result = attributeRepository.findByUid("attr-123");

        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo("Speed");
        assertThat(result.get().getNode().getUid()).isEqualTo(node.getUid());
    }

    //testing finding Attribute by it's UID when Attribute has not been created
    @Test
    void testFindByUid_notFound() {
        Optional<Attribute> result = attributeRepository.findByUid("non-existent-uid");
        assertThat(result).isNotPresent();
    }

    //testing saving Attribute to DB when it has not assigned for Node
    @Test
    void testAttributeWithNullNode_shouldFailToPersist() {
        Attribute attribute = new Attribute();
        attribute.setUid(IdUtil.generateUniqueId());
        attribute.setName("AttrNullNode");
        attribute.setMute(false);
        attribute.setTotalNumber(1);
        attribute.setNode(null); // invalid, because @JoinColumn(nullable = false)

        assertThrows(DataIntegrityViolationException.class, () -> {
            attributeRepository.saveAndFlush(attribute);
        });
    }

    //testing succeeding case of repository's method findByNode where it retrives an Attribute based on given Node 
    @Test
    void testFindByNode_foundCase() {
        Node node = new Node();
        node.setUid(IdUtil.generateUniqueId());
        node.setName("SearchableNode");
        node = nodeRepository.save(node);

        Attribute attr = new Attribute();
        attr.setUid("attr-node-match");
        attr.setName("MatchedAttr");
        attr.setMute(false);
        attr.setTotalNumber(3);
        attr.setNode(node);
        attributeRepository.save(attr);

        List<Attribute> found = attributeRepository.findByNode(node);
        assertThat(found).isNotEmpty();
        assertThat(found.get(0).getUid()).isEqualTo("attr-node-match");
    }

    //testing using attributeRepository's findByNode failing due to un-persisted Node
    @Test
    void testFindByNode_uncreatedNode_notFound() {
        Node notSaved = new Node(); // never persisted
        notSaved.setUid("ghost");
        notSaved.setName("UncreatedNode");

        assertThrows(InvalidDataAccessApiUsageException.class, () -> {
            attributeRepository.findByNode(notSaved);
        });
        
    }

    //testing creating duplicate AttributeContents and saving into Attribute throwing an exception 
    @Test
    void testCascadePersistAttributeContents_withDuplicates() {
        // Create Node
        Node node = new Node();
        node.setUid(IdUtil.generateUniqueId());
        node.setName("NodeCascade");
        node = nodeRepository.save(node);

        // Create Attribute
        Attribute attribute = new Attribute();
        attribute.setUid(IdUtil.generateUniqueId());
        attribute.setName("AttrCascade");
        attribute.setMute(true);
        attribute.setTotalNumber(2);
        attribute.setNode(node);

        // Create unique AttributeContents
        AttributeContent content1 = new AttributeContent();
        content1.setUid(IdUtil.generateUniqueId());
        content1.setName("AC1");
        content1.setBelongingNode(node);
        content1.setAttribute(attribute);

        AttributeContent content2 = new AttributeContent();
        content2.setUid(IdUtil.generateUniqueId());
        content2.setName("AC2");
        content2.setBelongingNode(node);
        content2.setAttribute(attribute);

        AttributeContent content3 = new AttributeContent();
        content3.setUid(IdUtil.generateUniqueId());
        content3.setName("AC3");
        content3.setBelongingNode(node);
        content3.setAttribute(attribute);

        // Add all to attribute
        attribute.getAttributeContents().addAll(List.of(content1, content2, content3));

        // Persist
        attributeRepository.saveAndFlush(attribute);

        // Verify size
        List<AttributeContent> stored = attributeContentRepository.findAll();
        assertThat(stored).hasSize(3);
        assertThat(stored)
                .extracting(AttributeContent::getName)
                .containsExactlyInAnyOrder("AC1", "AC2", "AC3");

        // Attempt to add duplicate
        //AttributeContent duplicate = content1; // same instance does not throw an exception
        AttributeContent duplicate = new AttributeContent(); // different instance
        duplicate.setUid(content1.getUid()); // that has same UID as previously saved AttributeContent
        duplicate.setName("Duplicate");
        attribute.getAttributeContents().add(duplicate);

        // Expect exception on flush due to @perpersist violation by AttributeContent not having Pipe or Attribute
        assertThrows(InvalidDataAccessApiUsageException.class, () -> {
            attributeRepository.saveAndFlush(attribute);
        });

        duplicate.setBelongingNode(node);
        duplicate.setAttribute(attribute); 
         // Expect exception on flush due to uniqueness constraint on UID
         assertThrows(DataIntegrityViolationException.class, () -> {
            attributeRepository.saveAndFlush(attribute);
        });
    }

}
