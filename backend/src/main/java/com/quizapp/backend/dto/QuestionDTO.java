package com.quizapp.backend.dto;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

import com.quizapp.backend.model.enums.QuestionType;
import com.quizapp.backend.model.enums.Difficulty;

import jakarta.validation.constraints.NotBlank;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class QuestionDTO {
    private Long id;

    @NotBlank(message = "Question text cannot be blank")
    private String text;

    private String correctAnswer;

    private QuestionType questionType;

    private Difficulty difficulty;

    private String explanation;

    private Integer points; //can be used as sum up while user gives the corrent answer in a quiz

    private Long quizId;

    private List<OptionDTO> options;
}