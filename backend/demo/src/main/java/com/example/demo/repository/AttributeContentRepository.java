package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.model.Attribute;
import com.example.demo.model.AttributeContent;
import com.example.demo.model.Pipe;

public interface AttributeContentRepository extends JpaRepository<AttributeContent, Integer> {
    List<AttributeContent> findByAttribute(Attribute attribute);

    // Finding all AttributeContent records by a given Attribute's id
    List<AttributeContent> findByAttribute_Id(Integer attributeId);

    // Finding by Attribute's uid
    List<AttributeContent> findByAttribute_Uid(String attributeUid);

    List<AttributeContent> findByPipe(Pipe pipe);

    Optional<AttributeContent> findByUid(String uid);

    void deleteByAttribute(Attribute attribute);


    @Modifying
    @Transactional
    @Query("DELETE FROM AttributeContent ac WHERE ac.pipe.id = :pipeId")
    void deleteAllByPipeId(@Param("pipeId") Integer pipeId);

    @Modifying
    @Transactional
    @Query("DELETE FROM AttributeContent ac WHERE ac.attribute.id = :attributeId")
    void deleteAllByAttributeId(@Param("attributeId") Integer attributeId);

    @Modifying
    @Transactional
    @Query("DELETE FROM AttributeContent ac WHERE ac.attribute.id IN (" +
            "SELECT a.id FROM Attribute a WHERE a.node.userId = :userId" +
            ") OR ac.pipe.id IN (" +
            "SELECT p.id FROM Pipe p WHERE p.sourceNode.userId = :userId OR p.targetNode.userId = :userId" +
            ")")
    void deleteByUserId(@Param("userId") Integer userId);

    @Query("""
        SELECT ac FROM AttributeContent ac
        LEFT JOIN ac.attribute a
        LEFT JOIN a.node an
        LEFT JOIN ac.pipe p
        LEFT JOIN p.sourceNode sn
        LEFT JOIN p.targetNode tn
        WHERE an.user.id = :userId OR sn.user.id = :userId OR tn.user.id = :userId
        """)
    List<AttributeContent> findByUserId(@Param("userId") Integer userId);
    
}
