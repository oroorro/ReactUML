package com.example.demo.model;

import jakarta.persistence.*;

@Entity
public class AttributeContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false, length = 20)
    private String uid;

    @ManyToOne(optional = true)
    @JoinColumn(name = "attribute_id")
    private Attribute attribute;

    @ManyToOne(optional = true)
    @JoinColumn(name = "pipe_id") 
    private Pipe pipe;

    @ManyToOne(optional = false)
    @JoinColumn(name = "belonging_node_id")
    private Node belongingNode;

    @PrePersist
    @PreUpdate
    private void validateExclusiveLink() {
        if (this.attribute == null && this.pipe == null) {
            throw new IllegalStateException("AttributeContent must be linked to either an Attribute or a Pipe");
        }
    }

    private String name;

    // Constructors
    public AttributeContent() {}

    public AttributeContent(Attribute attribute, Node belongingNode, String name) {
        this.attribute = attribute;
        this.belongingNode = belongingNode;
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

    public Node getBelongingNode() {
        return belongingNode;
    }

    public void setBelongingNode(Node belongingNode) {
        this.belongingNode = belongingNode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUid() {
        return uid;
    }
    
    public void setUid(String uid) {
        this.uid = uid;
    }

    public Pipe getPipe() {
        return pipe;
    }
    
    public void setPipe(Pipe pipe) {
        this.pipe = pipe;
    }
}

