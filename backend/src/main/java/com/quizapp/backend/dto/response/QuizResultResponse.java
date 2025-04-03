package com.quizapp.backend.dto.response;


import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizResultResponse {
    private Long attemptId;
    private Long quizId;
    private String quizTitle;
    private Integer score;
    private Integer maxScore;
    private Double percentage;
    private Boolean passed;
    private LocalDateTime completedAt;
}