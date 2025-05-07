package com.example.demo.model;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String username;

    @JsonManagedReference
    @OneToMany(mappedBy = "user")
    //private List<Node> nodes;
    private Set<Node> nodes = new HashSet<>();

    @Column(nullable = false)
    private String password;

    public User(String username, String password) {
        this.username = username;
        this.password = password;
    }    
}
