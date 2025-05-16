package com.example.demo.repository;

import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

import com.example.demo.model.Node;
import com.example.demo.model.Pipe;
import com.example.demo.util.IdUtil;

import jakarta.persistence.PersistenceException;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DataJpaTest
public class PipeRepositoryTest {

    @Autowired
    private PipeRepository pipeRepository;

    @Autowired
    private NodeRepository nodeRepository;

    private Node createNode(String name) {
        Node node = new Node();
        node.setUid(IdUtil.generateUniqueId());
        node.setName(name);
        return nodeRepository.save(node);
    }

    // 1:Pipe with null UID should fail
    @Test
    void testPipeWithNullUid_shouldFailToPersist() {
        Node source = createNode("Source");

        Pipe pipe = new Pipe();
        pipe.setUid(null);
        pipe.setSourceNode(source);
        pipe.setName("NullUidPipe");
        pipe.setColor('G');
        pipe.setMute(false);

        assertThrows(DataIntegrityViolationException.class, () -> {
            pipeRepository.saveAndFlush(pipe);
        });
    }

    // 2:Pipe with null targetNode should succeed
    @Test
    void testPipeWithNullTargetNode_shouldPersist() {
        Node source = createNode("Source");

        Pipe pipe = new Pipe();
        pipe.setUid(IdUtil.generateUniqueId());
        pipe.setSourceNode(source);
        pipe.setTargetNode(null); // allowed
        pipe.setName("NoTarget");
        pipe.setColor('B');
        pipe.setMute(false);

        pipe = pipeRepository.saveAndFlush(pipe);

        Optional<Pipe> fetched = pipeRepository.findById(pipe.getId());
        assertThat(fetched).isPresent();
        assertThat(fetched.get().getTargetNode()).isNull();
    }

    // 2b:Pipe with non-null targetNode should succeed
    @Test
    void testPipeWithNonNullTargetNode_shouldPersist() {
        Node source = createNode("Source");
        Node target = createNode("Target");

        Pipe pipe = new Pipe();
        pipe.setUid(IdUtil.generateUniqueId());
        pipe.setSourceNode(source);
        pipe.setTargetNode(target);
        pipe.setName("Targeted");
        pipe.setColor('T');
        pipe.setMute(true);

        Pipe saved = pipeRepository.saveAndFlush(pipe);
        assertThat(saved.getTargetNode()).isEqualTo(target);
    }

    // 3:Pipe with null sourceNode should fail
    @Test
    void testPipeWithNullSourceNode_shouldFailToPersist() {
        Pipe pipe = new Pipe();
        pipe.setUid(IdUtil.generateUniqueId());
        pipe.setSourceNode(null); // required
        pipe.setName("NoSource");
        pipe.setColor('R');
        pipe.setMute(false);

        assertThrows(DataIntegrityViolationException.class, () -> {
            pipeRepository.saveAndFlush(pipe);
        });
    }

    // 3b:Pipe with non-null sourceNode should persist
    @Test
    void testPipeWithNonNullSourceNode_shouldPersist() {
        Node source = createNode("Source");

        Pipe pipe = new Pipe();
        pipe.setUid(IdUtil.generateUniqueId());
        pipe.setSourceNode(source);
        pipe.setName("SourceValid");
        pipe.setColor('S');
        pipe.setMute(false);

        Pipe saved = pipeRepository.saveAndFlush(pipe);
        assertThat(saved.getSourceNode().getUid()).isEqualTo(source.getUid());
    }

    // 4:Delete Pipe successfully
    @Test
    void testDeletePipe_successful() {
        Node source = createNode("Source");
        Pipe pipe = new Pipe();
        pipe.setUid("to-delete");
        pipe.setSourceNode(source);
        pipe.setName("DeleteMe");
        pipe.setColor('D');
        pipe.setMute(false);
        pipe = pipeRepository.saveAndFlush(pipe);

        pipeRepository.delete(pipe);
        pipeRepository.flush();

        assertThat(pipeRepository.findById(pipe.getId())).isNotPresent();
    }

