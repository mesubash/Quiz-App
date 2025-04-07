package com.quizapp.backend.service;

import com.quizapp.backend.dto.QuestionDTO;
import com.quizapp.backend.exception.ResourceNotFoundException;
import com.quizapp.backend.model.Question;
import com.quizapp.backend.model.Quiz;
import com.quizapp.backend.model.enums.QuestionType;
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
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        
        question.setText(questionDTO.getText());
        question.setQuestionType(questionDTO.getQuestionType());
        question.setPoints(questionDTO.getPoints());
        
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
        
        Question question = new Question();
        question.setQuiz(quiz);
        question.setText(questionDTO.getText());
        question.setQuestionType(questionDTO.getQuestionType());
        question.setPoints(questionDTO.getPoints());
        
        Question savedQuestion = questionRepository.save(question);
        return mapToDTO(savedQuestion);
    }

    private QuestionDTO mapToDTO(Question question) {
        return QuestionDTO.builder()
                .id(question.getId())
                .text(question.getText())
                .questionType(question.getQuestionType())
                .points(question.getPoints())
                .quizId(question.getQuiz().getId())
                .build();
    }
}