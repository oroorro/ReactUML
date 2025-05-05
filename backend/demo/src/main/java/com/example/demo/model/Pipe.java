package com.example.demo.model;

import jakarta.persistence.*;

@Entity
public class Pipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "nodeID") 
    private Node node;

    private String name;

    private Character color; 

    private Boolean mute;

    public Pipe() {}  

    public Pipe(Node node, String name, Character color, Boolean mute) {
        this.node = node;
        this.name = name;
        this.color = color;
        this.mute = mute;
    }


    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Node getNode() {
        return node;
    }

    public void setNode(Node node) {
        this.node = node;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Character getColor() {
        return color;
    }

    public void setColor(Character color) {
        this.color = color;
    }

    public Boolean getMute() {
        return mute;
    }

    public void setMute(Boolean mute) {
        this.mute = mute;
    }
}

