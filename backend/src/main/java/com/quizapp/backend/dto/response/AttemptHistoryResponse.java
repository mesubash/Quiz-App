package com.quizapp.backend.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptHistoryResponse {
    private Long id;
    private Long quizId;
    private String quizTitle;
    private Integer score;
    private Integer maxScore;
    private LocalDateTime completedAt;
}