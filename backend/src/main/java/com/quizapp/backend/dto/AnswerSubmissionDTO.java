package com.quizapp.backend.dto;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class AnswerSubmissionDTO {
    private Long questionId;
    private List<Long> selectedOptionIds; // For multiple choice
    private String textAnswer; // For text-based answers (if supported)
}