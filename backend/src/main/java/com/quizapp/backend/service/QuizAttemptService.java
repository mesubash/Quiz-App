package com.quizapp.backend.service;

import com.quizapp.backend.dto.*;
import com.quizapp.backend.exception.ResourceNotFoundException;
import com.quizapp.backend.exception.BadRequestException;
import com.quizapp.backend.model.*;
import com.quizapp.backend.model.enums.AttemptStatus;
import com.quizapp.backend.repository.*;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import com.quizapp.backend.model.enums.Role;

@Service
@RequiredArgsConstructor
public class QuizAttemptService {

    private final QuizAttemptRepository attemptRepository;
    private final QuizRepository quizRepository;
    private final UserRepository userRepository;
    private final UserAnswerRepository userAnswerRepository;

    @Transactional
    public Map<String, Object> startNewAttempt(Long quizId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        // Create a new attempt
        QuizAttempt attempt = QuizAttempt.builder()
                .user(user)
                .quiz(quiz)
                .startedAt(LocalDateTime.now())
                .status(AttemptStatus.IN_PROGRESS)
                .build();

        QuizAttempt savedAttempt = attemptRepository.save(attempt);

        // Return both the attempt and quiz
        return Map.of(
                "attempt", mapToDTO(savedAttempt),
                "quiz", mapToQuizDTO(quiz)
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Object> resumeAttempt(Long quizId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        // Find active attempts
        List<QuizAttempt> activeAttempts = attemptRepository.findActiveAttemptsByUserAndQuiz(user.getId(), quizId);
        if (activeAttempts.isEmpty()) {
            return null; // No active attempt found
        }

        // Return both the active attempt and quiz
        return Map.of(
                "attempt", mapToDTO(activeAttempts.get(0)),
                "quiz", mapToQuizDTO(quiz)
        );
    }

    @Transactional(readOnly = true)
    public QuizAttemptDTO getActiveAttempt(Long quizId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check for active attempts
        List<QuizAttempt> activeAttempts = attemptRepository.findActiveAttemptsByUserAndQuiz(user.getId(), quizId);
        if (!activeAttempts.isEmpty()) {
            return mapToDTO(activeAttempts.get(0)); // Return the first active attempt
        }
        return null; // No active attempt found
    }

    @Transactional
    public boolean endActiveAttempt(Long quizId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Find active attempts for the user and quiz
        List<QuizAttempt> activeAttempts = attemptRepository.findActiveAttemptsByUserAndQuiz(user.getId(), quizId);
        if (activeAttempts.isEmpty()) {
            return false; // No active attempt found
        }

        // End the active attempt
        QuizAttempt activeAttempt = activeAttempts.get(0);
        activeAttempt.setStatus(AttemptStatus.ABANDONED);
        activeAttempt.setCompletedAt(LocalDateTime.now());
        attemptRepository.save(activeAttempt);

        return true; // Successfully ended the active attempt
    }

    @Transactional
    public QuizAttemptDTO endActiveAttemptAndStartNew(Long quizId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        // Find active attempts for the user and quiz
        List<QuizAttempt> activeAttempts = attemptRepository.findActiveAttemptsByUserAndQuiz(user.getId(), quizId);
        if (!activeAttempts.isEmpty()) {
            // End the active attempt
            QuizAttempt activeAttempt = activeAttempts.get(0);
            activeAttempt.setStatus(AttemptStatus.ABANDONED);
            activeAttempt.setCompletedAt(LocalDateTime.now());
            attemptRepository.save(activeAttempt);
        }

        // Start a new attempt
        QuizAttempt newAttempt = QuizAttempt.builder()
                .user(user)
                .quiz(quiz)
                .startedAt(LocalDateTime.now())
                .status(AttemptStatus.IN_PROGRESS)
                .build();

        QuizAttempt savedAttempt = attemptRepository.save(newAttempt);
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

        Set<Long> quizQuestionIds = attempt.getQuiz().getQuestions().stream()
                .map(Question::getId)
                .collect(Collectors.toSet());

        for (AnswerSubmissionDTO answer : submission.getAnswers()) {
            if (!quizQuestionIds.contains(answer.getQuestionId())) {
                throw new BadRequestException("Invalid question ID in submission: " + answer.getQuestionId());
            }
        }

        int score = 0;
        List<QuestionResultDTO> questionResults = new ArrayList<>();
        List<UserAnswer> userAnswers = new ArrayList<>();

        for (AnswerSubmissionDTO answer : submission.getAnswers()) {
            Question question = attempt.getQuiz().getQuestions().stream()
                    .filter(q -> q.getId().equals(answer.getQuestionId()))
                    .findFirst()
                    .orElseThrow(() -> new BadRequestException("Invalid question ID: " + answer.getQuestionId()));

            Set<Long> correctOptionIds = question.getOptions().stream()
                    .filter(Option::isCorrect)
                    .map(Option::getId)
                    .collect(Collectors.toSet());

            Set<Long> selectedOptionIds = new HashSet<>(answer.getSelectedOptionIds());

            boolean isCorrect = correctOptionIds.equals(selectedOptionIds);
            if (isCorrect) {
                score++;
            }

            // Save UserAnswer entity
            UserAnswer userAnswer = UserAnswer.builder()
                    .quizAttempt(attempt)
                    .question(question)
                    .selectedOptionIds(new ArrayList<>(selectedOptionIds))
                    .isCorrect(isCorrect)
                    .build();
            userAnswers.add(userAnswer);

            questionResults.add(QuestionResultDTO.builder()
                    .questionId(question.getId())
                    .questionText(question.getText())
                    .correct(isCorrect)
                    .pointsAwarded(isCorrect ? 1 : 0)
                    .correctOptionIds(new ArrayList<>(correctOptionIds))
                    .selectedOptionIds(new ArrayList<>(selectedOptionIds))
                    .build());
        }

        // Save all user answers
        userAnswerRepository.saveAll(userAnswers);
        attempt.getUserAnswers().clear();
        attempt.getUserAnswers().addAll(userAnswers);

        long timeTaken = Duration.between(attempt.getStartedAt(), LocalDateTime.now()).getSeconds();
        attempt.setTimeTakenSeconds((int) timeTaken);
        attempt.setScore(score);
        attempt.setCompletedAt(LocalDateTime.now());
        attempt.setStatus(AttemptStatus.COMPLETED);
        attemptRepository.save(attempt);

        double percentage = Math.round(((double) score / attempt.getQuiz().getQuestions().size() * 100) * 100.0) / 100.0;

        return QuizResultDTO.builder()
                .attemptId(attemptId)
                .quizId(attempt.getQuiz().getId())
                .quizTitle(attempt.getQuiz().getTitle())
                .score(score)
                .maxPossibleScore(attempt.getQuiz().getQuestions().size())
                .percentage(percentage)
                .timeTakenSeconds((int) timeTaken)
                .completedAt(attempt.getCompletedAt())
                .questionResults(questionResults)
                .build();
    }

    @Transactional(readOnly = true)
    public List<QuizAttemptDTO> getUserAttempts() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return attemptRepository.findByUsername(username).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DetailedQuizAttemptDTO getUserAttemptById(Long attemptId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        QuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));

        // Ensure the attempt belongs to the logged-in user or the user is an admin
        if (!attempt.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new BadRequestException("You are not authorized to view this attempt.");
        }

        // Map to DetailedQuizAttemptDTO
        return mapToDetailedDTO(attempt);
    }

