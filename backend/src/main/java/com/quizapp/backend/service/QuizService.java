package com.quizapp.backend.service;

import com.quizapp.backend.dto.QuizDTO;
import com.quizapp.backend.dto.QuizResultDTO;
import com.quizapp.backend.dto.QuestionDTO;
import com.quizapp.backend.dto.QuestionResultDTO;
import com.quizapp.backend.dto.OptionDTO;
import com.quizapp.backend.exception.ResourceNotFoundException;
import com.quizapp.backend.model.Question;
import com.quizapp.backend.model.Option;
import com.quizapp.backend.model.Quiz;
import com.quizapp.backend.model.QuizAttempt;
import com.quizapp.backend.model.User;
import com.quizapp.backend.model.enums.Difficulty;
import com.quizapp.backend.repository.QuizAttemptRepository;
import com.quizapp.backend.repository.QuizRepository;
import com.quizapp.backend.repository.UserRepository;

import lombok.*;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final UserRepository userRepository;
    private final QuizAttemptRepository quizAttemptRepository;

    @Transactional
    public QuizDTO createQuiz(QuizDTO quizDTO) {
        Quiz quiz = new Quiz();
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        quiz.setCreatedBy(user);
        quiz.setTitle(quizDTO.getTitle());
        quiz.setDescription(quizDTO.getDescription());
        quiz.setTimeLimitMinutes(quizDTO.getTimeLimitMinutes());
        quiz.setPublished(false); // Default to unpublished

        // Map questions from DTO to entity
        List<Question> questions = quizDTO.getQuestions().stream()
                .map(questionDTO -> mapToQuestionEntity(questionDTO, quiz))
                .collect(Collectors.toList());
        quiz.setQuestions(questions);

        // Calculate quiz difficulty
        Difficulty calculatedDifficulty = calculateQuizDifficulty(questions);
        quiz.setDifficulty(calculatedDifficulty);

        Quiz savedQuiz = quizRepository.save(quiz);
        return mapToDTO(savedQuiz);
    }

    private Question mapToQuestionEntity(QuestionDTO questionDTO, Quiz quiz) {
        Question question = Question.builder()
                .text(questionDTO.getText())
                .questionType(questionDTO.getQuestionType())
                .difficulty(questionDTO.getDifficulty())
                .explanation(questionDTO.getExplanation())
                .quiz(quiz)
                .build();

        if (questionDTO.getOptions() != null) {
            List<Option> options = questionDTO.getOptions().stream()
                    .map(optionDTO -> Option.builder()
                    .optionText(optionDTO.getText())
                    .isCorrect(optionDTO.getIsCorrect())
                    .question(question)
                    .build())
                    .toList();
            question.setOptions(options);
        }

        return question;
    }

    @Transactional(readOnly = true)
    public List<QuizDTO> getAllQuizzes() {
        return quizRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuizDTO getQuizById(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        return mapToDTO(quiz);
    }

    public List<QuizResultDTO> getQuizHistoryByQuizId(Long quizId) {
        List<QuizAttempt> attempts = quizAttemptRepository.findByQuizId(quizId);

        return attempts.stream()
                .map(attempt -> QuizResultDTO.builder()
                .attemptId(attempt.getId())
                .quizId(attempt.getQuiz().getId())
                .quizTitle(attempt.getQuiz().getTitle())
                .score(attempt.getScore())
                .maxPossibleScore(attempt.getQuiz().getQuestions().size()) // Use the number of questions as max score
                .percentage((attempt.getScore() * 100.0) / attempt.getQuiz().getQuestions().size())
                .completedAt(attempt.getCompletedAt())
                .timeTakenSeconds(attempt.getTimeTakenSeconds())
                .questionResults(attempt.getUserAnswers().stream()
                        .map(answer -> QuestionResultDTO.builder()
                        .questionId(answer.getQuestion().getId())
                        .questionText(answer.getQuestion().getText())
                        .selectedOptionIds(answer.getSelectedOptionIds())
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

    @Transactional
    public QuizDTO updateQuiz(Long id, QuizDTO quizDTO) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        quiz.setTitle(quizDTO.getTitle());
        quiz.setDescription(quizDTO.getDescription());
        quiz.setTimeLimitMinutes(quizDTO.getTimeLimitMinutes());

        // Recalculate difficulty based on updated questions
        if (quiz.getQuestions() != null && !quiz.getQuestions().isEmpty()) {
            Difficulty calculatedDifficulty = calculateQuizDifficulty(quiz.getQuestions());
            quiz.setDifficulty(calculatedDifficulty);
        } else {
            quiz.setDifficulty(Difficulty.UNASSIGNED);
        }

        return mapToDTO(quizRepository.save(quiz));
    }

    @Transactional
    public void deleteQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz not found with id: " + id));
        quizRepository.delete(quiz);
    }

    private QuizDTO mapToDTO(Quiz quiz) {
        return QuizDTO.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .timeLimitMinutes(quiz.getTimeLimitMinutes())
                .isPublished(quiz.isPublished())
                .createdById(quiz.getCreatedBy() != null ? quiz.getCreatedBy().getId() : null)
                .difficulty(quiz.getDifficulty()) // Include difficulty
                .questions(quiz.getQuestions() != null ? quiz.getQuestions().stream()
                        .map(this::mapToQuestionDTO)
                        .collect(Collectors.toList()) : null) // Map questions
                .build();
    }

    private QuestionDTO mapToQuestionDTO(Question question) {
        if (question.getQuestionType() == null) {
            throw new IllegalArgumentException("Question type cannot be null");
        }
        return QuestionDTO.builder()
                .id(question.getId())
                .text(question.getText())
                .questionType(question.getQuestionType())
                .difficulty(question.getDifficulty())
                .explanation(question.getExplanation())
                .attempts(question.getAttempts())
                .correctSelections(question.getCorrectSelections())
                .quizId(question.getQuiz().getId())
                .correctOptions(question.getOptions() != null ? question.getOptions().stream()
                        .filter(Option::isCorrect)
                        .map(option -> option.getId().intValue()) // Convert Long to Integer
                        .collect(Collectors.toList()) : List.of()) // Handle null options
                .options(question.getOptions() != null ? question.getOptions().stream()
                        .map(option -> OptionDTO.builder()
                        .id(option.getId())
                        .text(option.getOptionText())
                        .isCorrect(option.isCorrect())
                        .build())
                        .toList() : List.of()) // Handle null options
                .build();
    }

    private Difficulty calculateQuizDifficulty(List<Question> questions) {
        if (questions.isEmpty()) {
            return Difficulty.UNASSIGNED;
        }

        // Assign numerical values to difficulty levels
        final int EASY_SCORE = 1;
        final int MEDIUM_SCORE = 2;
        final int HARD_SCORE = 3;

        // Calculate the average difficulty score
        double averageDifficulty = questions.stream()
                .mapToInt(q -> switch (q.getDifficulty()) {
            case EASY ->
                EASY_SCORE;
            case MEDIUM ->
                MEDIUM_SCORE;
            case HARD ->
                HARD_SCORE;
            default ->
                0;
        })
                .average()
                .orElse(0); // Default to 0 if no questions exist

        // Determine difficulty based on average score
        if (averageDifficulty >= 2.5) {
            return Difficulty.HARD;
        } else if (averageDifficulty >= 1.8) {
            return Difficulty.MEDIUM;
        } else {
            return Difficulty.EASY;
        }
    }

}
