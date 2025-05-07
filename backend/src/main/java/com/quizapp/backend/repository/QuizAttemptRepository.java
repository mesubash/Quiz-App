package com.quizapp.backend.repository;

import com.quizapp.backend.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    List<QuizAttempt> findByUserId(Long userId);

    List<QuizAttempt> findByQuizId(Long quizId);

    @Query("SELECT a FROM QuizAttempt a WHERE a.user.username = :username")
    List<QuizAttempt> findByUsername(String username);

    @Query("SELECT a.user.id, a.user.username, MAX(a.score) as maxScore "
            + "FROM QuizAttempt a WHERE a.quiz.id = :quizId "
            + "GROUP BY a.user.id, a.user.username ORDER BY maxScore DESC")
    List<Object[]> findLeaderboardByQuizId(Long quizId);

    @Query("SELECT a.user.id, a.user.username, SUM(a.score) as totalScore "
            + "FROM QuizAttempt a GROUP BY a.user.id, a.user.username ORDER BY totalScore DESC")
    List<Object[]> findGlobalLeaderboard();

    @Query("SELECT a FROM QuizAttempt a ORDER BY a.score DESC")
    List<QuizAttempt> findTopScores();

    @Query("SELECT a FROM QuizAttempt a WHERE a.quiz.id = :quizId ORDER BY a.score DESC")
    List<QuizAttempt> findTopScoresByQuizId(Long quizId);

    @Query("SELECT a FROM QuizAttempt a WHERE a.user.id = :userId AND a.quiz.id = :quizId AND a.status = 'IN_PROGRESS'")
    List<QuizAttempt> findActiveAttemptsByUserAndQuiz(@Param("userId") Long userId, @Param("quizId") Long quizId);

    @Query("SELECT a FROM QuizAttempt a WHERE a.user.id = :userId AND a.quiz.id = :quizId")
    List<QuizAttempt> findByUserIdAndQuizId(Long userId, Long quizId);

}