    //delete attempts
    
    @Transactional
    public void deleteQuizAttempt(Long attemptId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    
        QuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));
    
        // Ensure the attempt belongs to the logged-in user
        if (!attempt.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You are not authorized to delete this attempt.");
        }
    
        attemptRepository.delete(attempt);
    }
    @Transactional
    public void deleteAllQuizAttempts() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    
        List<QuizAttempt> attempts = attemptRepository.findByUserId(user.getId());
        attemptRepository.deleteAll(attempts);
    }
    @Transactional
    public void deleteMultipleQuizAttempts(List<Long> attemptIds) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    
        List<QuizAttempt> attempts = attemptRepository.findAllById(attemptIds).stream()
                .filter(attempt -> attempt.getUser().getId().equals(user.getId()))
                .collect(Collectors.toList());
    
        if (attempts.isEmpty()) {
            throw new BadRequestException("No valid attempts found to delete.");
        }
    
        attemptRepository.deleteAll(attempts);
    }

    private QuizAttemptDTO mapToDTO(QuizAttempt attempt) {
        return QuizAttemptDTO.builder()
                .id(attempt.getId())
                .quizId(attempt.getQuiz().getId())
                .userId(attempt.getUser().getId())
                .startedAt(attempt.getStartedAt())
                .completedAt(attempt.getCompletedAt())
                .score(attempt.getScore())
                .timeTakenSeconds(attempt.getTimeTakenSeconds())
                .status(attempt.getStatus().name())
                .build();
    }

    private DetailedQuizAttemptDTO mapToDetailedDTO(QuizAttempt attempt) {
        List<QuestionResultDTO> questionResults = attempt.getUserAnswers().stream()
                .map(userAnswer -> {
                    Question question = userAnswer.getQuestion();
                    Set<Long> correctOptionIds = question.getOptions().stream()
                            .filter(Option::isCorrect)
                            .map(Option::getId)
                            .collect(Collectors.toSet());

                    List<OptionDTO> options = question.getOptions().stream()
                            .map(option -> OptionDTO.builder()
                            .id(option.getId())
                            .text(option.getOptionText())
                            .isCorrect(option.isCorrect())
                            .build())
                            .collect(Collectors.toList());

                    return QuestionResultDTO.builder()
                            .questionId(question.getId())
                            .questionText(question.getText())
                            .correct(userAnswer.isCorrect())
                            .pointsAwarded(userAnswer.isCorrect() ? 1 : 0)
                            .correctOptionIds(new ArrayList<>(correctOptionIds))
                            .selectedOptionIds(userAnswer.getSelectedOptionIds())
                            .options(options)
                            .explanation(question.getExplanation())
                            .build();
                })
                .collect(Collectors.toList());
        double percentage = Math.round(((double) attempt.getScore() / attempt.getQuiz().getQuestions().size() * 100) * 100.0) / 100.0;

        return DetailedQuizAttemptDTO.builder()
                .attemptId(attempt.getId())
                .quizId(attempt.getQuiz().getId())
                .quizTitle(attempt.getQuiz().getTitle())
                .score(attempt.getScore())
                .maxPossibleScore(attempt.getQuiz().getQuestions().size())
                .percentage(percentage)
                .startedAt(attempt.getStartedAt())
                .completedAt(attempt.getCompletedAt())
                .timeTakenSeconds(attempt.getTimeTakenSeconds())
                .status(attempt.getStatus().name())
                .questionResults(questionResults)
                .build();
    }

    private QuizDTO mapToQuizDTO(Quiz quiz) {
        return QuizDTO.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .timeLimitMinutes(quiz.getTimeLimitMinutes())
                .questions(quiz.getQuestions().stream().map(this::mapToQuestionDTO).toList())
                .build();
    }

    private QuestionDTO mapToQuestionDTO(Question question) {
        return QuestionDTO.builder()
                .id(question.getId())
                .text(question.getText())
                .questionType(question.getQuestionType())
                .options(question.getOptions().stream().map(this::mapToOptionDTO).toList())
                .correctOptionIds(question.getOptions().stream()
                        .filter(Option::isCorrect)
                        .map(Option::getId)
                        .collect(Collectors.toList()))
                .build();
    }

    private OptionDTO mapToOptionDTO(Option option) {
        return OptionDTO.builder()
                .id(option.getId())
                .text(option.getOptionText())
                .isCorrect(option.isCorrect())
                .build();
    }
}
