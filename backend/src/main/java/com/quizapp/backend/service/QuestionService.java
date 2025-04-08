package com.quizapp.backend.service;

import com.quizapp.backend.dto.OptionDTO;
import com.quizapp.backend.dto.QuestionDTO;
import com.quizapp.backend.exception.ResourceNotFoundException;
import com.quizapp.backend.model.Option;
import com.quizapp.backend.model.Question;
import com.quizapp.backend.model.Quiz;
import com.quizapp.backend.repository.QuestionRepository;
import com.quizapp.backend.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final QuizRepository quizRepository;

    @Transactional(readOnly = true)
    public List<QuestionDTO> getQuestionsByQuizId(Long quizId) {
        return questionRepository.findByQuizId(quizId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
public QuestionDTO updateQuestion(Long questionId, QuestionDTO questionDTO) {
    // Fetch the existing question
    Question question = questionRepository.findById(questionId)
            .orElseThrow(() -> new ResourceNotFoundException("Question not found"));

    // Update basic fields
    question.setText(questionDTO.getText());
    question.setQuestionType(questionDTO.getQuestionType());
    question.setDifficulty(questionDTO.getDifficulty());
    question.setExplanation(questionDTO.getExplanation());
    question.setAttempts(questionDTO.getAttempts() != null ? questionDTO.getAttempts() : 0); // Default to 0
    question.setCorrectSelections(questionDTO.getCorrectSelections() != null ? questionDTO.getCorrectSelections() : 0); // Default to 0

    // Update options
    if (questionDTO.getOptions() != null) {
        // Clear existing options
        question.getOptions().clear();

        // Add updated options
        List<Option> updatedOptions = questionDTO.getOptions().stream()
                .map(optionDTO -> Option.builder()
                        .id(optionDTO.getId()) // Use existing ID if present
                        .optionText(optionDTO.getText())
                        .isCorrect(optionDTO.getIsCorrect())
                        .question(question) // Link the option to the question
                        .build())
                .toList();

        question.getOptions().addAll(updatedOptions);
    }

    // Save the updated question
    return mapToDTO(questionRepository.save(question));
}
    @Transactional
    public void deleteQuestion(Long questionId) {
        questionRepository.deleteById(questionId);
    }

    @Transactional
    public QuestionDTO addQuestion(Long quizId, QuestionDTO questionDTO) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        Question question = mapToEntity(questionDTO, quiz);
        Question savedQuestion = questionRepository.save(question);
        return mapToDTO(savedQuestion);
    }


    

    private QuestionDTO mapToDTO(Question question) {
        return QuestionDTO.builder()
                .id(question.getId())
                .text(question.getText())
                .questionType(question.getQuestionType())
                .difficulty(question.getDifficulty())
                .explanation(question.getExplanation())
                .attempts(question.getAttempts())
                .correctSelections(question.getCorrectSelections())
                .quizId(question.getQuiz().getId())
                .selectedOptions(null) // This will be populated during quiz submission
                .correctOptions(question.getOptions() != null ? question.getOptions().stream()
                .filter(Option::isCorrect)
                .map(option -> option.getId().intValue()) // Convert Long to Integer
                .collect(Collectors.toList()) : List.of()) // Handle null options
                .options(question.getOptions() != null ? question.getOptions().stream()
                        .map(option -> OptionDTO.builder()
                                .id(option.getId())
                                .text(option.getOptionText())
                                .isCorrect(option.isCorrect())
                                .questionId(option.getQuestion().getId())
                                .build())
                        .toList() : List.of()) // Handle null options
                .build();
    }

    private Question mapToEntity(QuestionDTO questionDTO, Quiz quiz) {
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
                            .isCorrect(optionDTO.getIsCorrect()) // Map isCorrect flag
                            .question(question)
                            .build())
                    .toList();
            question.setOptions(options);
        }
    
        return question;
    }
    
}