package com.example.demo.mapper;

import java.util.List;

import com.example.demo.dto.AttributeContentDTO;
import com.example.demo.dto.AttributeDTO;
import com.example.demo.dto.NodeDTO;
import com.example.demo.dto.PipeDTO;
import com.example.demo.model.Attribute;
import com.example.demo.model.AttributeContent;
import com.example.demo.model.Node;
import com.example.demo.model.Pipe;

public class NodeMapper {

    public static NodeDTO toDto(Node node) {
        NodeDTO dto = new NodeDTO();
        dto.uid = node.getUid();
        dto.title = node.getName();
        dto.color = node.getColor();
        dto.isStartingNode = node.getIsStartingNode();
        dto.positionX = node.getPositionX();
        dto.positionY = node.getPositionY();
        dto.type = node.getType();

        // These will be filled later in the service after fetching from DB
        dto.attributes = List.of();
        dto.pipes = List.of();
        dto.children = List.of();

        return dto;
    }

    public static AttributeDTO toDto(Attribute attribute) {
        AttributeDTO dto = new AttributeDTO();
        dto.uid = attribute.getUid();
        dto.nameOfAttribute = attribute.getName();
        dto.totalNumberOfAttribute = attribute.getTotalNumber();

        dto.attributeContents = attribute.getAttributeContents() != null
            ? attribute.getAttributeContents().stream()
                .map(NodeMapper::toDto)
                .toList()
            : List.of();

        return dto;
    }

    public static PipeDTO toDto(Pipe pipe) {
        PipeDTO dto = new PipeDTO();
        dto.uid = pipe.getUid();
        dto.name = pipe.getName();
        dto.color = pipe.getColor();
        dto.numbersOfProps = pipe.getNumbersOfProps();
        dto.sourceNodeUid = pipe.getSourceNode().getUid();

        dto.attributeContents = pipe.getAttributeContents() != null
            ? pipe.getAttributeContents().stream()
                .map(NodeMapper::toDto)
                .toList()
            : List.of();

        return dto;
    }

    public static AttributeContentDTO toDto(AttributeContent content) {
        AttributeContentDTO dto = new AttributeContentDTO();
        dto.uid = content.getUid();
        dto.name = content.getName();
        dto.belongsTo = content.getBelongingNodeUid();
        dto.type = content.getHoldingValue();
        return dto;
    }
}


