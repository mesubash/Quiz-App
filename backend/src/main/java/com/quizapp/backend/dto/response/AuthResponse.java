package com.quizapp.backend.dto.response;

import com.quizapp.backend.model.User;
import lombok.Builder;

@Builder
public record AuthResponse(
    String accessToken,
    String tokenType,
    Long expiresIn,
    UserResponse user
) {
    // If using a class instead of record:
    /*
    @Builder
    public static class AuthResponse {
        private String accessToken;
        private String tokenType;
        private Long expiresIn;
        private UserResponse user;
        
        // getters, setters, etc.
    }
    */
}