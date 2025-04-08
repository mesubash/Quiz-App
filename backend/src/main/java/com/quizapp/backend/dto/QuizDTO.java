package com.quizapp.backend.dto;

import java.util.List;

import com.quizapp.backend.model.enums.Difficulty;

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
    private Long id;
    @NotBlank(message = "Title is required")
    private String title;
    private String description;
    private Integer timeLimitMinutes;
    private Boolean isPublished;
    private Long createdById;
    private Difficulty difficulty;
    private List<QuestionDTO> questions; 
}