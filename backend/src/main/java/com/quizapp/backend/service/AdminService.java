package com.quizapp.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.quizapp.backend.dto.response.UserResponse;
import com.quizapp.backend.exception.BadRequestException;
import com.quizapp.backend.model.User;
import com.quizapp.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminService {
    private final UserRepository userRepository;
    private final UserService userService;
    
    @Transactional
    public UserResponse getCurrentAdmin() {
        // Get the currently authenticated user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByUsername(username)
            .orElseThrow(() -> new BadRequestException("User not found"));

        return userService.mapToUserResponse(admin);
    }

    @Transactional
    public Object getAllAdmins() {
        // Get all users with ADMIN role from the repository
        List<User> admins = userRepository.findAllByRole(User.Role.ADMIN);

        // Map to UserResponse list
        return mapToUserResponseList(admins);
    }
    
    @Transactional
    public Object getAllUsers() {
        // Get all users from the repository
        List<User> users = userRepository.findAll();

        // Map to UserResponse list
        return mapToUserResponseList(users);
    }

    @Transactional
    public void deleteUser(String username) {
        // Find the user by username
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new BadRequestException("User not found"));

        // Delete the user
        userRepository.delete(user);
    }

    @Transactional
    public void deleteCurrentAdmin() {
        // Get the currently authenticated user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new BadRequestException("User not found"));

        // Delete the user
        userRepository.delete(user);
    }

    private List<UserResponse> mapToUserResponseList(List<User> users) {
        return users.stream()
            .map(this::mapToUserResponse)
            .collect(Collectors.toList());
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
