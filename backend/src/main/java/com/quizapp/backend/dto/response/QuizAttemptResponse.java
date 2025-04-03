package com.quizapp.backend.dto.response;


import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizAttemptResponse {
    private Long id;
    private Long quizId;
    private String quizTitle;
    private LocalDateTime startedAt;
    private String status;
}
