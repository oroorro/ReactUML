package com.example.demo.repository;

import java.util.List;
import java.util.UUID;

import com.example.demo.util.IdUtil;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.InvalidDataAccessApiUsageException;

import com.example.demo.model.Attribute;
import com.example.demo.model.AttributeContent;
import com.example.demo.model.Node;
import com.example.demo.model.Pipe;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DataJpaTest
public class AttributeContentRepositoryTest {

    @Autowired
    private AttributeRepository attributeRepository;

    @Autowired
    private NodeRepository nodeRepository;

    @Autowired
    private PipeRepository pipeRepository;

    @Autowired
    private AttributeContentRepository attributeContentRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void testFindByAttribute() {
        Node node = new Node();
        node.setUid(IdUtil.generateUniqueId());
        node.setName("ParentNode");
        node = nodeRepository.save(node);

        Attribute attr = new Attribute();
        attr.setUid(IdUtil.generateUniqueId());
        attr.setName("AttrB");
        attr.setMute(false);
        attr.setTotalNumber(1);
        attr.setNode(node);
        attr = attributeRepository.save(attr);

        AttributeContent content = new AttributeContent();
        content.setUid(IdUtil.generateUniqueId());
        content.setName("ContentB");
        content.setAttribute(attr);
        content.setBelongingNode(node);
        attributeContentRepository.save(content);

        List<AttributeContent> results = attributeContentRepository.findByAttribute(attr);
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getName()).isEqualTo("ContentB");

    }

    @Test
    void testCreateAttributeContent_failure_duplicate_UID() {
        // Create and save shared Node and Attribute
        Node node = new Node();
        node.setUid(IdUtil.generateUniqueId());
        node.setName("Node1");
        node = nodeRepository.save(node);

        Attribute attr = new Attribute();
        attr.setUid(IdUtil.generateUniqueId());
        attr.setName("Attr1");
        attr.setMute(false);
        attr.setTotalNumber(1);
        attr.setNode(node);
        attr = attributeRepository.save(attr);

        // Create and save first AttributeContent with fixed UID
        String duplicateUid = "fixed-uid-xyz";
        AttributeContent content1 = new AttributeContent();
        content1.setUid(duplicateUid);
        content1.setName("C1");
        content1.setAttribute(attr);
        content1.setBelongingNode(node);
        attributeContentRepository.save(content1);

        // Try saving second AttributeContent with same UID
        AttributeContent content2 = new AttributeContent();
        // duplicate
        content2.setUid(duplicateUid);
        content2.setName("C2");
        content2.setAttribute(attr);
        content2.setBelongingNode(node);

        Exception ex = assertThrows(DataIntegrityViolationException.class, () -> {
            attributeContentRepository.save(content2);
            attributeContentRepository.flush();
        });

        Throwable root = ex.getCause();
        // System.out.println("Duplicate UID Root Cause: " + root.getClass());
        assertThat(root).isInstanceOf(org.hibernate.exception.ConstraintViolationException.class);
    }

    @Test
    void testCreateAttribute_failure_empty_UID() {
        // Setup valid Node and Attribute
        Node node = new Node();
        node.setUid(IdUtil.generateUniqueId());
        node.setName("Node2");
        node = nodeRepository.save(node);

        Attribute attr = new Attribute();
        attr.setUid(IdUtil.generateUniqueId());
        attr.setName("Attr2");
        attr.setMute(true);
        attr.setTotalNumber(2);
        attr.setNode(node);
        attr = attributeRepository.save(attr);

        // Create AttributeContent with null UID
        AttributeContent content = new AttributeContent();
        content.setUid(null); // will trigger @Column(nullable = false)
        content.setName("MissingUID");
        content.setAttribute(attr);
        content.setBelongingNode(node);

        Exception ex = assertThrows(DataIntegrityViolationException.class, () -> {
            attributeContentRepository.save(content);
            attributeContentRepository.flush(); // force constraint check
        });

        Throwable root = ex.getCause();
        // System.out.println("Null UID Root Cause: " + root.getClass());
        assertThat(root).isInstanceOf(org.hibernate.PropertyValueException.class);
    }

    @Test
    void testFindByAttributeId() {
        Node node = new Node();
        node.setUid(IdUtil.generateUniqueId());
        node.setName("NodeA");
        node = nodeRepository.save(node);

        Attribute attr = new Attribute();
        attr.setUid(IdUtil.generateUniqueId());
        attr.setName("AttrA");
        attr.setMute(false);
        attr.setTotalNumber(3);
        attr.setNode(node);
        attr = attributeRepository.save(attr);

        AttributeContent content = new AttributeContent();
        content.setUid(IdUtil.generateUniqueId());
        content.setName("Content1");
        content.setAttribute(attr);
        content.setBelongingNode(node);
        attributeContentRepository.save(content);

        List<AttributeContent> results = attributeContentRepository.findByAttribute_Id(attr.getId());

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getName()).isEqualTo("Content1");
    }

    @Test
    void testFindByAttributeUid() {
        Node node = new Node();
        node.setUid(IdUtil.generateUniqueId());
        node.setName("NodeB");
        node = nodeRepository.save(node);

        String uid = IdUtil.generateUniqueId();
        Attribute attr = new Attribute();
        attr.setUid(uid);
        attr.setName("AttrB");
        attr.setMute(true);
        attr.setTotalNumber(5);
        attr.setNode(node);
        attr = attributeRepository.save(attr);

        AttributeContent content = new AttributeContent();
        content.setUid(IdUtil.generateUniqueId());
        content.setName("Content2");
        content.setAttribute(attr);
        content.setBelongingNode(node);
        attributeContentRepository.save(content);

        List<AttributeContent> results = attributeContentRepository.findByAttribute_Uid(uid);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getAttribute().getUid()).isEqualTo(uid);
        assertThat(results.get(0).getName()).isEqualTo("Content2");

        AttributeContent content3 = new AttributeContent();
        content3.setUid(IdUtil.generateUniqueId());
        content3.setName("Content3");
        content3.setAttribute(attr);
        content3.setBelongingNode(node);
        attributeContentRepository.save(content3);

        List<AttributeContent> results2 = attributeContentRepository.findByAttribute_Uid(uid);

        assertThat(results2).hasSize(2);
        assertThat(results.get(0).getAttribute().getUid()).isEqualTo(uid);
        assertThat(results.get(0).getName()).isEqualTo("Content2");
        assertThat(results2.get(1).getAttribute().getUid()).isEqualTo(uid);
        assertThat(results2.get(1).getName()).isEqualTo("Content3");
        
    }

    //testing a failure case where AttributeContent isn't assigned for Pipe and Attribute
    @Test
    void testCreateAttributeContent_failure_missingAttributeAndPipe() {
        Node node = new Node();
        node.setUid(IdUtil.generateUniqueId());
        node.setName("TestNode");
        node = nodeRepository.save(node);

        AttributeContent content = new AttributeContent();
        content.setUid(IdUtil.generateUniqueId());
        content.setName("InvalidContent");
        content.setBelongingNode(node); // required
        content.setAttribute(null); // both are null
        content.setPipe(null);

        //IllegalStateException gets wrapped as InvalidDataAccessApiUsageException by 
        Exception ex = assertThrows(InvalidDataAccessApiUsageException.class, () -> {
            attributeContentRepository.save(content);
            attributeContentRepository.flush();
        });

        Throwable rootCause = ex.getCause();
        assertThat(rootCause).isInstanceOf(IllegalStateException.class);
        assertThat(rootCause.getMessage()).isEqualTo("AttributeContent must be linked to either an Attribute or a Pipe");
    }


    //testing a case of getting source,target node through getting pipe entity from AttributeContent that is connected to Pipe.
    //using same sourceNode that has been assigned to Pipe for AttributeContent's belongingNode
    @Test
    void testAccessRelationsFromAttributeContent() {
        // Setup Nodes (target and source) for Pipe, then save them to repo
        Node sourceNode = new Node();
        sourceNode.setUid(IdUtil.generateUniqueId());
        sourceNode.setName("SourceNode");
        sourceNode = nodeRepository.save(sourceNode);

        Node targetNode = new Node();
        targetNode.setUid(IdUtil.generateUniqueId());
        targetNode.setName("TargetNode");
        targetNode = nodeRepository.save(targetNode);

        // Setup Pipe and save to repo
        Pipe pipe = new Pipe();
        pipe.setUid(IdUtil.generateUniqueId());
        pipe.setName("PipeX");
        pipe.setMute(false);
        pipe.setSourceNode(sourceNode);
        pipe.setTargetNode(targetNode);
        pipe = pipeRepository.save(pipe); 

        // Setup AttributeContent linked to created Pipe
        AttributeContent content = new AttributeContent();
        content.setUid(IdUtil.generateUniqueId());
        content.setName("LinkedContent");
        content.setPipe(pipe); // linking only to Pipe
        content.setBelongingNode(sourceNode); // using same sourceNode that's been assigned to Pipe already
        content = attributeContentRepository.save(content);

        // Verify access through AttributeContent
        AttributeContent fetched = attributeContentRepository.findById(content.getId()).orElseThrow();

        assertThat(fetched.getPipe()).isNotNull();
        assertThat(fetched.getPipe().getName()).isEqualTo("PipeX");

        assertThat(fetched.getPipe().getSourceNode().getName()).isEqualTo("SourceNode");
        assertThat(fetched.getPipe().getTargetNode().getName()).isEqualTo("TargetNode");
    }

    //testing a case of getting source,target node through getting pipe entity from AttributeContent that is connected to Pipe.
    //using different Node for AttributeContent's belongingNode other than sourceNode, targetNode which were assigned to Pipe already
    @Test
    void testAccessRelationsFromAttributeContent_differentBelongingNodeForAttributeContent() {
        // Setup Nodes (target and source) for Pipe, then save them to repo
        Node sourceNode = new Node();
        String sourceNodeUID = IdUtil.generateUniqueId();
        sourceNode.setUid(sourceNodeUID);
        sourceNode.setName("SourceNode");
        sourceNode = nodeRepository.save(sourceNode);

        Node targetNode = new Node();
        String targetNodeUID = IdUtil.generateUniqueId();
        targetNode.setUid(targetNodeUID);
        targetNode.setName("TargetNode");
        targetNode = nodeRepository.save(targetNode);

        Node anotherNode = new Node();
        String anotherNodeUID = IdUtil.generateUniqueId();
        anotherNode.setUid(anotherNodeUID);
        anotherNode.setName("anotherNode");
        anotherNode = nodeRepository.save(anotherNode);

        // Setup Pipe and save to repo
        Pipe pipe = new Pipe();
        pipe.setUid(IdUtil.generateUniqueId());
        pipe.setName("PipeX");
        pipe.setMute(false);
        pipe.setSourceNode(sourceNode);
        pipe.setTargetNode(targetNode);
        pipe = pipeRepository.save(pipe); 

        // Setup AttributeContent linked to created Pipe
        AttributeContent content = new AttributeContent();
        content.setUid(IdUtil.generateUniqueId());
        content.setName("LinkedContent");
        content.setPipe(pipe); // linking only to Pipe
        content.setBelongingNode(anotherNode); // required
        content = attributeContentRepository.save(content);

        // Verify access through AttributeContent
        AttributeContent fetched = attributeContentRepository.findById(content.getId()).orElseThrow();

        assertThat(fetched.getPipe()).isNotNull();
        assertThat(fetched.getPipe().getName()).isEqualTo("PipeX");
        assertThat(fetched.getBelongingNode()).isNotNull();
        assertThat(fetched.getBelongingNode().getUid()).isEqualTo(anotherNodeUID);

        assertThat(fetched.getPipe().getSourceNode().getName()).isEqualTo("SourceNode");
        assertThat(fetched.getPipe().getSourceNode().getUid()).isEqualTo(sourceNodeUID);
        assertThat(fetched.getPipe().getTargetNode().getName()).isEqualTo("TargetNode");
        assertThat(fetched.getPipe().getTargetNode().getUid()).isEqualTo(targetNodeUID);
    }

    //testing a successful case of creating an AttributeContent which is assigned with only Attribute 
    @Test
    void testCreateAttributeContent_withOnlyAttribute() {
        Node node = new Node();
        node.setUid(IdUtil.generateUniqueId());
        node.setName("NodeA");
        node = nodeRepository.save(node);

        Attribute attribute = new Attribute();
        attribute.setUid(IdUtil.generateUniqueId());
        attribute.setName("AttrA");
        attribute.setMute(false);
        attribute.setTotalNumber(5);
        attribute.setNode(node);
        attribute = attributeRepository.save(attribute);

        AttributeContent content = new AttributeContent();
        content.setUid(IdUtil.generateUniqueId());
        content.setName("ContentOnlyAttr");
        content.setAttribute(attribute);
        content.setBelongingNode(node);

        content = attributeContentRepository.save(content);
        assertThat(content.getId()).isNotNull();
        assertThat(content.getAttribute().getUid()).isEqualTo(attribute.getUid());
        assertThat(content.getPipe()).isNull();
    }

    //testing a successful case of creating an AttributeContent which is assigned with only Pipe 
    @Test
    void testCreateAttributeContent_withOnlyPipe_success() {
        Node node = new Node();
        node.setUid(IdUtil.generateUniqueId());
        node.setName("NodeB");
        node = nodeRepository.save(node);

        Pipe pipe = new Pipe();
        pipe.setUid(IdUtil.generateUniqueId());
        pipe.setName("PipeOnly");
        pipe.setMute(false);
        pipe.setSourceNode(node);
        pipe.setTargetNode(null);
        pipe = pipeRepository.save(pipe);

        AttributeContent content = new AttributeContent();
        content.setUid(IdUtil.generateUniqueId());
        content.setName("ContentOnlyPipe");
        content.setPipe(pipe);
        content.setBelongingNode(node);

        content = attributeContentRepository.save(content);
        assertThat(content.getId()).isNotNull();
        assertThat(content.getPipe().getUid()).isEqualTo(pipe.getUid());
        assertThat(content.getAttribute()).isNull();
    }

    //testing a successful case of creating an AttributeContent which is assigned with both Pipe and Attribute
    @Test
    void testCreateAttributeContent_withAttributeAndPipe_success() {
        Node node = new Node();
        node.setUid(IdUtil.generateUniqueId());
        node.setName("NodeC");
        node = nodeRepository.save(node);

        Attribute attribute = new Attribute();
        attribute.setUid(IdUtil.generateUniqueId());
        attribute.setName("AttrC");
        attribute.setMute(true);
        attribute.setTotalNumber(3);
        attribute.setNode(node);
        attribute = attributeRepository.save(attribute);

        Pipe pipe = new Pipe();
        pipe.setUid(IdUtil.generateUniqueId());
        pipe.setName("PipeC");
        pipe.setMute(false);
        pipe.setSourceNode(node);
        pipe.setTargetNode(null);
        pipe = pipeRepository.save(pipe);

        AttributeContent content = new AttributeContent();
        content.setUid(IdUtil.generateUniqueId());
        content.setName("ContentBoth");
        content.setAttribute(attribute);
        content.setPipe(pipe);
        content.setBelongingNode(node);

        content = attributeContentRepository.save(content);
        assertThat(content.getId()).isNotNull();
        assertThat(content.getAttribute().getUid()).isEqualTo(attribute.getUid());
        assertThat(content.getPipe().getUid()).isEqualTo(pipe.getUid());
    }


    //deleting AttributeContent that was linked to Pipe and Attribute 
    @Test
    void testDeleteAttributeContent_withAttributeAndPipe_success() {
        Node node = new Node();
        node.setUid(IdUtil.generateUniqueId());
        node.setName("NodeC");
        node = nodeRepository.save(node);

        Attribute attribute = new Attribute();
        attribute.setUid(IdUtil.generateUniqueId());
        attribute.setName("AttrC");
        attribute.setMute(true);
        attribute.setTotalNumber(3);
        attribute.setNode(node);
        attribute = attributeRepository.save(attribute);

        Pipe pipe = new Pipe();
        pipe.setUid(IdUtil.generateUniqueId());
        pipe.setName("PipeC");
        pipe.setMute(false);
        pipe.setSourceNode(node);
        pipe.setTargetNode(null);
        pipe = pipeRepository.save(pipe);

        AttributeContent content = new AttributeContent();
        content.setUid(IdUtil.generateUniqueId());
        content.setName("ContentBoth");
        content.setAttribute(attribute);
        content.setPipe(pipe);
        content.setBelongingNode(node);

        content = attributeContentRepository.save(content);
        assertThat(content.getId()).isNotNull();
        assertThat(content.getAttribute().getUid()).isEqualTo(attribute.getUid());
        assertThat(content.getPipe().getUid()).isEqualTo(pipe.getUid());
        List<AttributeContent> results1 = attributeContentRepository.findAll();
        assertThat(results1).hasSize(1);

        attributeContentRepository.delete(content);
        List<AttributeContent> results2 = attributeContentRepository.findAll();
        assertThat(results2).hasSize(0);
    }




    //edit AttirbuteContent's value 
    @Test
    void testEditAttributeContent_withAttributeAndPipe_success() {
        Node node = new Node();
        node.setUid(IdUtil.generateUniqueId());
        node.setName("NodeC");
        node = nodeRepository.save(node);

        Node node2 = new Node();
        node2.setUid(IdUtil.generateUniqueId());
        node2.setName("NodeC2");
        node2 = nodeRepository.save(node2);

        Attribute attribute = new Attribute();
        attribute.setUid(IdUtil.generateUniqueId());
        attribute.setName("AttrC");
        attribute.setMute(true);
        attribute.setTotalNumber(3);
        attribute.setNode(node);
        attribute = attributeRepository.save(attribute);

        Pipe pipe = new Pipe();
        pipe.setUid(IdUtil.generateUniqueId());
        pipe.setName("PipeC");
        pipe.setMute(false);
        pipe.setSourceNode(node);
        pipe.setTargetNode(null);
        pipe = pipeRepository.save(pipe);

        AttributeContent content = new AttributeContent();
        String AttribContent1Uid = IdUtil.generateUniqueId();
        content.setUid(AttribContent1Uid);
        content.setName("ContentBoth");
        content.setAttribute(attribute);
        content.setPipe(pipe);
        content.setBelongingNode(node);

        content = attributeContentRepository.save(content);
        assertThat(content.getId()).isNotNull();
        assertThat(content.getAttribute().getUid()).isEqualTo(attribute.getUid());
        assertThat(content.getPipe().getUid()).isEqualTo(pipe.getUid());
        List<AttributeContent> results1 = attributeContentRepository.findAll();
        assertThat(results1).hasSize(1);

        //edit name 
        content.setName("ContentBothAfter");

        //change to another pipe and Attribute 
        Attribute attribute2 = new Attribute();
        attribute2.setUid(IdUtil.generateUniqueId());
        attribute2.setName("AttrC2");
        attribute2.setMute(false);
        attribute2.setTotalNumber(5);
        attribute2.setNode(node2);
        attribute2 = attributeRepository.save(attribute2);

        Pipe pipe2 = new Pipe();
        pipe2.setUid(IdUtil.generateUniqueId());
        pipe2.setName("PipeC2");
        pipe2.setMute(false);
        pipe2.setSourceNode(node);
        pipe2.setTargetNode(node2);
        pipe2 = pipeRepository.save(pipe2);

        content.setAttribute(attribute2);
        content.setPipe(pipe2);
        content.setBelongingNode(node2);

        //find AttributeContent by it's UID then check for changed name 
        AttributeContent attrb = attributeContentRepository.findByUid(AttribContent1Uid);
        assertThat(attrb.getUid()).isEqualTo(AttribContent1Uid);
        assertThat(attrb.getName()).isEqualTo("ContentBothAfter");
        assertThat(attrb.getPipe().getName()).isEqualTo("PipeC2");
        assertThat(attrb.getPipe().getSourceNode().getName()).isEqualTo("NodeC");
        assertThat(attrb.getPipe().getTargetNode().getName()).isEqualTo("NodeC2");
        assertThat(attrb.getAttribute().getName()).isEqualTo("AttrC2");
        assertThat(attrb.getAttribute().getNode().getName()).isEqualTo("NodeC2");
        assertThat(attrb.getBelongingNode().getName()).isEqualTo("NodeC2");
    }

    @Test
    void testEditAttributeContent_withAttribute_success(){

    }

    @Test
    void testEditAttributeContent_withPipe_success(){

    }

    @Test
    void testCascadeDeleteAttributeContent() {
        // Create shared Node
        // Node node = new Node();
        // node.setUid(IdUtil.generateUniqueId());
        // node.setName("Anchor");
        // node = nodeRepository.save(node);

        // // Create Attribute
        // Attribute attribute = new Attribute();
        // attribute.setUid(IdUtil.generateUniqueId());
        // attribute.setName("Attr1");
        // attribute.setMute(false);
        // attribute.setTotalNumber(1);
        // attribute.setNode(node);
        // attribute = attributeRepository.save(attribute);

        // Create Pipe
        // Pipe pipe = new Pipe();
        // pipe.setUid(IdUtil.generateUniqueId());
        // pipe.setName("Pipe1");
        // pipe.setMute(false);
        // pipe.setSourceNode(node);
        // pipe.setTargetNode(null);
        // pipe = pipeRepository.save(pipe);

        // // --- Case 1: AC linked only to Pipe ---
        // AttributeContent ac1 = new AttributeContent();
        // ac1.setUid(IdUtil.generateUniqueId());
        // ac1.setName("OnlyPipe");
        // ac1.setBelongingNode(node);
        // ac1.setPipe(pipe);
        // attributeContentRepository.save(ac1);

        // --- Case 2: AC linked to both Pipe and Attribute ---
        // AttributeContent ac2 = new AttributeContent();
        // ac2.setUid(IdUtil.generateUniqueId());
        // ac2.setName("BothLinked");
        // ac2.setBelongingNode(node);
        // ac2.setPipe(pipe);
        // ac2.setAttribute(attribute);
        // attributeContentRepository.save(ac2);

        // // AC linked only to Attribute ---
        // AttributeContent ac3 = new AttributeContent();
        // ac3.setUid(IdUtil.generateUniqueId());
        // ac3.setName("OnlyAttr");
        // ac3.setBelongingNode(node);
        // ac3.setAttribute(attribute);
        // attributeContentRepository.save(ac3);

        // // Flush to DB
        // entityManager.flush();
        // entityManager.clear();
    

        // // Delete pipe
        // pipe = pipeRepository.findById(pipe.getId()).orElseThrow();
        // pipeRepository.delete(pipe);
        
        // entityManager.flush();

        // // At this point:
        // // - ac1 should be gone since it only had pipe and pipe got deleted 
        // // - ac2 still exists (has attribute) 
        // // - ac3 should exist 

        // List<AttributeContent> afterPipeDelete = attributeContentRepository.findAll();
        // assertThat(afterPipeDelete)
        //         .extracting(AttributeContent::getName) //error, "BothLinked" gets deleted as well
        //         .contains("BothLinked", "OnlyAttr")
        //         .doesNotContain("OnlyPipe");

        // // Delete attribute
        // attributeRepository.delete(attribute);
        // entityManager.flush();

        // // Now all ACs should be gone
        // List<AttributeContent> finalCheck = attributeContentRepository.findAll();
        // assertThat(finalCheck).isEmpty();
    }

    

}
