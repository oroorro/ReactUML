package com.example.demo;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Profile("!test") 
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable()
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/index.html", "/assets/**", "/auth/**").permitAll()
                        .anyRequest().authenticated())
                .formLogin(form->form
                    //.loginPage("/login") for custom login page 
                    .defaultSuccessUrl("/", true) // redirect here after login
                    .permitAll() // Enables default login form
                )
                // .and()
                .logout(logout -> logout
                    .logoutUrl("/auth/logout") // You can change the default path
                    .logoutSuccessUrl("/login") // Redirect after logout
                    .invalidateHttpSession(true)
                    .deleteCookies("JSESSIONID")
                );
                
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
