package com.quizapp.backend.service;

import com.quizapp.backend.dto.QuestionDTO;
import com.quizapp.backend.model.Question;
import com.quizapp.backend.repository.QuestionRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
class QuestionServiceTest {

    @Autowired
    private QuestionService questionService;

    @MockBean
    private QuestionRepository questionRepository;

    @Test
    void shouldAddQuestion() {
        // Mock data
        Question question = new Question();
        question.setId(1L);
        question.setText("What is Java?");
        question.setPoints(5);

        Mockito.when(questionRepository.save(Mockito.any(Question.class))).thenReturn(question);

        // Call the service
        QuestionDTO questionDTO = QuestionDTO.builder()
                .text("What is Java?")
                .points(5)
                .build();

        QuestionDTO createdQuestion = questionService.addQuestion(1L, questionDTO);

        // Assertions
        assertEquals("What is Java?", createdQuestion.getText());
        assertEquals(5, createdQuestion.getPoints());
    }
}