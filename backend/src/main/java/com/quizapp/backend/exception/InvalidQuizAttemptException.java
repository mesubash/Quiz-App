package com.quizapp.backend.exception;

public class InvalidQuizAttemptException extends RuntimeException {
    public InvalidQuizAttemptException(String message) {
        super(message);
    }
}