package com.example.demo.security;

import org.springframework.security.core.userdetails.UserDetails;

import com.example.demo.model.User;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;

public class CustomUserDetails implements UserDetails {

    private final Integer id;
    private final String username;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(User user) {
        this.id = user.getId();
        this.username = user.getUsername();  // or email
        this.password = user.getPassword();
        this.authorities = List.of(); // or map from user roles
    }

    public CustomUserDetails(Integer id, String username, String password, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.authorities = authorities;
    }
    

    public Integer getId() {
        return id;
    }

    @Override public String getUsername() { return username; }
    @Override public String getPassword() { return password; }
    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}

