package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Pipe;

@Repository
public interface PipeRepository extends JpaRepository<Pipe, Integer> {
}

