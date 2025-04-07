package com.quizapp.backend.dto;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;


import com.quizapp.backend.model.enums.QuestionType;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class QuestionDTO {
    private Long id;
    private String text;
    private QuestionType questionType;
    private Integer points;
    private Long quizId;
    private List<OptionDTO> options;
}
