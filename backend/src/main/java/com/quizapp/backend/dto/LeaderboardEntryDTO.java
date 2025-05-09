package com.quizapp.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LeaderboardEntryDTO {

    private Long userId;
    private String username;
    private String firstName;
    private String lastName;
    private int totalQuizzesTaken;
    private Integer score;
    private Integer maxPossibleScore;
    private Integer rank;
}
