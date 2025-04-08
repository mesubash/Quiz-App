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

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final QuizAttemptRepository attemptRepository;

    @Cacheable("globalLeaderboard")
    public List<LeaderboardEntryDTO> getGlobalLeaderboard() {
        List<QuizAttempt> attempts = attemptRepository.findTopScores();
        AtomicInteger rank = new AtomicInteger(1);
        return attempts.stream()
                .map(attempt -> LeaderboardEntryDTO.builder()
                        .userId(attempt.getUser().getId())
                        .username(attempt.getUser().getUsername())
                        .score(attempt.getScore())
                        .rank(rank.getAndIncrement())
                        .build())
                .collect(Collectors.toList());
    }

    @Cacheable(value = "quizLeaderboard", key = "#quizId")
    public List<LeaderboardEntryDTO> getQuizLeaderboard(Long quizId) {
        List<QuizAttempt> attempts = attemptRepository.findTopScoresByQuizId(quizId);
        AtomicInteger rank = new AtomicInteger(1);
        return attempts.stream()
                .map(attempt -> LeaderboardEntryDTO.builder()
                        .userId(attempt.getUser().getId())
                        .username(attempt.getUser().getUsername())
                        .score(attempt.getScore())
                        .rank(rank.getAndIncrement())
                        .build())
                .collect(Collectors.toList());
    }
}