package com.quizapp.backend.controller;

import com.quizapp.backend.dto.QuizDTO;
import com.quizapp.backend.dto.QuizResultDTO;
import com.quizapp.backend.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuizDTO> createQuiz(@RequestBody QuizDTO quizDTO) {

        return ResponseEntity.ok(quizService.createQuiz(quizDTO));
    }

    @GetMapping
    public ResponseEntity<List<QuizDTO>> getAllQuizzes() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }

    @GetMapping("/{quizId}")
    public ResponseEntity<QuizDTO> getQuizById(@PathVariable("quizId") Long quizId) {
        return ResponseEntity.ok(quizService.getQuizById(quizId));
    }

    @PutMapping("/{quizId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuizDTO> updateQuiz(
            @PathVariable("quizId") Long quizId,
            @RequestBody QuizDTO quizDTO) {
        return ResponseEntity.ok(quizService.updateQuiz(quizId, quizDTO));
    }

    @DeleteMapping("/{quizId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteQuiz(@PathVariable("quizId") Long quizId) {
        quizService.deleteQuiz(quizId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/history/{quizId}")
    public ResponseEntity<List<QuizResultDTO>> getQuizHistoryByQuizId(@PathVariable Long quizId) {
        return ResponseEntity.ok(quizService.getQuizHistoryByQuizId(quizId));
    }
    


    @GetMapping("/categories")
    public List<String> getAllCategories() {
        return quizService.getAllCategories();
    }
}
