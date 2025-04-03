package com.quizapp.backend.dto.request;


import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOptionRequest {
    @NotBlank
    private String optionText;
    private Boolean isCorrect = false;
}