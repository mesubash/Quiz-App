package com.quizapp.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class QuestionResultDTO {

    private Long questionId;
    private String questionText;
    private boolean correct;
    private Integer pointsAwarded;
    private List<Long> correctOptionIds;
    private List<Long> selectedOptionIds;
    private List<OptionDTO> options;
    private String explanation;
}
