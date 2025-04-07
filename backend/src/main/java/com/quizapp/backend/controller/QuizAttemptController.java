package com.quizapp.backend.controller;

import com.quizapp.backend.dto.QuizAttemptDTO;
import com.quizapp.backend.dto.QuizResultDTO;
import com.quizapp.backend.dto.SubmissionDTO;
import com.quizapp.backend.service.QuizAttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/attempts")
@RequiredArgsConstructor
public class QuizAttemptController {

    private final QuizAttemptService quizAttemptService;

    @PostMapping("/start")
    public ResponseEntity<QuizAttemptDTO> startAttempt(@RequestParam Long quizId) {
        return ResponseEntity.ok(quizAttemptService.startAttempt(quizId));
    }

    @PostMapping("/{attemptId}/submit")
    public ResponseEntity<QuizResultDTO> submitAttempt(
            @PathVariable Long attemptId,
            @RequestBody SubmissionDTO submission) {
        return ResponseEntity.ok(quizAttemptService.submitAttempt(attemptId, submission));
    }

    @GetMapping("/user")
    public ResponseEntity<List<QuizAttemptDTO>> getUserAttempts() {
        return ResponseEntity.ok(quizAttemptService.getUserAttempts());
    }
}