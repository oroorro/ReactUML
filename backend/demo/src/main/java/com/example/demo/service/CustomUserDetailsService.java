package com.example.demo.service;

import com.example.demo.model.User;
//import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.CustomUserDetails;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;

@Configuration
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    // @Bean
    // public UserDetailsService userDetailsService() {
    // return username -> {
    // User user = userRepository.findByUsername(username)
    // .orElseThrow(() -> new UsernameNotFoundException("User not found"));

    // return org.springframework.security.core.userdetails.User.builder()
    // .username(user.getUsername())
    // .password(user.getPassword()) // Already encrypted
    // .roles("USER")
    // .build();
    // };
    // }

    @Override
    public UserDetails loadUserByUsername(String username) {
        System.out.println("Loading user by username: " + userRepository.findByUsername(username).get().getId());
        User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return new CustomUserDetails(user);
        // return userRepository.findByUsername(username)
        //         .map(user -> {
        //             System.out.println("Found user: " + user.getUsername());
        //             return org.springframework.security.core.userdetails.User.withUsername(user.getUsername())
        //                     .password(user.getPassword()) // hashed password
        //                     .roles("USER")
        //                     .build();
        //         })
        //         .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

}
