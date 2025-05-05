package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class DebugFallback {

    @RequestMapping("/debug")
    @ResponseBody
    public String hello() {
        return "App is working after login";
    }
}
