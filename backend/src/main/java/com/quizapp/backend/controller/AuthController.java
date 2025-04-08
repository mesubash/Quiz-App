package com.quizapp.backend.controller;

import lombok.RequiredArgsConstructor;


import com.quizapp.backend.dto.request.AuthRequest;
import com.quizapp.backend.dto.request.RegisterRequest;
import com.quizapp.backend.dto.response.AuthResponse;
import com.quizapp.backend.dto.response.UserResponse;
import com.quizapp.backend.security.JwtTokenProvider;
import com.quizapp.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;



@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody AuthRequest authRequest, HttpServletResponse response) {
    AuthResponse authResponse = authService.authenticateUser(authRequest);

    // Set the refresh token as an HTTP-only cookie
    Cookie refreshTokenCookie = new Cookie("refreshToken", authResponse.getRefreshToken());
    refreshTokenCookie.setHttpOnly(true);
    refreshTokenCookie.setSecure(true); // Use HTTPS in production
    refreshTokenCookie.setPath("/api/auth/refresh");
    refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
    response.addCookie(refreshTokenCookie);

    return ResponseEntity.ok(authResponse);
}

    @PostMapping("/register")
    public ResponseEntity<UserResponse> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        return ResponseEntity.ok(authService.registerUser(registerRequest));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logoutUser(HttpServletRequest request) {
        authService.logoutUser(request);
        return ResponseEntity.ok("User logged out successfully.");
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshAccessToken(HttpServletRequest request) {
        String refreshToken = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("refreshToken".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }

        if (refreshToken == null) {
            throw new RuntimeException("Refresh token not found");
        }

        System.out.println("Extracted Refresh Token: " + refreshToken);

        // Validate the refresh token
        if (!jwtTokenProvider.validateRefreshToken(refreshToken)) {
            throw new RuntimeException("Invalid or expired refresh token");
        }

        // Generate a new access token
        String username = jwtTokenProvider.getUsernameFromRefreshToken(refreshToken);
        String newAccessToken = jwtTokenProvider.generateToken(username);

        // Retrieve user details
        UserResponse userResponse = authService.getUserDetailsByUsername(username);

        // Build the AuthResponse object using the builder pattern
        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getJwtExpirationInMs())
                .user(userResponse)
                .build();

        return ResponseEntity.ok(authResponse);
    }

    
}


