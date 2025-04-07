package com.quizapp.backend.dto;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.quizapp.backend.service.QuizService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@AllArgsConstructor
@Data
@NoArgsConstructor
public class QuizDTO {
    private QuizService quizService;
   
    private Long id;
    @NotBlank(message = "Title is required")
    private String title;
    private String description;
    @Min(value = 1, message = "Time limit must be at least 1 minute")
    private Integer timeLimitMinutes;
    private Boolean isPublished;
    private Long createdById;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuizDTO> createQuiz(@Valid @RequestBody QuizDTO quizDTO) {
        if (quizDTO == null) {
            throw new IllegalArgumentException("QuizDTO cannot be null");
        }
        return ResponseEntity.ok(quizService.createQuiz(quizDTO));
    }
    
}