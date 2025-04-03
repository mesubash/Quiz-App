package com.quizapp.backend.dto.request;


import com.quizapp.backend.model.QuestionType;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuestionRequest {
    @NotBlank
    private String questionText;

    @NotNull
    private QuestionType questionType;

    @Min(1)
    private Integer points = 1;

    private String difficulty = "MEDIUM";
    private String explanation;
    private List<CreateOptionRequest> options;
}