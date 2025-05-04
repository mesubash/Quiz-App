package com.quizapp.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import java.time.LocalDateTime;
import java.util.Map;

@ControllerAdvice
public class CustomExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "timestamp", LocalDateTime.now(),
                "message", ex.getMessage(),
                "details", request.getDescription(false),
                "errorCode", "NOT_FOUND"
        ));
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<?> handleBadRequestException(BadRequestException ex, WebRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "timestamp", LocalDateTime.now(),
                "message", ex.getMessage(),
                "details", request.getDescription(false),
                "errorCode", "BAD_REQUEST"
        ));
    }

    @ExceptionHandler(InvalidQuizAttemptException.class)
    public ResponseEntity<?> handleInvalidQuizAttemptException(InvalidQuizAttemptException ex, WebRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "timestamp", LocalDateTime.now(),
                "message", ex.getMessage(),
                "details", request.getDescription(false),
                "errorCode", "INVALID_QUIZ_ATTEMPT"
        ));
    }

    @ExceptionHandler(TooManyRequestsException.class)
    public ResponseEntity<?> handleTooManyRequestsException(TooManyRequestsException ex, WebRequest request) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(Map.of(
                "timestamp", LocalDateTime.now(),
                "message", ex.getMessage(),
                "details", request.getDescription(false),
                "errorCode", "TOO_MANY_REQUESTS"
        ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGenericException(Exception ex, WebRequest request) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "timestamp", LocalDateTime.now(),
                "message", "An unexpected error occurred",
                "details", request.getDescription(false),
                "errorCode", "INTERNAL_SERVER_ERROR"
        ));
    }
}
