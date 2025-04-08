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
import java.util.ArrayList;
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

    @Transactional
    public QuizAttemptDTO startAttempt(Long quizId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        List<QuizAttempt> activeAttempts = attemptRepository.findActiveAttemptsByUserAndQuiz(user.getId(), quizId);

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

            questionResults.add(QuestionResultDTO.builder()
                    .questionId(question.getId())
                    .questionText(question.getText())
                    .correct(isCorrect)
                    .pointsAwarded(isCorrect ? 1 : 0)
                    .correctOptionIds(new ArrayList<>(correctOptionIds))
                    .selectedOptionIds(new ArrayList<>(selectedOptionIds))
                    .build());
        }

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
                .timeTakenSeconds((int) timeTaken) // Ensure this is set
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

    private QuizAttemptDTO mapToDTO(QuizAttempt attempt) {
        return QuizAttemptDTO.builder()
                .id(attempt.getId())
                .quizId(attempt.getQuiz().getId())
                .userId(attempt.getUser().getId())
                .startedAt(attempt.getStartedAt())
                .completedAt(attempt.getCompletedAt())
                .score(attempt.getScore())
                .status(attempt.getStatus().name())
                .build();
    }
}