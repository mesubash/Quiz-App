package com.quizapp.backend.entity;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "options")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Option {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(nullable = false)
    private boolean isCorrect = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;
}