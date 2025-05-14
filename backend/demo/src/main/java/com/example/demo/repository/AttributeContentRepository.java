package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Attribute;
import com.example.demo.model.AttributeContent;
import com.example.demo.model.Pipe;

public interface AttributeContentRepository extends JpaRepository<AttributeContent, Integer> {
    List<AttributeContent> findByAttribute(Attribute attribute);
    //Finding all AttributeContent records by a given Attribute's id
    List<AttributeContent> findByAttribute_Id(Integer attributeId); 
    //Finding by Attribute's uid
    List<AttributeContent> findByAttribute_Uid(String attributeUid);   
    
    List<AttributeContent> findByPipe(Pipe pipe);
    
    void deleteByAttribute(Attribute attribute); 
}

