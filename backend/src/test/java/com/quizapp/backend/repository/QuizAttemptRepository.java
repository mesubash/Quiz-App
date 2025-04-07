package com.quizapp.backend.repository;

import com.quizapp.backend.model.Quiz;
import com.quizapp.backend.model.QuizAttempt;
import com.quizapp.backend.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@DataJpaTest
class QuizAttemptRepositoryTest {

    @Autowired
    private QuizAttemptRepository attemptRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldFindAttemptsByQuizId() {
        // Setup data
        User user = new User();
        user.setUsername("testuser");
        user.setPassword("password");
        user = userRepository.save(user);

        Quiz quiz = new Quiz();
        quiz.setTitle("Java Basics");
        quiz.setDescription("Test your Java knowledge");
        quiz.setCreatedBy(user);
        quiz = quizRepository.save(quiz);

        QuizAttempt attempt = new QuizAttempt();
        attempt.setUser(user);
        attempt.setQuiz(quiz);
        attempt.setScore(85);
        attemptRepository.save(attempt);

        // Test repository method
        List<QuizAttempt> attempts = attemptRepository.findByQuizId(quiz.getId());
        assertEquals(1, attempts.size());
        assertEquals(85, attempts.get(0).getScore());
    }
}