package com.quizapp.backend.repository;

import com.quizapp.backend.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByCreatedBy_Id(Long userId);
    List<Quiz> findByIsPublished(boolean isPublished);
    
    @Query("SELECT q FROM Quiz q WHERE q.isPublished = true OR q.createdBy.id = :userId")
    List<Quiz> findAvailableQuizzes(Long userId);
}