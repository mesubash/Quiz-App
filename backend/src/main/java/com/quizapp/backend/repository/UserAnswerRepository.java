package com.quizapp.backend.repository;

import com.quizapp.backend.model.UserAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserAnswerRepository extends JpaRepository<UserAnswer, Long> {
    List<UserAnswer> findByQuizAttempt_Id(Long attemptId);
    long countByQuizAttempt_IdAndIsCorrect(Long attemptId, boolean isCorrect);

}