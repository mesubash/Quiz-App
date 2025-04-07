package com.quizapp.backend.service;

import com.quizapp.backend.dto.LeaderboardEntryDTO;
import com.quizapp.backend.model.QuizAttempt;
import com.quizapp.backend.model.User;
import com.quizapp.backend.repository.QuizAttemptRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
class LeaderboardServiceTest {

    @Autowired
    private LeaderboardService leaderboardService;

    @MockBean
    private QuizAttemptRepository attemptRepository;

    @Test
    void shouldReturnGlobalLeaderboard() {
        // Mock data
        User user1 = new User();
        user1.setId(1L);
        user1.setUsername("user1");

        User user2 = new User();
        user2.setId(2L);
        user2.setUsername("user2");

        QuizAttempt attempt1 = new QuizAttempt();
        attempt1.setUser(user1);
        attempt1.setScore(90);

        QuizAttempt attempt2 = new QuizAttempt();
        attempt2.setUser(user2);
        attempt2.setScore(80);

        Mockito.when(attemptRepository.findTopScores()).thenReturn(Arrays.asList(attempt1, attempt2));

        // Call the service
        List<LeaderboardEntryDTO> leaderboard = leaderboardService.getGlobalLeaderboard();

        // Assertions
        assertEquals(2, leaderboard.size());
        assertEquals("user1", leaderboard.get(0).getUsername());
        assertEquals(90, leaderboard.get(0).getScore());
        assertEquals(1, leaderboard.get(0).getRank());
    }

    @Test
    void shouldReturnQuizLeaderboard() {
        // Mock data
        User user1 = new User();
        user1.setId(1L);
        user1.setUsername("user1");

        QuizAttempt attempt1 = new QuizAttempt();
        attempt1.setUser(user1);
        attempt1.setScore(85);

        Mockito.when(attemptRepository.findTopScoresByQuizId(1L)).thenReturn(Arrays.asList(attempt1));

        // Call the service
        List<LeaderboardEntryDTO> leaderboard = leaderboardService.getQuizLeaderboard(1L);

        // Assertions
        assertEquals(1, leaderboard.size());
        assertEquals("user1", leaderboard.get(0).getUsername());
        assertEquals(85, leaderboard.get(0).getScore());
        assertEquals(1, leaderboard.get(0).getRank());
    }
}