package com.example.demo.service;

import com.example.demo.model.Attribute;
import com.example.demo.model.Node;
import com.example.demo.repository.AttributeRepository;
import com.example.demo.repository.NodeRepository;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.InvalidDataAccessApiUsageException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.Optional;

@Service
public class AttributeService {

    private final AttributeRepository attributeRepository;
    private final NodeRepository nodeRepository;

    public AttributeService(AttributeRepository attributeRepository, NodeRepository nodeRepository) {
        this.attributeRepository = attributeRepository;
        this.nodeRepository = nodeRepository;
    }

    // Create Attribute
    @Transactional
    public Attribute createAttribute(Attribute attribute) {
        if (attribute == null || attribute.getUid() == null) {
            throw new IllegalArgumentException("Attribute or its UID cannot be null.");
        }
        System.err.println("Received attribute UID: " + attribute.getUid());
        System.err.println("Node UID from JSON: " + attribute.getNode().getUid());
        
        if (attribute.getNode() != null && attribute.getNode().getUid() != null) {
            Node source = nodeRepository.findByUid(attribute.getNode().getUid())
                .orElseThrow(() -> new EntityNotFoundException("node not found"));
                attribute.setNode(source);
            System.err.println("Fetched Node from DB: " + source.getUid());
        }

        return attributeRepository.save(attribute);
    }

    // Edit Attribute
    @Transactional
    public Attribute editAttribute(Attribute updatedAttribute) {
        if (updatedAttribute == null || updatedAttribute.getUid() == null) {
            throw new IllegalArgumentException("Updated attribute or UID cannot be null.");
        }

        Attribute existing = attributeRepository.findByUid(updatedAttribute.getUid())
                .orElseThrow(() -> new EntityNotFoundException("Attribute not found with UID: " + updatedAttribute.getUid()));

        boolean modified = false;

        if (!Objects.equals(existing.getName(), updatedAttribute.getName())) {
            existing.setName(updatedAttribute.getName());
            modified = true;
        }

        if (!Objects.equals(existing.getMute(), updatedAttribute.getMute())) {
            existing.setMute(updatedAttribute.getMute());
            modified = true;
        }

        if (!Objects.equals(existing.getTotalNumber(), updatedAttribute.getTotalNumber())) {
            existing.setTotalNumber(updatedAttribute.getTotalNumber());
            modified = true;
        }

        if (updatedAttribute.getNode() != null &&
            !Objects.equals(existing.getNode().getUid(), updatedAttribute.getNode().getUid())) {
            existing.setNode(updatedAttribute.getNode());
            modified = true;
        }

        return modified ? attributeRepository.save(existing) : existing;
    }

    //  Delete Attribute
    @Transactional
    public boolean deleteAttribute(String uid) {
        if (uid == null || uid.isBlank()) return false;
        
        Optional<Attribute> attributeOpt = attributeRepository.findByUid(uid);
        if (attributeOpt.isPresent()) {
            attributeRepository.delete(attributeOpt.get());
            return true;
        }
        return false;
    }

    public Attribute getAttribute(String uid) {
        if (uid == null) {
            throw new IllegalArgumentException("UID cannot be null");
        }

        return attributeRepository.findByUid(uid)
                .orElseThrow(() -> new EntityNotFoundException("Attribute not found with UID: " + uid));
    }
}
