package com.quizapp.backend.dto.response;


import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizResponse {
    private Long id;
    private String title;
    private String description;
    private String createdBy;
    private boolean isPublished;
    private Integer timeLimitMinutes;
    private Integer passingScore;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer questionCount;
    private List<QuestionResponse> questions;
}
