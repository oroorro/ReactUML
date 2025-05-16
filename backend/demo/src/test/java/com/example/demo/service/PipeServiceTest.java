package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;

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
void testPipe_sourceNodeUpdateFailsWhenNull_thenSucceedsWhenRestored() {
    // 1. Save initial valid pipe
    Pipe pipe = new Pipe();
    pipe.setId(1);
    pipe.setUid("pipe-002");
    pipe.setSourceNode(nodeA);
    pipe.setName("PipeX");
    pipe.setColor('B');
    pipe.setMute(false);

    when(pipeRepository.save(pipe)).thenReturn(pipe);
    Pipe saved = pipeService.createPipe(pipe);
    assertEquals("pipe-002", saved.getUid());
    assertEquals("node-A", saved.getSourceNode().getUid());

    // 2. Now try setting sourceNode = null and call createPipe (should fail)
    pipe.setSourceNode(null);
    assertThrows(IllegalArgumentException.class, () -> pipeService.createPipe(pipe));

    // 3. Set a new valid sourceNode and edit the pipe
    pipe.setSourceNode(nodeC);
    when(pipeRepository.findById(1)).thenReturn(Optional.of(saved));
    when(pipeRepository.save(pipe)).thenReturn(pipe);

    Pipe updated = pipeService.editPipe(pipe);

    assertNotEquals("node-A", updated.getSourceNode().getUid());
    assertEquals("node-C", updated.getSourceNode().getUid());
}


    // 2d: edit succeeds even when targetNode is null, then updated later
    @Test
    void testEditPipe_targetNodeNullThenChanged() {
        existing.setTargetNode(nodeA); // Initially set

        Pipe updated = new Pipe();
        updated.setId(1);
        updated.setUid("pipe-001");
        updated.setSourceNode(nodeA);
        updated.setTargetNode(null); // allowed

        when(pipeRepository.findById(1)).thenReturn(Optional.of(existing));
        when(pipeRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Pipe result1 = pipeService.editPipe(updated);
        assertNull(result1.getTargetNode());

        // Now set to a different node
        updated.setTargetNode(nodeC);
        Pipe result2 = pipeService.editPipe(updated);
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

}
