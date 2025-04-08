package com.quizapp.backend.service;

import com.quizapp.backend.dto.request.AuthRequest;
import com.quizapp.backend.dto.request.RegisterRequest;
import com.quizapp.backend.dto.response.AuthResponse;
import com.quizapp.backend.dto.response.UserResponse;
import com.quizapp.backend.exception.BadRequestException;
import com.quizapp.backend.model.User;
import com.quizapp.backend.model.User.Role;
import com.quizapp.backend.repository.UserRepository;
import com.quizapp.backend.security.JwtTokenProvider;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;


@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final StringRedisTemplate redisTemplate;

    @Transactional
    public AuthResponse authenticateUser(AuthRequest authRequest) {
        try {
            // Authenticate user credentials
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    authRequest.getUsername(),
                    authRequest.getPassword()
                )
            );

            // Set authentication in security context
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Generate JWT tokens
            String accessToken = tokenProvider.generateToken(authentication);
            String refreshToken = tokenProvider.generateRefreshToken(authentication);

           // Store refresh token in Redis
            redisTemplate.opsForValue().set(
                "refresh:" + refreshToken,
                authentication.getName(),
                tokenProvider.getRefreshTokenExpirationInMs(),
                TimeUnit.MILLISECONDS
            );

            // Get user details
            User user = userRepository.findByUsername(authRequest.getUsername())
                .orElseThrow(() -> new BadRequestException("User not found"));

            return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getJwtExpirationInMs())
                .user(mapToUserResponse(user))
                .build();

        } catch (Exception e) {
            throw new BadRequestException("Invalid username/password");
        }

    }
    @Transactional
    public AuthResponse refreshAccessToken(String refreshToken) {
        // Validate the refresh token
        if (!tokenProvider.validateRefreshToken(refreshToken)) {
            throw new BadRequestException("Invalid or expired refresh token");
        }

        // Get the username from the refresh token
        String username = tokenProvider.getUsernameFromRefreshToken(refreshToken);

        // Generate a new access token
        String newAccessToken = tokenProvider.generateToken(username);

        return AuthResponse.builder()
            .accessToken(newAccessToken)
            .refreshToken(refreshToken) 
            .tokenType("Bearer")
            .expiresIn(tokenProvider.getJwtExpirationInMs())
            .build();
    
    }

    

    @Transactional
    public UserResponse registerUser(RegisterRequest registerRequest) {
        // Validate input
        if (registerRequest.getUsername() == null || registerRequest.getUsername().trim().isEmpty()) {
            throw new BadRequestException("Username cannot be empty");
        }
        if (registerRequest.getPassword() == null || registerRequest.getPassword().trim().isEmpty()) {
            throw new BadRequestException("Password cannot be empty");
        }
        if (registerRequest.getEmail() == null || registerRequest.getEmail().trim().isEmpty()) {
            throw new BadRequestException("Email cannot be empty");
        }

        // Check for existing user
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email is already in use");
        }

        // Create new user
        User user = User.builder()
            .username(registerRequest.getUsername().trim())
            .email(registerRequest.getEmail().trim().toLowerCase())
            .password(passwordEncoder.encode(registerRequest.getPassword()))
            .firstName(registerRequest.getFirstName() != null ? registerRequest.getFirstName().trim() : null)
            .lastName(registerRequest.getLastName() != null ? registerRequest.getLastName().trim() : null)
            .role(registerRequest.getRole() != null ? registerRequest.getRole() : Role.USER)
            .enabled(true)
            .build();

        // Save user
        User savedUser = userRepository.save(user);

        return mapToUserResponse(savedUser);
    }

    @Transactional
    public void logoutUser(HttpServletRequest request) {
        // Get the current authentication
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null) {
            throw new RuntimeException("User is not authenticated");
        }

        // Clear the authentication context
        SecurityContextHolder.clearContext();

        // Invalidate the JWT token
        String token = getCurrentToken(request);
        if (token != null) {
            invalidateToken(token);
        }
    }

    private String getCurrentToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }


    private void invalidateToken(String token) {
        // Store the token in Redis with an expiration time equal to the token's remaining validity
        long expiration = tokenProvider.getRemainingExpiration(token);
        if (expiration > 0) {
            redisTemplate.opsForValue().set("blacklist:" + token, "true", expiration, TimeUnit.MILLISECONDS);
        }
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .role(user.getRole().name())
            .build();
    }

    public UserResponse getUserDetailsByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .build();
    }
}