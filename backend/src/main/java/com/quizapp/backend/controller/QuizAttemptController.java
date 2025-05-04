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

import com.quizapp.backend.dto.DetailedQuizAttemptDTO;

@RestController
@RequestMapping("/api/attempts")
@RequiredArgsConstructor
public class QuizAttemptController {

    private final QuizAttemptService quizAttemptService;

    @PostMapping("/start")
    public ResponseEntity<?> startQuizAttempt(@RequestBody Map<String, Long> requestBody) {
        Long quizId = requestBody.get("quizId");
        if (quizId == null) {
            throw new IllegalArgumentException("Quiz ID is required");
        }

        Map<String, Object> response = quizAttemptService.startNewAttempt(quizId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/resume/{quizId}")
    public ResponseEntity<?> resumeQuizAttempt(@PathVariable Long quizId) {
        Map<String, Object> response = quizAttemptService.resumeAttempt(quizId);
        if (response == null) {
            return ResponseEntity.status(404).body(Map.of(
                    "message", "No active attempt found for the specified quiz."
            ));
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{attemptId}/submit")
    public ResponseEntity<QuizResultDTO> submitAttempt(
            @PathVariable Long attemptId,
            @RequestBody SubmissionDTO submission) {
        return ResponseEntity.ok(quizAttemptService.submitAttempt(attemptId, submission));
    }

    @PostMapping("/end")
    public ResponseEntity<?> endActiveAttempt(@RequestBody Map<String, Long> requestBody) {
        Long quizId = requestBody.get("quizId");
        if (quizId == null) {
            throw new IllegalArgumentException("Quiz ID is required");
        }

        boolean ended = quizAttemptService.endActiveAttempt(quizId);
        if (ended) {
            return ResponseEntity.ok(Map.of(
                    "message", "The active attempt for the quiz has been successfully ended."
            ));
        } else {
            return ResponseEntity.status(404).body(Map.of(
                    "message", "No active attempt found for the specified quiz."
            ));
        }
    }

    @PostMapping("/end-and-start")
    public ResponseEntity<QuizAttemptDTO> endAndStartNewAttempt(@RequestBody Map<String, Long> requestBody) {
        Long quizId = requestBody.get("quizId");
        if (quizId == null) {
            throw new IllegalArgumentException("Quiz ID is required");
        }

        QuizAttemptDTO newAttempt = quizAttemptService.endActiveAttemptAndStartNew(quizId);
        return ResponseEntity.ok(newAttempt);
    }

    @GetMapping("/user")
    public ResponseEntity<List<QuizAttemptDTO>> getUserAttempts() {
        return ResponseEntity.ok(quizAttemptService.getUserAttempts());
    }

    @GetMapping("/user/{attemptId}")
    public ResponseEntity<DetailedQuizAttemptDTO> getUserAttemptById(@PathVariable Long attemptId) {
        DetailedQuizAttemptDTO attempt = quizAttemptService.getUserAttemptById(attemptId);
        if (attempt == null) {
            return ResponseEntity.status(404).body(null);
        }
        return ResponseEntity.ok(attempt);
    }

}
