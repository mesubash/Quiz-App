package com.quizapp.backend.service;

import com.quizapp.backend.dto.LeaderboardEntryDTO;
import com.quizapp.backend.model.QuizAttempt;
import com.quizapp.backend.repository.QuizAttemptRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import com.quizapp.backend.model.User;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final QuizAttemptRepository attemptRepository;

    @Cacheable("globalLeaderboard")
    public List<LeaderboardEntryDTO> getGlobalLeaderboard() {
        List<QuizAttempt> attempts = attemptRepository.findTopScores();
        AtomicInteger rank = new AtomicInteger(1);
        return attempts.stream()
                .sorted((a1, a2) -> Integer.compare(a2.getScore(), a1.getScore())) // Ensure sorted by score descending
                .map(attempt -> {
                    User user = attempt.getUser();
                    int totalQuizzesTaken = attemptRepository.countByUserId(user.getId()); // Count total quizzes taken by the user

                    return LeaderboardEntryDTO.builder()
                            .userId(user.getId())
                            .username(user.getUsername())
                            .firstName(user.getFirstName())
                            .lastName(user.getLastName())
                            .totalQuizzesTaken(totalQuizzesTaken)
                            .score(attempt.getScore())
                            .maxPossibleScore(attempt.getQuiz().getQuestions().size())
                            .rank(rank.getAndIncrement())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Cacheable(value = "quizLeaderboard", key = "#quizId")
    public List<LeaderboardEntryDTO> getQuizLeaderboard(Long quizId) {
        List<QuizAttempt> attempts = attemptRepository.findTopScoresByQuizId(quizId);
        AtomicInteger rank = new AtomicInteger(1);
        return attempts.stream()
                .map(attempt -> {
                    User user = attempt.getUser();
                    int totalQuizzesTaken = attemptRepository.countByUserId(user.getId()); // Count total quizzes taken by the user

                    return LeaderboardEntryDTO.builder()
                            .userId(user.getId())
                            .username(user.getUsername())
                            .firstName(user.getFirstName()) // Include first name
                            .lastName(user.getLastName()) // Include last name
                            .totalQuizzesTaken(totalQuizzesTaken) // Include total quizzes taken
                            .score(attempt.getScore())
                            .maxPossibleScore(attempt.getQuiz().getQuestions().size())
                            .rank(rank.getAndIncrement())
                            .build();
                })
                .collect(Collectors.toList());
    }
}
