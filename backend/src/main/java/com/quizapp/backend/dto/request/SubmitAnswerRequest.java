package com.quizapp.backend.dto.request;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitAnswerRequest {
    private Long questionId;
    private List<Long> selectedOptionIds;
}
