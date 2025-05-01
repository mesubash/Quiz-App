package com.quizapp.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quizapp.backend.dto.QuizResultDTO;
import com.quizapp.backend.dto.response.UserResponse;
import com.quizapp.backend.service.UserService;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("api/user")
@RequiredArgsConstructor
public class UserController {
    private static final Logger log = LoggerFactory.getLogger(UserController.class);


    private final UserService userService;
    
    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }
    @GetMapping("/profile/{username}")
    public ResponseEntity<UserResponse> getUser(@RequestParam String username) {
        return ResponseEntity.ok(userService.getUserByUsername(username));
    }
    
    
    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteCurrentUser() {
        userService.deleteCurrentUser();
        return ResponseEntity.ok("User deleted successfully");
    }

    @GetMapping("/quiz-history")
    public ResponseEntity<List<QuizResultDTO>> getQuizHistory() {
        return ResponseEntity.ok(userService.getQuizHistoryForCurrentUser());
    }

    @GetMapping("/quiz-histoy/{quizId}")
    public ResponseEntity<List<QuizResultDTO>> getQuizHistoryByQuizId(@RequestParam Long quizId) {
        return ResponseEntity.ok(userService.getQuizHistoryForCurrentUserByQuizId(quizId));
    }
    
    
}

    



    

