package com.quizapp.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class DetailedQuizAttemptDTO {

    private Long attemptId;
    private Long quizId;
    private String quizTitle;
    private int score;
    private int maxPossibleScore;
    private double percentage;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private int timeTakenSeconds;
    private String status;
    private List<QuestionResultDTO> questionResults;
}
