package com.quizapp.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.quizapp.backend.dto.response.UserResponse;
import com.quizapp.backend.exception.BadRequestException;
import com.quizapp.backend.repository.UserRepository;
import com.quizapp.backend.model.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    @Transactional
    public UserResponse getCurrentUser() {
        // Get the currently authenticated user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new BadRequestException("User not found"));

        return mapToUserResponse(user);
    }

    

    @Transactional
    public void deleteCurrentUser() {
        // Get the currently authenticated user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new BadRequestException("User not found"));

        // Delete the user
        userRepository.delete(user);
    }




    public UserResponse getUser(String username) {
        // Find the user by username
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new BadRequestException("User not found"));

        // Map to UserResponse
        return mapToUserResponse(user);
    }



    UserResponse mapToUserResponse(User user) {
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
