package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.model.Attribute;

public interface AttributeRepository extends JpaRepository<Attribute, Long> {}
