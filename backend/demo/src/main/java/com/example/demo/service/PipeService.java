package com.example.demo.service;

import org.springframework.stereotype.Service;

import com.example.demo.model.Pipe;
import com.example.demo.repository.PipeRepository;

import java.util.List;
import java.util.Optional;

@Service
public class PipeService {

    private final PipeRepository pipeRepository;

    public PipeService(PipeRepository pipeRepository) {
        this.pipeRepository = pipeRepository;
    }

    public List<Pipe> getAllPipes() {
        return pipeRepository.findAll();
    }

    public Optional<Pipe> getPipeById(Integer id) {
        return pipeRepository.findById(id);
    }

    public Pipe createPipe(Pipe pipe) {
        return pipeRepository.save(pipe);
    }

    public void deletePipe(Integer id) {
        pipeRepository.deleteById(id);
    }
}

