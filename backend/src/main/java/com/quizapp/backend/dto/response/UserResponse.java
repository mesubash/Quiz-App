package com.quizapp.backend.dto.response;



import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;    
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private int quizzesTaken;
    private boolean enabled;
    private String joinDate;
    private Double averageScore;
  
}
