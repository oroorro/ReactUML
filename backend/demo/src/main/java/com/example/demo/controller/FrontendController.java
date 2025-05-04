package com.example.demo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

@Controller
public class FrontendController {

    //@RequestMapping(value = {"/{path:^(?!api|auth|static|assets|error).*$}", "/{path:^(?!api|auth|static|assets|error).*$}/**"})
    @RequestMapping({
        "/", "/home", "/user", "/login", "/register"
    })
    public String forwardReactRoutes() {
        return "forward:/index.html";
    }


    // Handle all other paths with a 404 response
    // @RequestMapping("/**")
    // @ResponseStatus(HttpStatus.NOT_FOUND)
    // @ResponseBody
    // public String notFound() {
    //     return "404 - Page Not Found";
    // }
}
