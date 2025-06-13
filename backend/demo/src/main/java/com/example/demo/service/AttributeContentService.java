package com.example.demo.service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
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
    public boolean deleteByUid(String uid) {
        if (uid == null || uid.isBlank()) return false;
        
        Optional<AttributeContent> contentOpt = attributeContentRepository.findByUid(uid);
        if (contentOpt.isPresent()) {
            attributeContentRepository.delete(contentOpt.get());
            return true;
        }
        return false;
    }

    @Transactional
    public boolean editAttributeContent(AttributeContent updatedContent) {
        if (updatedContent == null || updatedContent.getUid() == null) {
            return false;
        }
        // Disallowed deletions cases 
        if (updatedContent.getUid() != null && updatedContent.getUid().isBlank()) {
            return false;
        }
        if (updatedContent.getName() != null && updatedContent.getName().isBlank()) {
            return false;
        }
    
        // Check if the attribute content exists in the database
        Optional<AttributeContent> existingOpt = attributeContentRepository.findByUid(updatedContent.getUid());
        if (!existingOpt.isPresent()) {
            // If the attribute content does not exist, return false
            return false;
        }

        AttributeContent existing = existingOpt.get();
        boolean modified = false;

        if (updatedContent.getName() != null && !Objects.equals(existing.getName(), updatedContent.getName())) {
            existing.setName(updatedContent.getName());
            modified = true;
        }

        // if (updatedContent.getHoldingValue() != null && !Objects.equals(existing.getHoldingValue(), updatedContent.getHoldingValue())) {
        //     existing.setHoldingValue(updatedContent.getHoldingValue());
        //     modified = true;
        // }

         // Allowed deletions
        if (updatedContent.getHoldingValue() != null) {
            if (updatedContent.getHoldingValue().isBlank()) {
                existing.setHoldingValue(null);
            } else if (!updatedContent.getHoldingValue().equals(existing.getHoldingValue())) {
                existing.setHoldingValue(updatedContent.getHoldingValue());
            }
            modified = true;
        }

        // if (updatedContent.getAttribute() != null &&
        //         (existing.getAttribute() == null ||
        //                 !Objects.equals(existing.getAttribute().getUid(), updatedContent.getAttribute().getUid()))) {

        //     Attribute resolvedAttribute = attributeRepository.findByUid(updatedContent.getAttribute().getUid())
        //             .orElseThrow(() -> new EntityNotFoundException("Attribute not found with UID: " + updatedContent.getAttribute().getUid()));
        //     existing.setAttribute(resolvedAttribute);
        //     modified = true;
        // }

        if (updatedContent.getAttribute() != null) { //updated AttributeContet's attribute object is not null
            //given updated AttributeContet's Attribute uid is blank and not null
            if (updatedContent.getAttribute().getUid() != null && updatedContent.getAttribute().getUid().isBlank()) {
                //then set the attribute to null
                System.err.println("setting attribute to null");
                existing.setAttribute(null);
            } 
            //given updated AttributeContent's attribute object is not equal to the existing attribute object
            else if (!updatedContent.getAttribute().equals(existing.getAttribute())) {
                //check if the attribute exists in the database
                Attribute resolvedAttribute = attributeRepository.findByUid(updatedContent.getAttribute().getUid())
                    .orElseThrow(() -> new EntityNotFoundException("Attribute not found with UID: " + updatedContent.getAttribute().getUid()));
                //if the attribute exists in the database, then set the attribute to the resolved attribute
                existing.setAttribute(resolvedAttribute);
            }
            modified = true;
        }

        // if (updatedContent.getPipe() != null &&
        //         (existing.getPipe() == null ||
        //                 !Objects.equals(existing.getPipe().getUid(), updatedContent.getPipe().getUid()))) {
        //     Pipe resolvedPipe = pipeRepository.findByUid(updatedContent.getPipe().getUid())
        //             .orElseThrow(() -> new EntityNotFoundException("Pipe not found with UID: " + updatedContent.getPipe().getUid()));
        //     existing.setPipe(resolvedPipe);
        //     //existing.setPipe(updatedContent.getPipe());
        //     modified = true;
        // }

        if (updatedContent.getPipe() != null) {
            if (updatedContent.getPipe().getUid() != null && updatedContent.getPipe().getUid().isBlank()) {
                existing.setPipe(null);
            } else if (!updatedContent.getPipe().equals(existing.getPipe())) {
                Pipe resolvedPipe = pipeRepository.findByUid(updatedContent.getPipe().getUid())
                    .orElseThrow(() -> new EntityNotFoundException("Pipe not found with UID: " + updatedContent.getPipe().getUid()));
                existing.setPipe(resolvedPipe);
            }
            modified = true;
        }

        // if (updatedContent.getBelongingNode() != null &&
        //         (existing.getBelongingNode() == null ||
        //                 !Objects.equals(existing.getBelongingNode().getUid(),
        //                         updatedContent.getBelongingNode().getUid()))) {
        //     Node resolvedNode = nodeRepository.findByUid(updatedContent.getBelongingNode().getUid())
        //             .orElseThrow(() -> new EntityNotFoundException("Node not found with UID: " + updatedContent.getBelongingNode().getUid()));
        //     existing.setBelongingNode(resolvedNode);
        //     //existing.setBelongingNode(updatedContent.getBelongingNode());
        //     modified = true;
        // }

        if (updatedContent.getBelongingNode() != null) {
            if (updatedContent.getBelongingNode().getUid() != null && updatedContent.getBelongingNode().getUid().isBlank()) {
                existing.setBelongingNode(null);
            } else if (!updatedContent.getBelongingNode().equals(existing.getBelongingNode())) {
                Node resolvedNode = nodeRepository.findByUid(updatedContent.getBelongingNode().getUid())
                    .orElseThrow(() -> new EntityNotFoundException("Node not found with UID: " + updatedContent.getBelongingNode().getUid()));
                existing.setBelongingNode(resolvedNode);
            }
            modified = true;
        }

        if (modified) {
            try {
                attributeContentRepository.save(existing);
                return true;
            } catch (Exception e) {
                return false;
            }
        }
        return true; // No changes needed, considering it as success
    }

}
