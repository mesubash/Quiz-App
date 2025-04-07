package com.quizapp.backend.repository;

import com.quizapp.backend.model.Option;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OptionRepository extends JpaRepository<Option, Long> {
    List<Option> findByQuestionId(Long questionId);
    List<Option> findByQuestionIdAndIsCorrect(Long questionId, boolean isCorrect);
}