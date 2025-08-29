package com.example.demo.dto;

import java.util.List;

public class NodeDTO {
    public String uid;
    public String title;
    public String color;
    public Boolean isStartingNode;
    public Integer positionX;
    public Integer positionY;
    public List<AttributeDTO> attributes;
    public List<PipeDTO> pipes;
    public List<NodeDTO> children;
    public String type;
}
