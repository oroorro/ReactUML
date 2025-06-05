package com.example.demo.service;

import org.springframework.stereotype.Service;

import com.example.demo.model.Node;
import com.example.demo.model.Pipe;
import com.example.demo.repository.NodeRepository;
import com.example.demo.repository.PipeRepository;

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
    public Pipe editPipe(Pipe updatedPipe) {

        if (updatedPipe == null || updatedPipe.getUid() == null || updatedPipe.getSourceNode() == null
                || updatedPipe.getSourceNode().equals(updatedPipe.getTargetNode())) {
            throw new IllegalArgumentException("invalid data to create pipe");
        }

        Pipe existing = pipeRepository.findById(updatedPipe.getId())
                .orElseThrow(() -> new EntityNotFoundException("Pipe not found with ID: " + updatedPipe.getId()));

        boolean modified = false;

        if (!Objects.equals(existing.getName(), updatedPipe.getName())) {
            existing.setName(updatedPipe.getName());
            modified = true;
        }

        if (!Objects.equals(existing.getColor(), updatedPipe.getColor())) {
            existing.setColor(updatedPipe.getColor());
            modified = true;
        }

        if (!Objects.equals(existing.getMute(), updatedPipe.getMute())) {
            existing.setMute(updatedPipe.getMute());
            modified = true;
        }

        if (!Objects.equals(existing.getSourceNode().getUid(), updatedPipe.getSourceNode().getUid())) {
            existing.setSourceNode(updatedPipe.getSourceNode());
            modified = true;
        }

        if (!Objects.equals(existing.getTargetNode(), updatedPipe.getTargetNode())) {
            existing.setTargetNode(updatedPipe.getTargetNode());
            modified = true;
        }

        if (!Objects.equals(existing.getAttributeContents(), updatedPipe.getAttributeContents())) {
            existing.setAttributeContents(updatedPipe.getAttributeContents());
            modified = true;
        }
        

        return modified ? pipeRepository.save(existing) : existing;
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
