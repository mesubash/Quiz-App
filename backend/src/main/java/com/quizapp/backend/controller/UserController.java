package com.quizapp.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quizapp.backend.dto.QuizResultDTO;
import com.quizapp.backend.dto.response.UserResponse;
import com.quizapp.backend.service.UserService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestParam;




@RestController
@RequestMapping("api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
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
