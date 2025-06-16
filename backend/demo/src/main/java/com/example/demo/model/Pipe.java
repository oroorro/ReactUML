package com.example.demo.model;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

import jakarta.persistence.*;

@Entity
public class Pipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false, length = 20)
    private String uid;

    @OneToMany(mappedBy = "pipe", cascade = CascadeType.ALL)
    private Set<AttributeContent> attributeContents = new HashSet<>();

    @ManyToOne(optional = false)
    @JoinColumn(name = "source_node_id", nullable = false)
    private Node sourceNode;

    @ManyToOne(optional = true)
    @JoinColumn(name = "target_node_id", nullable = true)
    private Node targetNode;

    private String name;

    private String color; 

    private Boolean mute;

    public Pipe() {}  

    public Pipe(Node sourceNode, String name, String color, Boolean mute) {
        this.sourceNode = sourceNode;
        this.name = name;
        this.color = color;
        this.mute = mute;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Node node = (Node) o;
        return Objects.equals(uid, node.getUid());
    }

    public Integer getId() {
        return id;
    }

    public String getUid() {
        return uid;
    }
    
    public void setUid(String uid) {
        this.uid = uid;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Node getSourceNode() {
        return sourceNode;
    }

    public void setSourceNode(Node sourceNode) {
        this.sourceNode = sourceNode;
    }

    public Node getTargetNode() {
        return targetNode;
    }

    public void setTargetNode(Node targetNode) {
        this.targetNode = targetNode;
    }

    public void setAttributeContents(Set<AttributeContent> attributeContents) {
        this.attributeContents = attributeContents;
    }
    
    public Set<AttributeContent> getAttributeContents() {
        return attributeContents;
    }
    

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Boolean getMute() {
        return mute;
    }

    public void setMute(Boolean mute) {
        this.mute = mute;
    }
}

