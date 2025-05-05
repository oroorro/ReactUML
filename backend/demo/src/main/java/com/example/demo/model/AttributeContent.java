package com.example.demo.model;

import jakarta.persistence.*;

@Entity
public class AttributeContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "attributeID")
    private Attribute attribute;

    @ManyToOne(optional = false)
    @JoinColumn(name = "parentNodeID")
    private Node parentNode;

    private String name;

    // Constructors
    public AttributeContent() {}

    public AttributeContent(Attribute attribute, Node parentNode, String name) {
        this.attribute = attribute;
        this.parentNode = parentNode;
        this.name = name;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Attribute getAttribute() {
        return attribute;
    }

    public void setAttribute(Attribute attribute) {
        this.attribute = attribute;
    }

    public Node getParentNode() {
        return parentNode;
    }

    public void setParentNode(Node parentNode) {
        this.parentNode = parentNode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}

