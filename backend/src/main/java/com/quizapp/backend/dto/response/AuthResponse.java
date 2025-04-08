package com.quizapp.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken; 
    private String tokenType;
    private long expiresIn;
    private UserResponse user;
}