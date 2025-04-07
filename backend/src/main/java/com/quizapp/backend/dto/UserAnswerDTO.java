package com.quizapp.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserAnswerDTO {
    private Long id;
    private Long attemptId;
    private Long questionId;
    private Long optionId;
    private Boolean isCorrect;
    public Object getSelectedAnswer() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getSelectedAnswer'");
    }
}