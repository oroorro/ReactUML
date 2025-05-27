package com.example.demo.service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Attribute;
import com.example.demo.model.AttributeContent;
import com.example.demo.model.Node;
import com.example.demo.model.Pipe;
import com.example.demo.repository.AttributeContentRepository;
import com.example.demo.repository.AttributeRepository;
import com.example.demo.repository.NodeRepository;
import com.example.demo.repository.PipeRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

@Service
public class AttributeContentService {

    @Autowired
    private AttributeContentRepository attributeContentRepository;

    @Autowired
    private AttributeRepository attributeRepository;

    @Autowired
    private NodeRepository nodeRepository;

    @Autowired
    private PipeRepository pipeRepository;

    // Check for duplicate UID
    public void checkDuplicateUid(String uid) {
        boolean exists = attributeContentRepository.findByUid(uid).isPresent();
        if (exists) {
            throw new RuntimeException("UID already exists");
        }
    }

    @Transactional
    public AttributeContent createAttributeContent(AttributeContent content) {

        Pipe pipe = content.getPipe();
        Attribute attribute = content.getAttribute();
        Node belongingNode = content.getBelongingNode();

        if (pipe == null && attribute == null) {
            throw new IllegalArgumentException("AttributeContent must be linked to either an Attribute or a Pipe");
        }

        if (pipe != null && pipe.getUid() != null) {
            Pipe resolvedPipe = pipeRepository.findByUid(pipe.getUid())
                    .orElseThrow(() -> new EntityNotFoundException("Pipe not found with UID: " + pipe.getUid()));
            content.setPipe(resolvedPipe);
        }

        //  Attach managed Attribute entity if present
        if (attribute != null && attribute.getUid() != null) {
            Attribute resolvedAttribute = attributeRepository.findByUid(attribute.getUid())
                    .orElseThrow(() -> new EntityNotFoundException("Attribute not found with UID: " + attribute.getUid()));
            content.setAttribute(resolvedAttribute);
        }

        //  Attach managed BelongingNode entity if present
        if (belongingNode != null && belongingNode.getUid() != null) {
            Node resolvedNode = nodeRepository.findByUid(belongingNode.getUid())
                    .orElseThrow(() -> new EntityNotFoundException("Node not found with UID: " + belongingNode.getUid()));
            content.setBelongingNode(resolvedNode);
        }

        checkDuplicateUid(content.getUid());

        // content.setPipe(pipe);
        // content.setAttribute(attribute);

        return attributeContentRepository.save(content);
    }

    public void cleanUpOrphanedAttributeContents() {
        List<AttributeContent> orphanedContents = attributeContentRepository.findAll().stream()
                .filter(ac -> ac.getPipe() == null && ac.getAttribute() == null)
                .collect(Collectors.toList());

        attributeContentRepository.deleteAll(orphanedContents);
    }

    // Delete by UID
    @Transactional
    public void deleteByUid(String uid) {
        AttributeContent content = attributeContentRepository.findByUid(uid)
                .orElseThrow(() -> new IllegalArgumentException("AttributeContent not found with UID: " + uid));
        attributeContentRepository.delete(content);
    }

    @Transactional
    public AttributeContent editAttributeContent(AttributeContent updatedContent) {
        if (updatedContent == null || updatedContent.getUid() == null) {
            throw new IllegalArgumentException("AttributeContent or its UID cannot be null");
        }

        AttributeContent existing = attributeContentRepository.findByUid(updatedContent.getUid())
                .orElseThrow(() -> new EntityNotFoundException(
                        "AttributeContent not found with UID: " + updatedContent.getUid()));

        boolean modified = false;

        if (!Objects.equals(existing.getName(), updatedContent.getName())) {
            existing.setName(updatedContent.getName());
            modified = true;
        }

        if (updatedContent.getAttribute() != null &&
                (existing.getAttribute() == null ||
                        !Objects.equals(existing.getAttribute().getUid(), updatedContent.getAttribute().getUid()))) {
            existing.setAttribute(updatedContent.getAttribute());
            modified = true;
        }

        if (updatedContent.getPipe() != null &&
                (existing.getPipe() == null ||
                        !Objects.equals(existing.getPipe().getUid(), updatedContent.getPipe().getUid()))) {
            existing.setPipe(updatedContent.getPipe());
            modified = true;
        }

        if (updatedContent.getBelongingNode() != null &&
                (existing.getBelongingNode() == null ||
                        !Objects.equals(existing.getBelongingNode().getUid(),
                                updatedContent.getBelongingNode().getUid()))) {
            existing.setBelongingNode(updatedContent.getBelongingNode());
            modified = true;
        }

        return modified ? attributeContentRepository.save(existing) : existing;
    }

}
