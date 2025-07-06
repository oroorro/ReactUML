package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.model.Attribute;
import com.example.demo.model.Node;

public interface AttributeRepository extends JpaRepository<Attribute, Integer> {
    Optional<Attribute> findByUid(String uid);
    List<Attribute> findByNode(Node node);
    List<Attribute> findByNodeUid(String nodeUid);
}
