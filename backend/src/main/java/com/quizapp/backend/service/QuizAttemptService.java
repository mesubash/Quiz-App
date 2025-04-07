package com.quizapp.backend.service;

import com.quizapp.backend.dto.*;
import com.quizapp.backend.exception.ResourceNotFoundException;
import com.quizapp.backend.model.*;
import com.quizapp.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import com.quizapp.backend.exception.BadRequestException;

@Service
@RequiredArgsConstructor
public class QuizAttemptService {

    private final QuizAttemptRepository attemptRepository;
    private final QuizRepository quizRepository;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final UserAnswerRepository userAnswerRepository;

    @Transactional
    public QuizAttemptDTO startAttempt(Long quizId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        QuizAttempt attempt = new QuizAttempt();
        attempt.setUser(user);
        attempt.setQuiz(quiz);
        attempt.setStartedAt(LocalDateTime.now());
        
        QuizAttempt savedAttempt = attemptRepository.save(attempt);
        return mapToDTO(savedAttempt);
    }

    @Transactional
    public QuizResultDTO submitAttempt(Long attemptId, SubmissionDTO submission) {
        QuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));
        
        // Calculate score
        int score = calculateScore(attempt, submission);
        long timeTaken = Duration.between(attempt.getStartedAt(), LocalDateTime.now()).getSeconds();
        attempt.setTimeTakenSeconds((int) timeTaken);
        
        attempt.setScore(score);
        attempt.setCompletedAt(LocalDateTime.now());
        attemptRepository.save(attempt);
        if (submission.getAnswers() == null || submission.getAnswers().isEmpty()) {
            throw new BadRequestException("Submission must contain answers");
        }
        double percentage = (double) score / attempt.getQuiz().getQuestions().size() * 100;

        return QuizResultDTO.builder()
                .attemptId(attemptId)
                .quizId(attempt.getQuiz().getId())
                .quizTitle(attempt.getQuiz().getTitle())
                .score(score)
                .maxPossibleScore(attempt.getQuiz().getQuestions().size())
                .percentage(percentage)
                .completedAt(attempt.getCompletedAt())
                .build();
        
        
    }

    @Transactional(readOnly = true)
    public List<QuizAttemptDTO> getUserAttempts() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return attemptRepository.findByUsername(username).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private int calculateScore(QuizAttempt attempt, SubmissionDTO submission) {
        int score = 0;
        for (AnswerSubmissionDTO answer : submission.getAnswers()) {
            Question question = questionRepository.findById(answer.getQuestionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
            
                     if (question.getOptions().stream()
                    .filter(Option::isCorrect)
                    .map(Option::getId)
                    .collect(Collectors.toList())
                    .equals(answer.getSelectedOptionIds())) {
                     score++;
                    }
            
            UserAnswer userAnswer = new UserAnswer();
            userAnswer.setQuizAttempt(attempt);
            userAnswer.setQuestion(question);
            userAnswer.setSelectedAnswer(answer.getSelectedOptionIds());
            userAnswerRepository.save(userAnswer);
        }
        return score;
    }

    private QuizAttemptDTO mapToDTO(QuizAttempt attempt) {
        return QuizAttemptDTO.builder()
                .id(attempt.getId())
                .quizId(attempt.getQuiz().getId())
                .userId(attempt.getUser().getId())
                .startedAt(attempt.getStartedAt())
                .completedAt(attempt.getCompletedAt())
                .score(attempt.getScore())
                .build();
    }
    
}