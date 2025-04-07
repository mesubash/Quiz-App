package com.quizapp.backend.controller;

import com.quizapp.backend.dto.LeaderboardEntryDTO;
import com.quizapp.backend.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<List<LeaderboardEntryDTO>> getGlobalLeaderboard() {
        return ResponseEntity.ok(leaderboardService.getGlobalLeaderboard());
    }

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<LeaderboardEntryDTO>> getQuizLeaderboard(
            @PathVariable Long quizId) {
        return ResponseEntity.ok(leaderboardService.getQuizLeaderboard(quizId));
    }
}