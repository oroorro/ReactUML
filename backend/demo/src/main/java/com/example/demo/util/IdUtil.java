package com.example.demo.util;

public class IdUtil {
    public static String generateUniqueId() {
        String timestamp = Long.toString(System.currentTimeMillis(), 36);
        long random = (long) (Math.random() * 2176782336L); 
        String randomValue = Long.toString(random, 36);
        randomValue = String.format("%6s", randomValue).replace(' ', '0');
        return timestamp + "-" + randomValue;
    }
}
