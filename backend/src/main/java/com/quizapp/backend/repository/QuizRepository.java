package com.quizapp.backend.repository;


import com.quizapp.backend.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByCreatedBy_Id(Long userId);
    List<Quiz> findByIsPublished(boolean isPublished);
}