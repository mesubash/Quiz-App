package com.quizapp.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.quizapp.backend.dto.QuestionResultDTO;
import com.quizapp.backend.dto.QuizResultDTO;
import com.quizapp.backend.dto.response.UserResponse;
import com.quizapp.backend.exception.BadRequestException;
import com.quizapp.backend.repository.QuizAttemptRepository;
import com.quizapp.backend.repository.UserRepository;
import com.quizapp.backend.model.QuizAttempt;
import com.quizapp.backend.model.User;
import com.quizapp.backend.model.Option;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final QuizAttemptRepository quizAttemptRepository;

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

    public List<QuizResultDTO> getQuizHistoryForCurrentUser() {
        User currentUser = getCurrentAuthenticatedUser();
        List<QuizAttempt> attempts = quizAttemptRepository.findByUserId(currentUser.getId());
    
        return attempts.stream()
                .map(attempt -> QuizResultDTO.builder()
                        .attemptId(attempt.getId())
                        .quizId(attempt.getQuiz().getId())
                        .quizTitle(attempt.getQuiz().getTitle())
                        .score(attempt.getScore())
                        .maxPossibleScore(attempt.getQuiz().getQuestions().size()) // Ensure this is correct
                        .percentage((attempt.getScore() * 100.0) / attempt.getQuiz().getQuestions().size())
                        .completedAt(attempt.getCompletedAt())
                        .timeTakenSeconds(attempt.getTimeTakenSeconds())
                        .questionResults(attempt.getUserAnswers().stream()
                                .map(answer -> QuestionResultDTO.builder()
                                        .questionId(answer.getQuestion().getId())
                                        .questionText(answer.getQuestion().getText())
                                        .correct(answer.isCorrect())
                                        .pointsAwarded(answer.isCorrect() ? 1 : 0)
                                        .correctOptionIds(answer.getQuestion().getOptions().stream()
                                                .filter(Option::isCorrect)
                                                .map(Option::getId)
                                                .collect(Collectors.toList()))
                                        .selectedOptionIds(List.of(answer.getOption().getId()))
                                        .build())
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());
    }
    


 

    public User getCurrentAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }

    public List<QuizResultDTO> getQuizHistoryForCurrentUserByQuizId(Long quizId) {
        User currentUser = getCurrentAuthenticatedUser();
        List<QuizAttempt> attempts = quizAttemptRepository.findByUserIdAndQuizId(currentUser.getId(), quizId);
    
        return attempts.stream()
                .map(attempt -> QuizResultDTO.builder()
                        .attemptId(attempt.getId())
                        .quizId(attempt.getQuiz().getId())
                        .quizTitle(attempt.getQuiz().getTitle())
                        .score(attempt.getScore())
                        .maxPossibleScore(attempt.getQuiz().getQuestions().size())
                        .percentage((attempt.getScore() * 100.0) / attempt.getQuiz().getQuestions().size())
                        .completedAt(attempt.getCompletedAt())
                        .timeTakenSeconds(attempt.getTimeTakenSeconds())
                        .questionResults(attempt.getUserAnswers().stream()
                                .map(answer -> QuestionResultDTO.builder()
                                        .questionId(answer.getQuestion().getId())
                                        .questionText(answer.getQuestion().getText())
                                        .selectedOptionIds(List.of(answer.getOption().getId()))
                                        .correctOptionIds(answer.getQuestion().getOptions().stream()
                                                .filter(Option::isCorrect)
                                                .map(Option::getId)
                                                .collect(Collectors.toList()))
                                        .correct(answer.isCorrect())
                                        .build())
                                .collect(Collectors.toList()))
                        .build())
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
