package com.quizapp.backend.dto.response;


import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardResponse {
    private Long userId;
    private String username;
    private Integer quizzesTaken;
    private Integer totalScore;
    private Double averageScore;
    private Integer highestScore;
}
