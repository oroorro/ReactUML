package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.dao.DataIntegrityViolationException;

import com.example.demo.model.Attribute;
import com.example.demo.model.Node;
import com.example.demo.repository.AttributeRepository;

import jakarta.persistence.EntityNotFoundException;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class AttributeServiceTest {

    @Mock
    private AttributeRepository attributeRepository;

    @InjectMocks
    private AttributeService attributeService;

    private Node node;

    @BeforeEach
    void setup() {
        node = new Node();
        node.setUid("node-uid");
        node.setName("NodeA");
    }

    // 1a: Attribute is null → fail, then success
    @Test
    void testCreateAttribute_nullAttribute_thenValid() {
        // Attribute is null → fail
        assertThrows(IllegalArgumentException.class, () -> attributeService.createAttribute(null));

        // success case
        Attribute validAttr = new Attribute();
        validAttr.setUid("attr-uid");
        validAttr.setNode(node);

        when(attributeRepository.save(validAttr)).thenReturn(validAttr);
        Attribute saved = attributeService.createAttribute(validAttr);

        assertEquals("attr-uid", saved.getUid());
    }

    // 1b: UID is null → fail, then success
    @Test
    void testCreateAttribute_uidNull_thenValid() {
        // UID is null → fail
        Attribute attr = new Attribute();
        attr.setUid(null);
        attr.setNode(node);

        assertThrows(IllegalArgumentException.class, () -> attributeService.createAttribute(attr));

        attr.setUid("valid-uid");
        when(attributeRepository.save(attr)).thenReturn(attr);
        Attribute saved = attributeService.createAttribute(attr);

        assertEquals("valid-uid", saved.getUid());
    }

    // 1c: Node is null → optional based on model; here we simulate failure
    @Test
    void testCreateAttribute_nodeNull_thenValid() {
        Attribute attr = new Attribute();
        attr.setUid("attr-no-node");
        attr.setNode(null); // simulate missing required field

        // Optional: if your model throws at save due to missing FK
        when(attributeRepository.save(attr)).thenThrow(DataIntegrityViolationException.class);

        assertThrows(DataIntegrityViolationException.class, () -> attributeService.createAttribute(attr));

        // Now valid
        attr.setNode(node);
        when(attributeRepository.save(attr)).thenReturn(attr);
        Attribute saved = attributeService.createAttribute(attr);

        assertEquals("attr-no-node", saved.getUid());
        assertEquals("node-uid", saved.getNode().getUid());
    }

    // 1d: Duplicate UID → conflict error
    @Test
    void testCreateAttribute_duplicateUidFails() {
        Attribute attr = new Attribute();
        attr.setUid("duplicate-uid");
        attr.setNode(node);

        when(attributeRepository.save(attr)).thenThrow(DataIntegrityViolationException.class);

        assertThrows(DataIntegrityViolationException.class, () -> attributeService.createAttribute(attr));
    }

    // 2a. Test successful creation when all fields are valid
    @Test
    void testCreateAttribute_success() {
        Attribute attr = new Attribute();
        attr.setUid("attr-valid");
        attr.setName("Weight");
        attr.setMute(false);
        attr.setTotalNumber(3);
        attr.setNode(node);

        when(attributeRepository.save(attr)).thenReturn(attr);
        Attribute result = attributeService.createAttribute(attr);

        assertEquals("attr-valid", result.getUid());
        assertEquals("Weight", result.getName());
        assertEquals(3, result.getTotalNumber());
        assertFalse(result.getMute());
        assertEquals(node, result.getNode());
    }

    // 2b. Test that name, totalNumber, or mute can be null if optional
    @Test
    void testCreateAttribute_optionalFieldsNullIfAllowed() {
        Attribute attr = new Attribute();
        attr.setUid("attr-optional");
        attr.setNode(node);

        when(attributeRepository.save(attr)).thenReturn(attr);
        Attribute result = attributeService.createAttribute(attr);

        assertEquals("attr-optional", result.getUid());
        assertEquals(node, result.getNode());
    }

    // 2c. Test that two attributes can be created with same name but different UID
    @Test
    void testCreateAttribute_sameNameDifferentUid_success() {
        Attribute attr1 = new Attribute();
        attr1.setUid("uid-1");
        attr1.setName("DuplicateName");
        attr1.setNode(node);

        Attribute attr2 = new Attribute();
        attr2.setUid("uid-2");
        attr2.setName("DuplicateName");
        attr2.setNode(node);

        when(attributeRepository.save(attr1)).thenReturn(attr1);
        when(attributeRepository.save(attr2)).thenReturn(attr2);

        Attribute res1 = attributeService.createAttribute(attr1);
        Attribute res2 = attributeService.createAttribute(attr2);

        assertEquals("uid-1", res1.getUid());
        assertEquals("uid-2", res2.getUid());
    }

    // 2e. Test creation fails if the node assigned is invalid or not persisted
    @Test
    void testCreateAttribute_failsIfNodeTransient() {
        Attribute attr = new Attribute();
        attr.setUid("attr-x");
        attr.setNode(new Node()); // not saved

        when(attributeRepository.save(attr)).thenThrow(DataIntegrityViolationException.class);

        assertThrows(DataIntegrityViolationException.class, () -> attributeService.createAttribute(attr));
    }

    // 3a: Deleting non-existent UID should throw
    @Test
    // @Timeout(value = 3, unit = TimeUnit.SECONDS)
    void testDeleteAttribute_notFound_throwsException() {
        String nonExistentUid = "not-found-uid";

        when(attributeRepository.findByUid(nonExistentUid)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> {
                    System.err.println("Calling deleteAttribute...");
                    attributeService.deleteAttribute(nonExistentUid);
                });

        verify(attributeRepository, never()).delete(any());
    }

    // @Test
    // void testDeleteAttribute_nullUid_shouldThrow() {
    //     IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
    //             () -> attributeService.deleteAttribute(null));
    //     assertEquals("UID cannot be null", ex.getMessage());
    // }

    // // 3b: Deleting valid attribute should succeed
    // @Test
    // void testDeleteAttribute_successfullyDeletes() {
    //     String validUid = "existing-uid";

    //     Attribute attr = new Attribute();
    //     attr.setUid(validUid);

    //     when(attributeRepository.findByUid(validUid)).thenReturn(Optional.of(attr));

    //     attributeService.deleteAttribute(validUid);

    //     verify(attributeRepository).delete(attr);
    // }

    // // 5a1. Successfully edit an Attribute's name
    // @Test
    // void testEditAttribute_successfullyUpdatesName() {
    //     Attribute existing = new Attribute();
    //     existing.setUid("attr-1");
    //     existing.setName("Original");
    //     existing.setNode(node);

    //     Attribute updated = new Attribute();
    //     updated.setUid("attr-1");
    //     updated.setName("Updated");
    //     updated.setNode(node);

    //     when(attributeRepository.findByUid("attr-1")).thenReturn(Optional.of(existing));
    //     when(attributeRepository.save(any())).thenAnswer(i -> i.getArgument(0));

    //     Attribute result = attributeService.editAttribute(updated);

    //     assertEquals("Updated", result.getName());
    //     assertNotEquals("Original", result.getName());
    // }

    // // 5a2. Fail edit when UID is null
    // @Test
    // void testEditAttribute_failsWhenUidIsNull() {
    //     Attribute updated = new Attribute();
    //     updated.setUid(null); // invalid
    //     updated.setNode(node);

    //     assertThrows(IllegalArgumentException.class, () -> attributeService.editAttribute(updated));
    // }

    // // 5b1. Successfully update the Node
    // @Test
    // void testEditAttribute_successfullyUpdatesNode() {
    //     Node newNode = new Node();
    //     newNode.setUid("node-B");

    //     Attribute existing = new Attribute();
    //     existing.setUid("attr-1");
    //     existing.setNode(node);

    //     Attribute updated = new Attribute();
    //     updated.setUid("attr-1");
    //     updated.setNode(newNode);

    //     when(attributeRepository.findByUid("attr-1")).thenReturn(Optional.of(existing));
    //     when(attributeRepository.save(any())).thenAnswer(i -> i.getArgument(0));

    //     Attribute beforeEdit = attributeService.getAttribute("attr-1");
    //     assertEquals("node-uid", beforeEdit.getNode().getUid());

    //     Attribute result = attributeService.editAttribute(updated);

    //     assertEquals("node-B", result.getNode().getUid());
    //     assertNotEquals("node-uid", result.getNode().getUid());

    //     Attribute afterEdit = attributeService.getAttribute("attr-1");
    //     assertEquals("node-B", afterEdit.getNode().getUid());
    // }

    // // 5b2. Node is null — skip update, no exception
    // @Test
    // void testEditAttribute_skipsUpdateWhenNodeIsNull() {
    //     Attribute existing = new Attribute();
    //     existing.setUid("attr-1");
    //     existing.setNode(node);

    //     Attribute updated = new Attribute();
    //     updated.setUid("attr-1");
    //     updated.setNode(null); // null node

    //     when(attributeRepository.findByUid("attr-1")).thenReturn(Optional.of(existing));
    //     //when(attributeRepository.save(any())).thenAnswer(i -> i.getArgument(0));

    //     Attribute result = attributeService.editAttribute(updated);

    //     assertEquals("node-uid", result.getNode().getUid()); // unchanged
    //     verify(attributeRepository, never()).save(any());
    // }

    // // 5b3. Node exists but UID is null — skip update
    // @Test
    // void testEditAttribute_skipsUpdateWhenNodeUidIsNull() {
    //     Node badNode = new Node(); // no UID

    //     Attribute existing = new Attribute();
    //     existing.setUid("attr-1");
    //     existing.setNode(node);

    //     Attribute updated = new Attribute();
    //     updated.setUid("attr-1");
    //     updated.setNode(badNode);

    //     when(attributeRepository.findByUid("attr-1")).thenReturn(Optional.of(existing));
    //     //when(attributeRepository.save(any())).thenAnswer(i -> i.getArgument(0));

    //     //Attribute result = attributeService.editAttribute(updated);

    //     //assertNull(result); // result is
    //     //verify(attributeRepository, never()).save(any());
    //     assertThrows(Exception.class, () -> attributeService.editAttribute(updated));
    // }

    // // 5c1. Fail when Attribute input is null
    // @Test
    // void testEditAttribute_failsWhenAttributeIsNull() {
    //     assertThrows(IllegalArgumentException.class, () -> attributeService.editAttribute(null));
    // }

    //8a. tests getAttribute
    @Test
    void testGetAttribute_success() {
        Attribute attr = new Attribute();
        attr.setUid("attr-uid");
        attr.setName("Strength");

        when(attributeRepository.findByUid("attr-uid")).thenReturn(Optional.of(attr));

        Attribute result = attributeService.getAttribute("attr-uid");

        assertEquals("Strength", result.getName());
        assertEquals("attr-uid", result.getUid());
    }

    //8b.tests getAttribute
    @Test
    void testGetAttribute_notFound_shouldThrow() {
        when(attributeRepository.findByUid("missing")).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> attributeService.getAttribute("missing"));
    }

    //8c.tests getAttribute fails on null
    @Test
    void testGetAttribute_nullUid_shouldThrow() {
        assertThrows(IllegalArgumentException.class, () -> attributeService.getAttribute(null));
    }

}
