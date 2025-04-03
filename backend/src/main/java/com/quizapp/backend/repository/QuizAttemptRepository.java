package com.quizapp.backend.repository;


import com.quizapp.backend.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByUser_Id(Long userId);
    List<QuizAttempt> findByQuiz_Id(Long quizId);
    List<QuizAttempt> findByUser_IdAndQuiz_Id(Long userId, Long quizId);
    List<QuizAttempt> findByUser_IdAndStatus(Long userId, QuizAttempt.AttemptStatus status);
}