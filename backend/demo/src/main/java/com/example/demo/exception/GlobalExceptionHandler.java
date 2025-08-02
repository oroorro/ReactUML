package com.example.demo.exception;

import java.util.HashMap;
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

    @ExceptionHandler(InvalidRequestDataException.class)
    public ResponseEntity<Map<String, String>> handleInvalidData(InvalidRequestDataException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.badRequest().body(error); // or 422 Unprocessable Entity if preferred
    }

    // @ExceptionHandler(UserAlreadyExistsException.class)
    // public ResponseEntity<?> handleUserExists(UserAlreadyExistsException ex) {
    // return ResponseEntity.status(409)
    // .body(Map.of("error", "User already exists"));
    // }
}
