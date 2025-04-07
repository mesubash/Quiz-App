package com.quizapp.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;


@Data
@Builder
public class SubmissionDTO {
    private Long attemptId;
    private List<AnswerSubmissionDTO> answers;
    
}




