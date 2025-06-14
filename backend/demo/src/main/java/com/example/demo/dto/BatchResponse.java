package com.example.demo.dto;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class BatchResponse {
    public boolean success;
    public String message;
    public Map<String, List<String>> errors = new HashMap<>();

    public BatchResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
    
    public void addError(String category, String uid) {
        errors.computeIfAbsent(category, k -> new ArrayList<>()).add(uid);
    }

    public boolean hasErrors() {
        return !errors.isEmpty();
    }
}