    // 5:Delete Pipe unsuccessfully — not in DB
    @Test
    void testDeletePipe_unsuccessful_noException() {
        Pipe fakePipe = new Pipe();
        fakePipe.setId(9999); // fake ID
        pipeRepository.delete(fakePipe); // JPA silently ignores if entity isn't managed
        pipeRepository.flush();
    }

    // 6:Save multiple pipes and check ordering or count
    @Test
    void testSaveMultiplePipesAndCount() {
        Node source = createNode("S");

        for (int i = 0; i < 5; i++) {
            Pipe pipe = new Pipe();
            pipe.setUid("pipe-" + i);
            pipe.setSourceNode(source);
            pipe.setName("Pipe" + i);
            pipe.setColor((char) ('A' + i));
            pipe.setMute(i % 2 == 0);
            pipeRepository.save(pipe);
        }

        assertThat(pipeRepository.count()).isEqualTo(5);
    }

    // 7:find Pipe based on it's uid demonstrating success and failure case using
    // pipeRepo's findByUid
    @Test
    void testFindByUid_successAndFailure() {
        Node source = createNode("S1");

        Pipe pipe = new Pipe();
        pipe.setUid("unique-uid-001");
        pipe.setSourceNode(source);
        pipe.setName("MyPipe");
        pipe.setColor('X');
        pipe.setMute(true);
        pipeRepository.saveAndFlush(pipe);

        // Success case
        Optional<Pipe> found = pipeRepository.findByUid("unique-uid-001");
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("MyPipe");

        // Failure case
        Optional<Pipe> notFound = pipeRepository.findByUid("non-existent-uid");
        assertThat(notFound).isNotPresent();
    }

    // 8:find Pipe based on it's sourceNode demonstrating success and failure case
    // using pipeRepo's findBySourceNode
    @Test
    void testFindBySourceNode_successAndFailure() {
        Node source1 = createNode("Source1");
        Node source2 = createNode("Source2"); // never used

        Pipe pipe1 = new Pipe();
        pipe1.setUid("pipe-src-1");
        pipe1.setSourceNode(source1);
        pipe1.setName("PipeFromS1");
        pipe1.setColor('A');
        pipe1.setMute(false);

        Pipe pipe2 = new Pipe();
        pipe2.setUid("pipe-src-2");
        pipe2.setSourceNode(source1);
        pipe2.setName("PipeFromS1-B");
        pipe2.setColor('B');
        pipe2.setMute(true);

        pipeRepository.saveAll(List.of(pipe1, pipe2));

        // Success: should find 2 pipes for source1
        List<Pipe> found = pipeRepository.findBySourceNode(source1);
        assertThat(found).hasSize(2);

        // Failure: no pipes for source2
        List<Pipe> notFound = pipeRepository.findBySourceNode(source2);
        assertThat(notFound).isEmpty();
    }

    //9: uid that exceeds length on Pipe should fail
    @Test
    void testUidExceedsLength_shouldFail() {
        Node source = createNode("NodeX");

        Pipe pipe = new Pipe();
        pipe.setUid("this-is-way-too-long-for-uid-column");
        pipe.setSourceNode(source);
        pipe.setName("LongUID");
        pipe.setMute(false);
        pipe.setColor('X');

        assertThrows(DataIntegrityViolationException.class, () -> {
            pipeRepository.saveAndFlush(pipe);
        });
    }

    //10:saving two pipes with the same UID. This should fail.
    @Test
    void testSaveDuplicateUid_shouldFail() {
        Node source = createNode("NodeA");

        Pipe p1 = new Pipe();
        p1.setUid("dup-uid");
        p1.setName("P1");
        p1.setSourceNode(source);
        p1.setMute(false);
        p1.setColor('A');

        Pipe p2 = new Pipe();
        p2.setUid("dup-uid"); // same UID
        p2.setName("P2");
        p2.setSourceNode(source);
        p2.setMute(true);
        p2.setColor('B');

        pipeRepository.saveAndFlush(p1);

        assertThrows(DataIntegrityViolationException.class, () -> {
            pipeRepository.saveAndFlush(p2);
        });
    }

}
