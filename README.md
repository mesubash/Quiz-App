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
  - Secret Management
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
  ```properties

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

2. Configure the database in `application.properties`:

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
   app.jwt-secret=${JWT_SECRET}
   app.jwt-expiration-milliseconds=${JWT_EXPIRATION}
   app.jwt-refresh-expiration-milliseconds=${JWT_REFRESH_EXPIRATION}
   ```

---

### Secret Management

#### Why Secrets Are Important

Secrets like `JWT_SECRET` are critical for securing your application. They are used for signing JWT tokens and ensuring the integrity of sensitive operations. Exposing these secrets can lead to security vulnerabilities.

#### 1. Generating a Secure Secret

- **On Windows**:
  1. Open **PowerShell**.
  2. Run the following command to generate a 32-byte Base64-encoded secret:

     ```powershell
     [convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256}))
     ```

- **On Linux/Mac**:
  1. Open your terminal.
  2. Run the following command to generate a 32-byte Base64-encoded secret:

     ```bash
     openssl rand -base64 32
     ```

#### 2. Storing the Secret

- **Using Environment Variables**:
  - **Windows**:

    ```cmd
    setx JWT_SECRET dGhpc19pc19hX3ZhbGlkX2Jhc2U2NF9zZWNyZXQ=
    setx JWT_EXPIRATION 3600000
    setx JWT_REFRESH_EXPIRATION 604800000
    ```

  - **Linux/Mac**:

    ```bash
    export JWT_SECRET=your_base64_secret
    ```

- **Using a `.env` File**:
  1. Create a `.env` file in the root of your project.
  2. Add the following content:

     ```env
     JWT_SECRET=your_base64_secret
     ```

  3. Add `.env` to your .gitignore file to prevent it from being committed to version control.

#### 3. Configuring the Application

- Update `application.properties`:

  ```properties
  app.jwt-secret=${JWT_SECRET}

  ```

---

### Running the Application

```bash
mvn spring-boot:run
```

---

## Database Schema

The database schema is defined in `schema.sql`. Below are the key tables:

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
