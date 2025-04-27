package com.quizapp.backend.controller;

import org.springframework.web.bind.annotation.RestController;

import com.quizapp.backend.dto.UserDetailsDTO;
import com.quizapp.backend.dto.response.UserResponse;
import com.quizapp.backend.service.UserService;
import com.quizapp.backend.service.AdminService;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {
    private final UserService userService;
    private final AdminService adminService;

    @GetMapping("/get-all-users")
    public ResponseEntity<Object> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }
    @GetMapping("/get-all-admins")
    public ResponseEntity<Object> getAllAdmins() {
        return ResponseEntity.ok(adminService.getAllAdmins());
    }
    @GetMapping("/user-details")
    public ResponseEntity<List<UserDetailsDTO>> getAllUserDetails() {
        return ResponseEntity.ok(adminService.getAllUsersWithDetails());
    }

    @GetMapping("/get-user/{username}")
    public ResponseEntity<UserResponse> getUser(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUser(username));
    }


    @DeleteMapping("/delete-user/{username}")
    public ResponseEntity<String> deleteUser(@PathVariable String username) {
        System.out.println("Deleting user: " + username);
        adminService.deleteUser(username);
        return ResponseEntity.ok("User deleted successfully");
    }


    @PatchMapping("/update-user-status/{username}")
    public ResponseEntity<UserResponse> updateUserStatus(@PathVariable String username, @RequestBody Map<String, Boolean> status) {
        UserResponse updatedUser = adminService.updateUserStatus(username, status.get("enabled"));
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }
    
}
