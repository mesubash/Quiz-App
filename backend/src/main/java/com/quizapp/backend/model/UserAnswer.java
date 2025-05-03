package com.quizapp.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "option_id", nullable = false)
    // private Option option;
    @ElementCollection
    @CollectionTable(name = "user_answer_options", joinColumns = @JoinColumn(name = "user_answer_id"))
    @Column(name = "option_id")
    private List<Long> selectedOptionIds = new ArrayList<>();
    private boolean isCorrect = false;

    @CreationTimestamp
    private LocalDateTime answeredAt;

}
