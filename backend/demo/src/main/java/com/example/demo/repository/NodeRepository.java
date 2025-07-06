package com.example.demo.repository;
import com.example.demo.model.Node;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NodeRepository extends JpaRepository<Node, Integer> {
     @Query("""
      SELECT n FROM Node n
      LEFT JOIN FETCH n.attributes a
      LEFT JOIN FETCH a.attributeContents
      WHERE n.user.id = :userId
    """)
    List<Node> getAllNodesWithAttributesAndContents(@Param("userId") Integer userId);
    Optional<Node> findByUid(String uid);
    List<Node> findAllByUserId(Integer userId);

}

