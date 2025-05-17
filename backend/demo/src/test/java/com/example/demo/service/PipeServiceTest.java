package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import com.example.demo.model.AttributeContent;
import com.example.demo.model.Node;
import com.example.demo.model.Pipe;
import com.example.demo.repository.PipeRepository;

@ExtendWith(MockitoExtension.class)
public class PipeServiceTest {

    @Mock
    private PipeRepository pipeRepository;

    @InjectMocks
    private PipeService pipeService;

    private Node makeNode(String uid, String name) {
        Node node = new Node();
        node.setUid(uid);
        node.setName(name);
        return node;
    }

    private Pipe existing;
    private Node nodeA, nodeB, nodeC;

    @BeforeEach
    void setUp() {
        nodeA = new Node();
        nodeA.setUid("node-A");
        nodeB = new Node();
        nodeB.setUid("node-B");
        nodeC = new Node();
        nodeC.setUid("node-C");

        existing = new Pipe();
        existing.setId(1);
        existing.setUid("pipe-001");
        existing.setName("OldName");
        existing.setColor('X');
        existing.setMute(false);
        existing.setSourceNode(nodeA);
        existing.setTargetNode(nodeB);
    }

    @Test
    void testCreatePipe_nullPipe_thenValid() {
        // 1a: Pipe is null → should fail
        assertThrows(IllegalArgumentException.class, () -> pipeService.createPipe(null));

        // then: test with valid Pipe
        Pipe pipe = new Pipe();
        pipe.setUid("uid-1");
        pipe.setSourceNode(makeNode("node-1", "NodeA"));

        when(pipeRepository.save(pipe)).thenReturn(pipe);
        Pipe saved = pipeService.createPipe(pipe);

        assertEquals("uid-1", saved.getUid());
    }

    @Test
    void testCreatePipe_nullUid_thenValid() {
        // 1b: Pipe's uid is null
        Pipe pipe = new Pipe();
        pipe.setSourceNode(makeNode("node-1", "NodeA"));

        assertThrows(IllegalArgumentException.class, () -> pipeService.createPipe(pipe));

        // then: set uid and retry
        pipe.setUid("uid-2");
        when(pipeRepository.save(pipe)).thenReturn(pipe);
        Pipe saved = pipeService.createPipe(pipe);

        assertEquals("uid-2", saved.getUid());
    }

    @Test
    void testCreatePipe_nullSourceNode_thenValid() {
        // 1c: Pipe’s sourceNode is null
        Pipe pipe = new Pipe();
        pipe.setUid("uid-3");

        assertThrows(IllegalArgumentException.class, () -> pipeService.createPipe(pipe));

        // then: set sourceNode
        pipe.setSourceNode(makeNode("node-3", "NodeC"));
        when(pipeRepository.save(pipe)).thenReturn(pipe);
        Pipe saved = pipeService.createPipe(pipe);

        assertEquals("uid-3", saved.getUid());
    }

    @Test
    void testCreatePipe_sameSourceAndTargetUid_thenValidWithDifferent() {
        // 1d: Source and Target nodes are same (same UID)
        Node sharedNode = makeNode("node-shared", "NodeX");

        Pipe pipe = new Pipe();
        pipe.setUid("uid-4");
        pipe.setSourceNode(sharedNode);
        pipe.setTargetNode(sharedNode); // same instance → same UID

        assertThrows(IllegalArgumentException.class, () -> pipeService.createPipe(pipe));

        // then: set a different targetNode
        pipe.setTargetNode(makeNode("node-different", "NodeY"));
        when(pipeRepository.save(pipe)).thenReturn(pipe);
        Pipe saved = pipeService.createPipe(pipe);

        assertEquals("uid-4", saved.getUid());
        assertEquals("node-different", saved.getTargetNode().getUid());
    }

    // 2a: edit fails when uid is null, then succeeds when uid is set
    @Test
    void testPipe_uidUpdateFailsWhenNull_thenSucceedsWhenRestored() {
        // 1. Setup a valid Pipe
        Pipe pipe = new Pipe();
        pipe.setId(1);
        pipe.setUid("initial-uid");
        pipe.setSourceNode(nodeA);
        pipe.setName("TestPipe");
        pipe.setColor('G');
        pipe.setMute(false);

        // Simulate saving it to the repo initially
        when(pipeRepository.save(pipe)).thenReturn(pipe);
        Pipe saved = pipeService.createPipe(pipe);
        assertEquals("initial-uid", saved.getUid());

        // 2. Attempt to null the UID and save (should throw)
        pipe.setUid(null);
        assertThrows(IllegalArgumentException.class, () -> pipeService.createPipe(pipe));

        // 3. Restore UID and save again
        pipe.setUid("fixed-uid");
        when(pipeRepository.save(pipe)).thenReturn(pipe); // restub
        Pipe fixed = pipeService.createPipe(pipe);
        assertEquals("fixed-uid", fixed.getUid());
    }

