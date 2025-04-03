package com.quizapp.backend.dto.response;


import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponse {
    private Long id;
    private String questionText;
    private String questionType;
    private Integer points;
    private String difficulty;
    private String explanation;
    private List<OptionResponse> options;
}
