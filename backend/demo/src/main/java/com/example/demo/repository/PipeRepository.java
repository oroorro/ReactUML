package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.model.Node;
import com.example.demo.model.Pipe;

@Repository
public interface PipeRepository extends JpaRepository<Pipe, Integer> {
    Optional<Pipe> findByUid(String uid);

    @Query("SELECT p FROM Pipe p WHERE p.sourceNode.userId = :userId OR p.targetNode.userId = :userId")
    List<Pipe> findPipesByUserId(@Param("userId") Integer userId);

    List<Pipe> findBySourceNode(Node node);

    List<Pipe> findBySourceNodeUid(String nodeUid);

    @Transactional
    @Modifying
    @Query("""
                DELETE FROM Pipe p
                WHERE p.sourceNode.id IN (
                    SELECT n.id FROM Node n WHERE n.user.id = :userId
                )
                OR p.targetNode.id IN (
                    SELECT n.id FROM Node n WHERE n.user.id = :userId
                )
            """)
    void deletePipesByUserId(@Param("userId") Integer userId);

    @Query("""
                SELECT p FROM Pipe p
                JOIN p.sourceNode sn
                LEFT JOIN p.targetNode tn
                WHERE sn.user.id = :userId OR (tn IS NOT NULL AND tn.user.id = :userId)
            """)
    List<Pipe> findBySourceNodeUserIdOrTargetNodeUserId(@Param("userId") Integer userId);

}
