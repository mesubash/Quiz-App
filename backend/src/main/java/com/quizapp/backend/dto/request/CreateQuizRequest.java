package com.quizapp.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuizRequest {
    @NotBlank
    @Size(max = 100)
    private String title;

    @Size(max = 500)
    private String description;

    private Integer timeLimitMinutes;
    private Integer passingScore;
    private Boolean isPublished = false;
    private List<CreateQuestionRequest> questions;
}
