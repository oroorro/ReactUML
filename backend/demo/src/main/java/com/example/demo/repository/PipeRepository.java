package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Node;
import com.example.demo.model.Pipe;

@Repository
public interface PipeRepository extends JpaRepository<Pipe, Integer> {
    Optional<Pipe> findByUid(String uid);
    List<Pipe> findBySourceNode(Node node);
    List<Pipe> findBySourceNodeUid(String nodeUid);
}

