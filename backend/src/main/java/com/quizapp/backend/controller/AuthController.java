package com.quizapp.backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.quizapp.backend.dto.request.AuthRequest;
import com.quizapp.backend.dto.request.RegisterRequest;
import com.quizapp.backend.dto.response.AuthResponse;
import com.quizapp.backend.dto.response.UserResponse;
import com.quizapp.backend.security.JwtTokenProvider;
import com.quizapp.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;



@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticateUser(
            @Valid @RequestBody AuthRequest authRequest, 
            HttpServletResponse response) {
        AuthResponse authResponse = authService.authenticateUser(authRequest);

        addRefreshTokenCookie(response, authResponse.getRefreshToken());

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> registerUser(
            @Valid @RequestBody RegisterRequest registerRequest) {
        return ResponseEntity.ok(authService.registerUser(registerRequest));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logoutUser(
            HttpServletRequest request, 
            HttpServletResponse response) {
        authService.logoutUser(request);
        clearRefreshTokenCookie(response);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/token/refresh")
    public ResponseEntity<AuthResponse> refreshAccessToken(
            HttpServletRequest request,
            HttpServletResponse response) {
        String refreshToken = extractRefreshToken(request);
        AuthResponse authResponse = authService.refreshToken(refreshToken);
        
        // Update the refresh token cookie
        addRefreshTokenCookie(response, authResponse.getRefreshToken());
        
        return ResponseEntity.ok(authResponse);
    }

    private void addRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/"); // Allow access from all paths
        cookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
        cookie.setAttribute("SameSite", "Strict");
        response.addCookie(cookie);
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("refreshToken", "");
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        cookie.setAttribute("SameSite", "Strict");
        response.addCookie(cookie);
    }

    private String extractRefreshToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("refreshToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        throw new AuthenticationCredentialsNotFoundException("Refresh token not found");
    }
}