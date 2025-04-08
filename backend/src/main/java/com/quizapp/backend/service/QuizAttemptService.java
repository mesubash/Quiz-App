package com.quizapp.backend.service;

import com.quizapp.backend.dto.*;
import com.quizapp.backend.exception.ResourceNotFoundException;
import com.quizapp.backend.model.*;
import com.quizapp.backend.model.enums.AttemptStatus;
import com.quizapp.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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

        // Check if the user already has an active attempt for this quiz
        List<QuizAttempt> activeAttempts = attemptRepository.findByUserId(user.getId()).stream()
                .filter(attempt -> attempt.getQuiz().getId().equals(quizId) && attempt.getStatus() == AttemptStatus.IN_PROGRESS)
                .collect(Collectors.toList());

        if (!activeAttempts.isEmpty()) {
            throw new BadRequestException("You already have an active attempt for this quiz.");
        }

        QuizAttempt attempt = QuizAttempt.builder()
                .user(user)
                .quiz(quiz)
                .startedAt(LocalDateTime.now())
                .status(AttemptStatus.IN_PROGRESS)
                .build();

        QuizAttempt savedAttempt = attemptRepository.save(attempt);
        return mapToDTO(savedAttempt);
    }

    @Transactional
    public QuizResultDTO submitAttempt(Long attemptId, SubmissionDTO submission) {
        QuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));

        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new BadRequestException("Only in-progress attempts can be submitted.");
        }

        if (submission.getAnswers() == null || submission.getAnswers().isEmpty()) {
            throw new BadRequestException("Submission must contain answers.");
        }

        // Validate that all submitted answers belong to the quiz
        Set<Long> quizQuestionIds = attempt.getQuiz().getQuestions().stream()
                .map(Question::getId)
                .collect(Collectors.toSet());

        for (AnswerSubmissionDTO answer : submission.getAnswers()) {
            if (!quizQuestionIds.contains(answer.getQuestionId())) {
                throw new BadRequestException("Invalid question ID in submission: " + answer.getQuestionId());
            }
        }

        // Calculate score
        int score = calculateScore(attempt, submission);

        // Update the attempt with the score and completion time
        long timeTaken = Duration.between(attempt.getStartedAt(), LocalDateTime.now()).getSeconds();
        attempt.setTimeTakenSeconds((int) timeTaken);
        attempt.setScore(score);
        attempt.setCompletedAt(LocalDateTime.now());
        attempt.setStatus(AttemptStatus.COMPLETED);
        attemptRepository.save(attempt);

        // Calculate percentage
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
            // Fetch the question from the database
            Question question = questionRepository.findById(answer.getQuestionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
    
            // Get correct option IDs for the question
            Set<Long> correctOptionIds = question.getOptions().stream()
                    .filter(Option::isCorrect)
                    .map(Option::getId)
                    .collect(Collectors.toSet());
    
            // Get selected option IDs from the submission
            Set<Long> selectedOptionIds = new HashSet<>(answer.getSelectedOptionIds());
    
            // Compare correct options with selected options
            if (correctOptionIds.equals(selectedOptionIds)) {
                question.setCorrectSelections(question.getCorrectSelections() + 1); // Increment correct selections
                score++; // Increment the score for the correct answer
            }
    
            // Increment the attempts for the question
            question.setAttempts(question.getAttempts() + 1);
    
            // Save the updated question
            questionRepository.save(question);
    
            // Save the user's answer
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