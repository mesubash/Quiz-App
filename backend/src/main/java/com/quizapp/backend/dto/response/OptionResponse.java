package com.quizapp.backend.dto.response;


import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptionResponse {
    private Long id;
    private String optionText;
    private Boolean isCorrect;
}
