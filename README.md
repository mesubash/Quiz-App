# Online Quiz Application - Backend System

![Java](https://img.shields.io/badge/Java-21-blue)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4.4-green)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)
![Redis](https://img.shields.io/badge/Redis-7.0-red)
![JWT](https://img.shields.io/badge/JWT-Auth-yellow)

## Table of Contents

- Project Overview
- Features
- Technology Stack
- API Documentation
- Setup & Installation
- Database Schema
- Security Implementation
- Deployment
- Contributing
- License

---

## Project Overview

A robust backend system for an online quiz platform that enables:

- User authentication and authorization
- Quiz creation and management
- Question bank management
- Real-time quiz attempts
- Performance analytics and leaderboards

This backend is built using **Spring Boot** and follows a modular architecture to ensure scalability and maintainability.

---

## Features

### Core Modules

- **User Management**
  - Registration with email validation
  - Role-based access control (Admin/User)
  - Password hashing with BCrypt

- **Quiz Engine**
  - Multiple question types (MCQ, True/False, etc.)
  - Time-limited quizzes
  - Automatic scoring and result calculation

- **Reporting**
  - User performance analytics
  - Quiz statistics
  - Leaderboards (global and quiz-specific)

### Advanced Features

- JWT authentication with Redis token blacklisting
- Comprehensive input validation using `jakarta.validation`
- Audit logging for admin actions
- Rate limiting for API endpoints

---

## Technology Stack

### Backend

- **Framework**: Spring Boot 3.4.4
- **Language**: Java 21
- **Build Tool**: Maven

### Database

- **Primary**: MySQL 8.0
- **Cache**: Redis 7.0

### Security

- **Authentication**: JWT with Redis token blacklisting
- **Password Encoding**: BCrypt (12 rounds)
- **CORS**: Configurable origins

---

## API Documentation

### Base URL

`http://localhost:8080/api`

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

### Quiz Management

```http
GET    /api/quizzes
POST   /api/quizzes
GET    /api/quizzes/{id}
PUT    /api/quizzes/{id}
DELETE /api/quizzes/{id}
```

### Question Management

```http
GET    /api/quizzes/{quizId}/questions
POST   /api/quizzes/{quizId}/questions
PUT    /api/quizzes/{quizId}/questions/{questionId}
DELETE /api/quizzes/{quizId}/questions/{questionId}
```

### Quiz Attempts

```http
POST   /api/attempts/start?quizId={quizId}
POST   /api/attempts/{attemptId}/submit
GET    /api/attempts/user
```

### Leaderboard

```http
GET    /api/leaderboard
GET    /api/leaderboard/quiz/{quizId}
```

---

## Setup & Installation

### Prerequisites

- Java 21 JDK
- MySQL 8.0+
- Redis 7.0+
- Maven 3.8+

### Configuration

1. Clone the repository:

   ```bash
   git clone git@github.com:mesubash/Quiz-App.git
   cd backend
   ```

2. Configure the database in application.properties:

   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/quiz_app
   spring.datasource.username=quiz_app_user
   spring.datasource.password=strong_password
   spring.jpa.hibernate.ddl-auto=update
   ```

3. Configure Redis:

   ```properties
   spring.redis.host=localhost
   spring.redis.port=6379
   ```

4. JWT Configuration:

   ```properties
   app.jwt-secret=your-256-bit-secret
   app.jwt-expiration-milliseconds=86400000 # 24 hours
   ```

### Running the Application

```bash
mvn spring-boot:run
```

---

## Database Schema

The database schema is defined in schema.sql. Below are the key tables:

- **users**: Stores user accounts and credentials.
- **quizzes**: Stores quiz metadata.
- **questions**: Stores questions for each quiz.
- **options**: Stores answer options for questions.
- **quiz_attempts**: Tracks user attempts for quizzes.
- **user_answers**: Tracks individual answers submitted by users.

---

## Security Implementation

### Authentication Flow

1. User logs in with credentials.
2. Server validates and returns a JWT token.
3. Client includes the token in the `Authorization` header for subsequent requests.
4. Server validates the token for each request.

### Security Features

- Password hashing with BCrypt
- JWT signature verification
- Token blacklisting on logout (using Redis)
- Role-based endpoint protection
- CSRF protection for web endpoints
- Rate limiting (100 requests/minute)

---

## Deployment

### Production Setup

1. Build the application:

   ```bash
   mvn clean package -DskipTests
   ```

2. Run with the production profile:

   ```bash
   java -jar target/quiz-app-backend.jar --spring.profiles.active=prod
   ```

### Docker Deployment

```dockerfile
FROM openjdk:17-jdk-slim
COPY target/quiz-app-backend.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

---

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---