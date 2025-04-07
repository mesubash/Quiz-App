package com.quizapp.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_answers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private QuizAttempt quizAttempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_id", nullable = false)
    private Option option;

    private boolean isCorrect = false;

    @CreationTimestamp
    private LocalDateTime answeredAt;

    public void setSelectedAnswer(Object selectedAnswer) {
        if (selectedAnswer instanceof Option) {
            this.option = (Option) selectedAnswer;
        } else if (selectedAnswer instanceof String) {
            this.option = new Option();
            this.option.setOptionText((String) selectedAnswer);
        } else {
            throw new IllegalArgumentException("Invalid answer type: " + selectedAnswer.getClass().getName());
        }
    }
}