    // 2c: edit fails when sourceNode is null, then succeeds with different node
    @Test
    void testEditPipe_failsWhenSourceNodeIsNull() {
        // Given: Pipe is saved with valid sourceNode
        Pipe pipe = new Pipe();
        pipe.setId(1);
        pipe.setUid("pipe-100");
        pipe.setSourceNode(nodeA);
        pipe.setName("OriginalPipe");
        pipe.setColor('B');
        pipe.setMute(false);

        when(pipeRepository.save(pipe)).thenReturn(pipe);
        pipeService.createPipe(pipe); // simulate initial save

        // When: we attempt to edit with null sourceNode
        pipe.setSourceNode(null);
        // when(pipeRepository.findById(1)).thenReturn(Optional.of(pipe));
        // Then: it should throw
        assertThrows(IllegalArgumentException.class, () -> pipeService.editPipe(pipe));
    }

    @Test
    void testEditPipe_sourceNodeChangesSuccessfully_withMock() {
        // Simulate an existing pipe in "database"
        Pipe persistedPipe = new Pipe();
        persistedPipe.setId(1);
        persistedPipe.setUid("pipe-001");
        persistedPipe.setSourceNode(nodeA); // originally nodeA
        persistedPipe.setTargetNode(nodeB);
        persistedPipe.setName("PipeToUpdate");
        persistedPipe.setColor('C');
        persistedPipe.setMute(true);

        // Simulate incoming update
        Pipe updatedPipe = new Pipe();
        updatedPipe.setId(1);
        updatedPipe.setUid("pipe-001");
        updatedPipe.setSourceNode(nodeC); // updated sourceNode
        updatedPipe.setTargetNode(nodeB);
        updatedPipe.setName("PipeToUpdate");
        updatedPipe.setColor('C');
        updatedPipe.setMute(true);

        // Stub the findById to return the persisted pipe
        when(pipeRepository.findById(1)).thenReturn(Optional.of(persistedPipe));

        // Stub save to return the updated pipe
        when(pipeRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        // Call the service
        Pipe result = pipeService.editPipe(updatedPipe);

        // Assert the change happened
        assertNotEquals("node-A", result.getSourceNode().getUid());
        assertEquals("node-C", result.getSourceNode().getUid());

        // Optional: verify save was called
        verify(pipeRepository).save(argThat(p -> "node-C".equals(p.getSourceNode().getUid())));
    }

    // 2d: edit succeeds even when targetNode is null, then updated later
    @Test
    void testEditPipe_targetNodeNullThenChanged() {
        existing.setTargetNode(nodeA); // Initially set

        Pipe updated = new Pipe();
        updated.setId(1);
        updated.setUid("pipe-001");
        updated.setSourceNode(nodeA);
        updated.setName("NewName");
        updated.setTargetNode(null); // allowed

        when(pipeRepository.findById(1)).thenReturn(Optional.of(existing));
        // when(pipeRepository.findById(1)).thenReturn(Optional.of(updated));
        when(pipeRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Pipe result1 = pipeService.editPipe(updated);
        assertNull(result1.getTargetNode());
        assertEquals("NewName", result1.getName());

        // Now set to a different node
        updated.setTargetNode(nodeC);
        Pipe result2 = pipeService.editPipe(updated);
        assertNotNull(result2.getTargetNode());
        assertEquals("node-C", result2.getTargetNode().getUid());
    }

    // 2e: edit name
    @Test
    void testEditPipe_nameUpdated() {
        Pipe updated = new Pipe();
        updated.setId(1);
        updated.setUid("pipe-001");
        updated.setSourceNode(nodeA);
        updated.setName("UpdatedName");

        when(pipeRepository.findById(1)).thenReturn(Optional.of(existing));
        when(pipeRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Pipe result = pipeService.editPipe(updated);
        assertEquals("UpdatedName", result.getName());
    }

    // 2f: edit color
    @Test
    void testEditPipe_colorUpdated() {
        Pipe updated = new Pipe();
        updated.setId(1);
        updated.setUid("pipe-001");
        updated.setSourceNode(nodeA);
        updated.setColor('Z');

        when(pipeRepository.findById(1)).thenReturn(Optional.of(existing));
        when(pipeRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Pipe result = pipeService.editPipe(updated);
        assertEquals('Z', result.getColor());
    }

    // 2g: edit mute
    @Test
    void testEditPipe_muteUpdated() {
        Pipe updated = new Pipe();
        updated.setId(1);
        updated.setUid("pipe-001");
        updated.setSourceNode(nodeA);
        updated.setMute(true);

        when(pipeRepository.findById(1)).thenReturn(Optional.of(existing));
        when(pipeRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Pipe result = pipeService.editPipe(updated);
        assertTrue(result.getMute());
    }

    @Test
    void testEditPipe_failsOnAppendingDuplicateAttributeContentUid() {
        // Step 1: Simulate existing AttributeContent already in DB with UID
        // "duplicate-uid"
        AttributeContent ac1 = new AttributeContent();
        ac1.setUid("duplicate-uid");
        ac1.setName("OriginalAC");
        ac1.setBelongingNode(nodeA);

        Pipe persistedPipe = new Pipe();
        persistedPipe.setId(1);
        persistedPipe.setUid("pipe-001");
        persistedPipe.setSourceNode(nodeA);
        persistedPipe.setAttributeContents(new HashSet<>(Set.of(ac1))); // already persisted

        // Step 2: Prepare a NEW AttributeContent with the SAME UID
        AttributeContent ac2 = new AttributeContent();
        ac2.setUid("duplicate-uid"); // 💥 duplicate!
        ac2.setName("ConflictingAC");
        ac2.setBelongingNode(nodeA);

        // Step 3: Update pipe by APPENDING the conflicting AttributeContent
        Set<AttributeContent> merged = new HashSet<>(persistedPipe.getAttributeContents());
        merged.add(ac2); // this creates conflict
        Pipe updatePipe = new Pipe();
        updatePipe.setId(1);
        updatePipe.setUid("pipe-001");
        updatePipe.setSourceNode(nodeA);
        updatePipe.setAttributeContents(merged);

        // Step 4: Stub findById to return the persisted state
        when(pipeRepository.findById(1)).thenReturn(Optional.of(persistedPipe));

        // Step 5: Simulate save failing due to UID uniqueness
        when(pipeRepository.save(any())).thenThrow(DataIntegrityViolationException.class);

        // check the size of edited pipe
        assertEquals(2, updatePipe.getAttributeContents().size());

        // Step 6: Act + Assert
        assertThrows(DataIntegrityViolationException.class, () -> pipeService.editPipe(updatePipe));
    }

    @Test
    void testEditPipe_succeedsWithUniqueAttributeContentUid() {
        // Given: Pipe with original AttributeContent
        AttributeContent ac1 = new AttributeContent();
        ac1.setUid("old-uid");
        ac1.setName("OldAttr");
        ac1.setBelongingNode(nodeA);

        Pipe persistedPipe = new Pipe();
        persistedPipe.setId(1);
        persistedPipe.setUid("pipe-001");
        persistedPipe.setSourceNode(nodeA);
        persistedPipe.setAttributeContents(new HashSet<>(Set.of(ac1)));

        // Now: create new AC to replace it
        AttributeContent ac2 = new AttributeContent();
        ac2.setUid("new-uid-123");
        ac2.setName("NewAttr");
        ac2.setBelongingNode(nodeA);

        Pipe updatePipe = new Pipe();
        updatePipe.setId(1);
        updatePipe.setUid("pipe-001");
        updatePipe.setSourceNode(nodeA);
        updatePipe.setAttributeContents(new HashSet<>(Set.of(ac2)));

        when(pipeRepository.findById(1)).thenReturn(Optional.of(persistedPipe));
        when(pipeRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        // Act
        Pipe result = pipeService.editPipe(updatePipe);

        // Assert
        assertNotEquals(ac1.getUid(), result.getAttributeContents().iterator().next().getUid());
        assertEquals("new-uid-123", result.getAttributeContents().iterator().next().getUid());
    }

    @Test
    void testEditPipe_attributeContentsMergedAndReplaced() {
        // Step 1: Persisted Pipe has A and B
        AttributeContent acA = new AttributeContent();
        acA.setUid("uid-A");
        acA.setName("AttrA");
        acA.setBelongingNode(nodeA);

        AttributeContent acB1 = new AttributeContent();
        acB1.setUid("uid-B");
        acB1.setName("AttrB");
        acB1.setBelongingNode(nodeA);

        Pipe persistedPipe = new Pipe();
        persistedPipe.setId(1);
        persistedPipe.setUid("pipe-123");
        persistedPipe.setSourceNode(nodeA);
        persistedPipe.setAttributeContents(new HashSet<>(Set.of(acA, acB1)));

        // Step 2: Incoming update has B, C, D
        AttributeContent acB2 = new AttributeContent(); // same UID as acB1
        acB2.setUid("uid-B");
        acB2.setName("AttrB-New"); // maybe renamed
        acB2.setBelongingNode(nodeA);

        AttributeContent acC = new AttributeContent();
        acC.setUid("uid-C");
        acC.setName("AttrC");
        acC.setBelongingNode(nodeA);

        AttributeContent acD = new AttributeContent();
        acD.setUid("uid-D");
        acD.setName("AttrD");
        acD.setBelongingNode(nodeA);

        Pipe updatePipe = new Pipe();
        updatePipe.setId(1);
        updatePipe.setUid("pipe-123");
        updatePipe.setSourceNode(nodeA);
        updatePipe.setAttributeContents(new HashSet<>(Set.of(acB2, acC, acD)));

        // Step 3: Mock repository behavior
        when(pipeRepository.findById(1)).thenReturn(Optional.of(persistedPipe));
        when(pipeRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        // Step 4: Act
        Pipe result = pipeService.editPipe(updatePipe);

        // Step 5: Assert
        Set<String> uids = result.getAttributeContents().stream()
                .map(AttributeContent::getUid)
                .collect(Collectors.toSet());

        assertEquals(3, uids.size());
        assertTrue(uids.contains("uid-B"));
        assertTrue(uids.contains("uid-C"));
        assertTrue(uids.contains("uid-D"));
        assertFalse(uids.contains("uid-A")); // A was removed
    }

}
