package com.example.demo.dto;

import java.util.List;

import com.example.demo.model.Attribute;
import com.example.demo.model.AttributeContent;
import com.example.demo.model.Node;
import com.example.demo.model.Pipe;

public class ChangeSetDto {
    public Changes created;
    public Changes updated;
    public Deletions deleted;

    public static class Changes {
        public List<Node> nodes;
        public List<Pipe> pipes;
        public List<Attribute> attributes;
        public List<AttributeContent> attributeContents;
       
    }

    public static class Deletions {
        public List<Integer> nodeIds;
        public List<String> pipeUids;
        public List<String> attributeUids;
        public List<String> nodeUids;
        public List<String> attributeContentUids;
        
    }
}

