package com.quizapp.backend.controller;

import com.quizapp.backend.dto.QuizDTO;
import com.quizapp.backend.service.QuizService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(QuizController.class)
class QuizControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private QuizService quizService;

    @Test
    void shouldReturnAllQuizzes() throws Exception {
        // Mock data
        QuizDTO quiz1 = QuizDTO.builder().id(1L).title("Java Basics").description("Test your Java knowledge").build();
        QuizDTO quiz2 = QuizDTO.builder().id(2L).title("Spring Boot").description("Learn Spring Boot").build();

        Mockito.when(quizService.getAllQuizzes()).thenReturn(Arrays.asList(quiz1, quiz2));

        // Perform GET request
        mockMvc.perform(get("/api/quizzes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].title").value("Java Basics"))
                .andExpect(jsonPath("$[1].title").value("Spring Boot"));
    }
}
