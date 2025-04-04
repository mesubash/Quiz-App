package com.quizapp.backend.repository;

import com.quizapp.backend.model.Option;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OptionRepository extends JpaRepository<Option, Long> {
    List<Option> findByQuestion_Id(Long questionId);
    List<Option> findByQuestion_IdAndIsCorrectTrue(Long questionId);
}