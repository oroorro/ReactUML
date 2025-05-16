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

        return pipeRepository.save(pipe);
    }

    @Transactional
    public Pipe editPipe(Pipe updatedPipe) {
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

        if (!Objects.equals(existing.getSourceNode(), updatedPipe.getSourceNode())) {
            existing.setSourceNode(updatedPipe.getSourceNode());
            modified = true;
        }

        if (!Objects.equals(existing.getTargetNode(), updatedPipe.getTargetNode())) {
            existing.setTargetNode(updatedPipe.getTargetNode());
            modified = true;
        }

        return modified ? pipeRepository.save(existing) : existing;
    }

    @Transactional
    public void deletePipeByUid(String uid) {
        Pipe pipe = pipeRepository.findByUid(uid)
                .orElseThrow(() -> new EntityNotFoundException("Pipe not found with UID: " + uid));

        pipeRepository.delete(pipe);
    }
}
