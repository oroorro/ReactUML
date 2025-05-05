package com.example.demo.model;

import java.util.List;
import jakarta.persistence.*;

@Entity
@Table(name = "Node")
public class Node {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @OneToMany(mappedBy = "node", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Attribute> attributes;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    // userID from a User table 
    @Column(name = "userID")
    private Integer userId;

    @Column(name = "parentID")
    private Integer parentId;

    @Column(name = "numberOfPropsIn")
    private Integer numberOfPropsIn;

    @Column(name = "childDirection", length = 20)
    private String childDirection;

    @Column(name = "color", length = 7)
    private String color;

    @Column(name = "state", length = 20)
    private String state;

    @Column(name = "Name", length = 50)
    private String name;

    @Column(name = "positionX", length = 50, nullable = true)
    private Integer positionX;

    @Column(name = "positionY", length = 50, nullable = true)
    private Integer positionY;

    @Column(name = "isStartingNode")
    private Boolean isStartingNode;
    
    // Constructors
    public Node() {}

    public Node(Integer userId, Integer parentId, Integer numberOfPropsIn, String childDirection,
                String color, String state, String name, String position, Integer positionX, Integer positionY, Boolean isStartingNode) {
        this.userId = userId;
        this.parentId = parentId;
        this.numberOfPropsIn = numberOfPropsIn;
        this.childDirection = childDirection;
        this.color = color;
        this.state = state;
        this.name = name;
        this.positionX = positionX;
        this.positionY = positionY;
        this.isStartingNode = isStartingNode;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getParentId() {
        return parentId;
    }

    public void setParentId(Integer parentId) {
        this.parentId = parentId;
    }

    public Integer getNumberOfPropsIn() {
        return numberOfPropsIn;
    }

    public void setNumberOfPropsIn(Integer numberOfPropsIn) {
        this.numberOfPropsIn = numberOfPropsIn;
    }

    public String getChildDirection() {
        return childDirection;
    }

    public void setChildDirection(String childDirection) {
        this.childDirection = childDirection;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getPositionX() {
        return positionX;
    }
    
    public void setPositionX(Integer positionX) {
        this.positionX = positionX;
    }

    public Integer getPositionY() {
        return positionY;
    }
    
    public void setPositionY(Integer positionY) {
        this.positionY = positionY;
    }

    public Boolean getIsStartingNode() {
        return isStartingNode;
    }
    
    public void setIsStartingNode(Boolean isStartingNode) {
        this.isStartingNode = isStartingNode;
    }

    public String getChildrenDirection(){
        return this.childDirection;
    }

    public void setChildrenDirection(String newDirection){
        this.childDirection = newDirection;
    }

}
