package com.quizapp.backend.service;

import com.quizapp.backend.dto.request.AuthRequest;
import com.quizapp.backend.dto.request.RegisterRequest;
import com.quizapp.backend.dto.response.AuthResponse;
import com.quizapp.backend.dto.response.UserResponse;
import com.quizapp.backend.exception.BadRequestException;
import com.quizapp.backend.model.User;
import com.quizapp.backend.repository.UserRepository;
import com.quizapp.backend.security.JwtTokenProvider;
import java.util.Set;
import java.util.UUID;

import lombok.extern.slf4j.Slf4j;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import com.quizapp.backend.model.enums.Role;
import com.quizapp.backend.exception.TooManyRequestsException;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final StringRedisTemplate redisTemplate;

    @Transactional
    public AuthResponse authenticateUser(AuthRequest authRequest) {
        // Check if the user exists by email
        User user = userRepository.findByEmail(authRequest.getEmail())
                .orElseThrow(() -> new BadRequestException("No user found with the provided email"));

        try {
            // Authenticate user credentials
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            user.getUsername(), 
                            authRequest.getPassword()
                    )
            );

            // Set authentication in security context
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
          

            // Generate JWT tokens
            String accessToken = tokenProvider.generateToken(authentication);
            String refreshToken = tokenProvider.generateRefreshToken(authentication);
            String family = UUID.randomUUID().toString();
            // Store refresh token with family in Redis
            String redisKey = "refresh:" + refreshToken;
            String familyKey = "family:" + refreshToken;
            redisTemplate.opsForValue().set(
                redisKey,
                authentication.getName(),
                tokenProvider.getRefreshTokenExpirationInMs(),
                TimeUnit.MILLISECONDS
            );
    
            redisTemplate.opsForValue().set(
                familyKey,
                family,
                tokenProvider.getRefreshTokenExpirationInMs(),
                TimeUnit.MILLISECONDS
            );


            // Store refresh token in Redis
            redisTemplate.opsForValue().set(
                    "refresh:" + refreshToken,
                    authentication.getName(),
                    tokenProvider.getRefreshTokenExpirationInMs(),
                    TimeUnit.MILLISECONDS
            );

            // Return the authentication response
            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(tokenProvider.getJwtExpirationInMs())
                    .user(mapToUserResponse(user))
                    .build();

        } catch (Exception e) {
            throw new BadRequestException("Invalid email or password");
        }
    }

    @Transactional
    public AuthResponse refreshAccessToken(String refreshToken) {
        // Validate the refresh token
        if (!tokenProvider.validateRefreshToken(refreshToken)) {
            throw new BadRequestException("Invalid or expired refresh token");
        }

        // Verify token exists in Redis
        String redisKey = "refresh:" + refreshToken;
        String familyKey = "family:" + refreshToken;
        String storedUsername = redisTemplate.opsForValue().get(redisKey);
        String tokenFamily = redisTemplate.opsForValue().get(familyKey);
        if (storedUsername == null || tokenFamily == null) {
            // Possible reuse attack - invalidate all user tokens
            String username = tokenProvider.getUsernameFromRefreshToken(refreshToken);
            invalidateAllUserTokens(username);
            throw new BadRequestException("Refresh token has been revoked");
        }

        // Get username from token and verify it matches Redis
        String tokenUsername = tokenProvider.getUsernameFromRefreshToken(refreshToken);
        if (!tokenUsername.equals(storedUsername)) {
            throw new BadRequestException("Token mismatch");
        }

        // Get user details
        User user = userRepository.findByUsername(tokenUsername)
            .orElseThrow(() -> new BadRequestException("User not found"));

        // Generate new tokens
        String newAccessToken = tokenProvider.generateToken(tokenUsername);
        String newRefreshToken = tokenProvider.generateRefreshToken(tokenUsername);
        String newFamily = UUID.randomUUID().toString();

        // Update Redis - remove old token and store new one
        redisTemplate.delete(redisKey);
        redisTemplate.delete(familyKey);
        // Store new refresh token with family
        String newRedisKey = "refresh:" + newRefreshToken;
        String newFamilyKey = "family:" + newRefreshToken;
        redisTemplate.opsForValue().set(
            "refresh:" + newRefreshToken,
            tokenUsername,
            tokenProvider.getRefreshTokenExpirationInMs(),
            TimeUnit.MILLISECONDS
        );
        redisTemplate.opsForValue().set(
            newFamilyKey,
            newFamily,
            tokenProvider.getRefreshTokenExpirationInMs(),
            TimeUnit.MILLISECONDS
        );

        return AuthResponse.builder()
            .accessToken(newAccessToken)
            .refreshToken(newRefreshToken)
            .tokenType("Bearer")
            .expiresIn(tokenProvider.getJwtExpirationInMs())
            .user(mapToUserResponse(user))  // Include user data in response
            .build();
    }
    private void invalidateAllUserTokens(String username) {
    // Find all refresh tokens for user
        Set<String> userTokens = redisTemplate.keys("refresh:*").stream()
            .filter(key -> username.equals(redisTemplate.opsForValue().get(key)))
            .collect(Collectors.toSet());

        // Delete all tokens and their families
        userTokens.forEach(token -> {
            redisTemplate.delete(token);
            redisTemplate.delete("family:" + token.substring("refresh:".length()));
        });
    }
    private void checkRefreshRateLimit(String username) {
        String rateLimitKey = "rateLimit:refresh:" + username;
        Long attempts = redisTemplate.opsForValue().increment(rateLimitKey);
        
        if (attempts == 1) {
            redisTemplate.expire(rateLimitKey, 1, TimeUnit.MINUTES);
        }
        
        if (attempts > 5) {
            throw new TooManyRequestsException("Too many refresh attempts. Please wait 1 minute.");
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
            .role(registerRequest.getRole() != null ? registerRequest.getRole() : Role.USER)
            .enabled(true)
            .build();

        // Save user
        User savedUser = userRepository.save(user);

        return mapToUserResponse(savedUser);
    }

    @Transactional
    public void logoutUser(HttpServletRequest request) {
        System.out.println("1 Logging out user...");
        try {
            System.out.println("2 Logging out user...");
            // Get the current authentication
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null) {
                throw new BadRequestException("User is not authenticated");
            }

            // Get username from authentication
            String username = authentication.getName();
            System.out.println("3 Logging out user...");
            // Invalidate access token
            String accessToken = getCurrentToken(request);
            if (accessToken != null) {
                invalidateToken(accessToken);
            }

            // Remove all refresh tokens for the user from Redis
            String userRefreshTokensKey = "user_refresh_tokens:" + username;
            Set<String> refreshTokens = redisTemplate.opsForSet().members(userRefreshTokensKey);
            if (refreshTokens != null) {
                for (String refreshToken : refreshTokens) {
                    redisTemplate.delete("refresh:" + refreshToken);
                }
                redisTemplate.delete(userRefreshTokensKey);
            }

            // Clear security context
            SecurityContextHolder.clearContext();

            // Clear user sessions
            redisTemplate.delete("user_sessions:" + username);
            System.out.println("User " + username + " logged out successfully.");

        } catch (Exception e) {
            throw new BadRequestException("Logout failed: " + e.getMessage());
        }
    }

    private void invalidateToken(String token) {
        try {
            long expiration = tokenProvider.getRemainingExpiration(token);
            if (expiration > 0) {
                String blacklistKey = "blacklist:" + token;
                redisTemplate.opsForValue().set(blacklistKey, "true", expiration, TimeUnit.MILLISECONDS);
                
                // Add to user's blacklisted tokens
                String username = tokenProvider.getUsernameFromJWT(token);
                String userBlacklistKey = "user_blacklist:" + username;
                redisTemplate.opsForSet().add(userBlacklistKey, token);
                redisTemplate.expire(userBlacklistKey, expiration, TimeUnit.MILLISECONDS);
            }
        } catch (Exception e) {
            throw new BadRequestException("Token invalidation failed");
        }
    }

    private String getCurrentToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
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