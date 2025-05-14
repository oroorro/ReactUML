package com.example.demo.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;

import com.example.demo.model.Attribute;
import com.example.demo.model.AttributeContent;
import com.example.demo.model.Pipe;
import com.example.demo.repository.AttributeContentRepository;

import jakarta.transaction.Transactional;

public class AttributeContentService {
    @Autowired
    private AttributeContentRepository attributeContentRepository;

    // Check for duplicate UID
    public void checkDuplicateUid(String uid) {
        boolean exists = attributeContentRepository.findByUid(uid).isPresent();
        if (exists) {
            throw new DuplicateKeyException("UID already exists: " + uid);
        }
    }

    @Transactional
    public AttributeContent create(AttributeContent content, Pipe pipe, Attribute attribute) {
        if (pipe == null && attribute == null) {
            throw new IllegalArgumentException("AttributeContent must be linked to either an Attribute or a Pipe");
        }

        checkDuplicateUid(content.getUid());

        content.setPipe(pipe);
        content.setAttribute(attribute);

        return attributeContentRepository.save(content);
    }

    

    public void cleanUpOrphanedAttributeContents() {
        List<AttributeContent> orphanedContents = attributeContentRepository.findAll().stream()
            .filter(ac -> ac.getPipe() == null && ac.getAttribute() == null)
            .collect(Collectors.toList());

        attributeContentRepository.deleteAll(orphanedContents);
    }
}
