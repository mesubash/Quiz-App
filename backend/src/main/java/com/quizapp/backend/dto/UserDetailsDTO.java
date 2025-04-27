package com.quizapp.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDetailsDTO {
    private Long id;
    private String name;
    private String username;
    private String email;
    private String role;
    private boolean enabled;
    private Integer quizzesTaken;
    private Double averageScore;
    private String joinDate;
}