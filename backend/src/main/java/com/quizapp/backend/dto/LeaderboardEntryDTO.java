package com.quizapp.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LeaderboardEntryDTO {
    private Long userId;
    private String username;
    private Integer score;
    private Integer rank;
}