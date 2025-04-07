package com.quizapp.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quizapp.backend.dto.response.UserResponse;
import com.quizapp.backend.service.UserService;

import lombok.RequiredArgsConstructor;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;



@RestController
@RequestMapping("api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    @GetMapping("/getCurrentUser")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }
    @DeleteMapping("/deleteUser/{username}")
    public ResponseEntity<String> deleteUser(@PathVariable String username) {
        System.out.println("Deleting user: " + username);
        userService.deleteUser(username);
        return ResponseEntity.ok("User deleted successfully");
    }
    @GetMapping("/getAllUsers")
    public ResponseEntity<Object> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
    @GetMapping("/getUser/{username}")
    public ResponseEntity<UserResponse> getUser(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUser(username));
    }
   
    
}
