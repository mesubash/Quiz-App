package com.quizapp.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OptionDTO {
    private Long id;
    private String text;
    private Boolean isCorrect;
    private Long questionId;
}