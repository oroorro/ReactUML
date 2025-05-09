package com.example.demo.exception;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntime(RuntimeException ex) {
        return ResponseEntity.status(500)
                             .body(Map.of("error", ex.getMessage()));
    }

    // @ExceptionHandler(UserAlreadyExistsException.class)
    // public ResponseEntity<?> handleUserExists(UserAlreadyExistsException ex) {
    //     return ResponseEntity.status(409)
    //                          .body(Map.of("error", "User already exists"));
    // }
}

