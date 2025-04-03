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
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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
            
            // Get user details
            User user = userRepository.findByUsername(authRequest.getUsername())
                .orElseThrow(() -> new BadRequestException("User not found"));

            return AuthResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getJwtExpirationInMs())
                .user(mapToUserResponse(user))
                .build();

        } catch (Exception e) {
            throw new BadRequestException("Invalid username/password");
        }
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
            .role(Role.USER)
            .enabled(true)
            .build();

        // Save user
        User savedUser = userRepository.save(user);
        
        return mapToUserResponse(savedUser);
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
}