package com.quizapp.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.List;
import com.quizapp.backend.model.enums.AttemptStatus;
import java.util.ArrayList;

@Entity
@Table(name = "quiz_attempts")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @CreationTimestamp
    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    private Integer score = 0;
    private Integer timeTakenSeconds = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttemptStatus status = AttemptStatus.IN_PROGRESS;

    @OneToMany(mappedBy = "quizAttempt", cascade = CascadeType.ALL, orphanRemoval = true)
    private final List<UserAnswer> userAnswers = new ArrayList<>();

    @PrePersist
    private void initializeDefaults() {
        if (this.status == null) {
            this.status = AttemptStatus.IN_PROGRESS;
        }
        if (this.score == null) {
            this.score = 0;
        }
    }

}
