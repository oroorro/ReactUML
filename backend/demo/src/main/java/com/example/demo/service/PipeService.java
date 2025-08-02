package com.example.demo.service;

import org.springframework.stereotype.Service;

import com.example.demo.model.Node;
import com.example.demo.model.Pipe;
import com.example.demo.repository.NodeRepository;
import com.example.demo.repository.PipeRepository;
import com.fasterxml.jackson.databind.JsonNode;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class PipeService {

    private final PipeRepository pipeRepository;
    private final NodeRepository nodeRepository;

    public PipeService(PipeRepository pipeRepository, NodeRepository nodeRepository) {
        this.pipeRepository = pipeRepository;
        this.nodeRepository = nodeRepository;
    }

    public List<Pipe> getAllPipes() {
        return pipeRepository.findAll();
    }

    public Optional<Pipe> getPipeById(Integer id) {
        return pipeRepository.findById(id);
    }

    @Transactional
    public Pipe createPipe(Pipe pipe) {
        if (pipe == null || pipe.getUid() == null || pipe.getSourceNode() == null
                || pipe.getSourceNode().equals(pipe.getTargetNode())) {
            throw new IllegalArgumentException("invalid data to create pipe");
        }

        //if passed parameter, pipe only specified the uid of SourceNode that is's linked to, find the instance of the sourceNode then attache to pipe
        if (pipe.getSourceNode() != null && pipe.getSourceNode().getUid() != null) {
            Node source = nodeRepository.findByUid(pipe.getSourceNode().getUid())
                .orElseThrow(() -> new EntityNotFoundException("Source node not found"));
            pipe.setSourceNode(source); // attach managed entity
        }

        if (pipe.getTargetNode() != null && pipe.getTargetNode().getUid() != null) {
            Node target = nodeRepository.findByUid(pipe.getTargetNode().getUid())
                .orElseThrow(() -> new EntityNotFoundException("Target node not found"));
            pipe.setTargetNode(target); // attach managed entity
        }

        return pipeRepository.save(pipe);
    }

    @Transactional
    public boolean editPipe(Pipe updatedPipe, JsonNode rawNode) {
        if (updatedPipe == null || updatedPipe.getUid() == null) {
            throw new IllegalArgumentException("Updated pipe or UID cannot be null.");
        }

        Pipe existing = pipeRepository.findByUid(updatedPipe.getUid())
                .orElseThrow(() -> new EntityNotFoundException("Pipe not found with UID: " + updatedPipe.getUid()));

        boolean modified = false;

        // Only update name if it's present in the JSON
        if (rawNode.has("name") && !Objects.equals(existing.getName(), updatedPipe.getName())) {
            existing.setName(updatedPipe.getName());
            modified = true;
        }

        // Only update color if it's present in the JSON
        if (rawNode.has("color") && !Objects.equals(existing.getColor(), updatedPipe.getColor())) {
            existing.setColor(updatedPipe.getColor());
            modified = true;
        }

        // Only update mute if it's present in the JSON
        if (rawNode.has("mute") && !Objects.equals(existing.getMute(), updatedPipe.getMute())) {
            existing.setMute(updatedPipe.getMute());
            modified = true;
        }

        // Handle source node relationship
        if (rawNode.has("sourceNode")) {
            JsonNode sourceNode = rawNode.get("sourceNode");
            if (sourceNode.has("uid")) {
                String sourceUid = sourceNode.get("uid").asText();
                if (!Objects.equals(existing.getSourceNode().getUid(), sourceUid)) {
                    Node newSource = nodeRepository.findByUid(sourceUid)
                        .orElseThrow(() -> new EntityNotFoundException("Source node not found with UID: " + sourceUid));
                    existing.setSourceNode(newSource);
                    modified = true;
                }
            }
        }

        // Handle targetNode
        // targetNode is allowed to be null and allowed to be updated to other Node 
        // if (rawNode.has("targetNode")) {
        //     JsonNode targetNode = rawNode.get("targetNode");
        //     if (targetNode.has("uid")) {
        //         String targetUid = targetNode.get("uid").asText();
        //         //if exsiting targetnode is not null, check if the uid is the same as the targetUid
        //         //if the targetnode is null, set the targetnode to the new target node
        //         if (!Objects.equals(existing.getTargetNode() != null ? existing.getTargetNode().getUid() : null, targetUid)) {
        //             Node newTarget = nodeRepository.findByUid(targetUid)
        //                 .orElseThrow(() -> new EntityNotFoundException("Target node not found with UID: " + targetUid));
        //             existing.setTargetNode(newTarget);
        //             modified = true;
        //         }
        //     }
        // }



        if (rawNode.has("targetNode")) {
            JsonNode targetNode = rawNode.get("targetNode"); 
            if (targetNode.isNull() || targetNode.get("uid") == null || targetNode.get("uid").asText().isBlank()) {
                existing.setTargetNode(null);
            } else {
                String uid = targetNode.get("uid").asText();
                if (existing.getTargetNode() == null || !uid.equals(existing.getTargetNode().getUid())) {
                    Node foundTargetNode = nodeRepository.findByUid(uid)
                        .orElseThrow(() -> new EntityNotFoundException("targetNode not found with UID: " + uid));
                    existing.setTargetNode(foundTargetNode);
                }
            }
            modified = true;
        }

        if (modified) {
            pipeRepository.save(existing);
        }
        return modified;
    }

    @Transactional
    public boolean deletePipeByUid(String uid) {
        if (uid == null || uid.isBlank()) return false;
        
        Optional<Pipe> pipeOpt = pipeRepository.findByUid(uid);
        if (pipeOpt.isPresent()) {
            pipeRepository.delete(pipeOpt.get());
            return true;
        }
        return false;
    }
}
