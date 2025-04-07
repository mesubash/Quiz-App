package com.quizapp.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class QuizAttemptDTO {
    private Long id;
    private Long quizId;
    private Long userId;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Integer score;
    private Integer timeTakenSeconds;
}