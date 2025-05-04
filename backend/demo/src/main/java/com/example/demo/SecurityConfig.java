package com.example.demo;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    // @Bean
    // public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    // http
    // .csrf().disable()
    // .authorizeHttpRequests(auth -> auth
    // .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
    // .requestMatchers("/", "/index.html", "/assets/**", "/auth/**", "/home",
    // "/user", "/login",
    // "/register").permitAll()
    // .anyRequest().authenticated());
    // // .permitAll()
    // // .requestMatchers(HttpMethod.GET, "/auth/status").permitAll()

    // // .formLogin().disable(); // Disables the default login form

    // return http.build();
    // }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable()
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/index.html", "/assets/**", "/auth/**").permitAll()
                        .anyRequest().authenticated())
                .formLogin().permitAll(); //Enables default login form

        return http.build();
    }
}
