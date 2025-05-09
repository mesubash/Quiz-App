package com.quizapp.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.time.LocalDateTime;

@Data
@Builder
public class QuizResultDTO {

    private Long attemptId;
    private Long quizId;
    private String quizTitle;
    private Integer score;
    private Integer maxPossibleScore;
    private Double percentage;
    private LocalDateTime completedAt;
    private Integer timeTakenSeconds;
    private String status;
    private List<QuestionResultDTO> questionResults;
}
