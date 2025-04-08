package com.quizapp.backend.controller;

import com.quizapp.backend.dto.QuizAttemptDTO;
import com.quizapp.backend.dto.QuizResultDTO;
import com.quizapp.backend.dto.SubmissionDTO;
import com.quizapp.backend.service.QuizAttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attempts")
@RequiredArgsConstructor
public class QuizAttemptController {

    private final QuizAttemptService quizAttemptService;

    @PostMapping("/start")
    public ResponseEntity<QuizAttemptDTO> startQuizAttempt(@RequestBody Map<String, Long> requestBody) {
        Long quizId = requestBody.get("quizId");
        if (quizId == null) {
            throw new IllegalArgumentException("Quiz ID is required");
        }
        QuizAttemptDTO attempt = quizAttemptService.startAttempt(quizId);
        return ResponseEntity.ok(attempt);
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