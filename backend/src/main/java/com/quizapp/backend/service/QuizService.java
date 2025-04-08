package com.quizapp.backend.service;

import com.quizapp.backend.dto.QuizDTO;
import com.quizapp.backend.dto.QuestionDTO;
import com.quizapp.backend.dto.OptionDTO;
import com.quizapp.backend.exception.ResourceNotFoundException;
import com.quizapp.backend.model.Question;
import com.quizapp.backend.model.Option;
import com.quizapp.backend.model.Quiz;
import com.quizapp.backend.model.User;
import com.quizapp.backend.repository.QuizRepository;
import com.quizapp.backend.repository.UserRepository;

import lombok.*;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final UserRepository userRepository;

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

        Quiz savedQuiz = quizRepository.save(quiz);
        return mapToDTO(savedQuiz);
    }

    private Question mapToQuestionEntity(QuestionDTO questionDTO, Quiz quiz) {
        Question question = new Question();
        question.setText(questionDTO.getText());
        question.setQuestionType(questionDTO.getQuestionType());
        question.setDifficulty(questionDTO.getDifficulty());
        question.setCorrectAnswer(questionDTO.getCorrectAnswer());
        question.setPoints(questionDTO.getPoints());
        question.setExplanation(questionDTO.getExplanation());
        question.setQuiz(quiz); // Set the quiz reference

        // Map options from DTO to entity
        if (questionDTO.getOptions() != null) {
            List<Option> options = questionDTO.getOptions().stream()
                    .map(optionDTO -> mapToOptionEntity(optionDTO, question))
                    .collect(Collectors.toList());
            question.setOptions(options);
        }

        return question;
    }

    private Option mapToOptionEntity(OptionDTO optionDTO, Question question) {
        return Option.builder()
                .optionText(optionDTO.getText())
                .isCorrect(optionDTO.getIsCorrect())
                .question(question) // Set the question reference
                .build();
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

    @Transactional
    public QuizDTO updateQuiz(Long id, QuizDTO quizDTO) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        quiz.setTitle(quizDTO.getTitle());
        quiz.setDescription(quizDTO.getDescription());
        quiz.setTimeLimitMinutes(quizDTO.getTimeLimitMinutes());
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
                .questions(quiz.getQuestions() != null ? quiz.getQuestions().stream()
                        .map(this::mapToQuestionDTO)
                        .collect(Collectors.toList()) : null) // Map questions
                .build();
    }

    private QuestionDTO mapToQuestionDTO(Question question) {
        return QuestionDTO.builder()
                .id(question.getId())
                .text(question.getText())
                .questionType(question.getQuestionType())
                .difficulty(question.getDifficulty())
                .correctAnswer(question.getCorrectAnswer())
                .points(question.getPoints())
                .explanation(question.getExplanation())
                .quizId(question.getQuiz().getId())
                .options(question.getOptions() != null ? question.getOptions().stream()
                        .map(this::mapToOptionDTO)
                        .collect(Collectors.toList()) : null) // Map options
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