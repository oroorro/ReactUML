package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.model.Attribute;
import com.example.demo.model.Node;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface AttributeRepository extends JpaRepository<Attribute, Integer> {
    Optional<Attribute> findByUid(String uid);
    List<Attribute> findByNode(Node node);
    List<Attribute> findByNodeUid(String nodeUid);

    @Query("SELECT a FROM Attribute a WHERE a.node.user.id = :userId")
    List<Attribute> findByUserId(@Param("userId") Integer userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Attribute a WHERE a.node.userId = :userId")
    void deleteByUserId(@Param("userId") Integer userId);
}
