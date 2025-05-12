# QuizMaster - Interactive Learning Platform

![React](https://img.shields.io/badge/React-18.2.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-13.4.0-black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.0-teal)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4.4-green)
![JPA](https://img.shields.io/badge/Spring_Data_JPA-3.4.4-yellowgreen)
![Security](https://img.shields.io/badge/Spring_Security-3.4.4-red)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Setup & Installation](#setup--installation)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Project Overview

QuizMaster is a comprehensive online quiz platform that enables users to create, attempt, and analyze quizzes across various topics. The application features a robust user management system with role-based access control, interactive quiz experiences, and detailed analytics dashboards for performance tracking.

The platform is designed with a modern tech stack including Next.js for the frontend and Spring Boot for the backend, ensuring scalability, security, and an excellent user experience.

## Features

### User Management

- **Authentication & Authorization**
  - Secure login/registration with JWT token-based authentication
  - Role-based access control (Admin/User)
  - Account management with profile customization
  - Redis-based token management

### Quiz Engine

- **Quiz Creation & Management**
  - Multiple question types (MCQ, True/False, etc.)
  - Category and difficulty tagging
  - Time-limited quizzes
  - Option to publish/unpublish quizzes

- **Quiz Attempt**
  - Real-time quiz taking experience
  - Automatic scoring and result calculation
  - Resume capability for interrupted attempts
  - Detailed feedback on completion

### Analytics & Reporting

- **User Analytics**
  - Personal performance tracking
  - Progress over time visualizations
  - Strengths and weaknesses identification
  - Quiz attempt history

- **Admin Analytics**
  - Platform-wide statistics
  - Quiz popularity and completion rates
  - User engagement metrics
  - Performance data exports

### UI/UX

- **Responsive Design**
  - Mobile-friendly interface with Tailwind CSS
  - Light/dark mode support
  - Accessible components
  - Interactive charts and visualizations

## Architecture

QuizMaster follows a modern microservices architecture with separate frontend and backend components:

```
Quiz-App/
├── frontend/              # Next.js client application
│   ├── app/               # Next.js app directory
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # State management
│   │   ├── pages/         # Application pages
│   │   ├── services/      # API service functions
│   │   └── ...
├── backend/               # Spring Boot server application
│   ├── src/main/java/     # Java source code
│   │   ├── controller/    # REST API endpoints
│   │   ├── model/         # Domain entities
│   │   ├── repository/    # Data access layer
│   │   ├── service/       # Business logic
│   │   └── ...
│   └── ...
```

## Technology Stack

### Frontend

- **Framework**: Next.js 13.4.0
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.3.0
- **State Management**: React Context API
- **Charts**: Recharts
- **Icons**: Lucide React
- **UI Components**: Custom components with Tailwind

### Backend

- **Framework**: Spring Boot 3.4.4
- **Language**: Java
- **ORM**: Spring Data JPA
- **Security**: Spring Security with JWT
- **Database**: MySQL
- **Caching**: Redis
- **Build Tool**: Maven
- **Documentation**: Swagger/OpenAPI

## Setup & Installation

### Prerequisites

- Node.js 18+
- npm 9+
- JDK 17+
- Maven 3.8+
- MySQL 8.0+
- Redis 6.0+ (optional, for enhanced token management)

### Frontend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/mesubash/Quiz-App.git
   cd Quiz-App
   ```

2. Install frontend dependencies:

   ```bash
   cd frontend
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Access the frontend at [`http://localhost:3000`](http://localhost:3000).

### Backend Setup

1. Configure MySQL database:
   - Create a new database named `quiz_app`.
   - Update database credentials in `application.properties`.

2. Build and run the backend:

   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```

3. The API will be available at [`http://localhost:8080`](http://localhost:8080).

## API Documentation

The backend API is documented using OpenAPI/Swagger. Once the backend is running, you can access the API documentation at:

```
http://localhost:8080/swagger-ui/index.html
```

### Key API Endpoints

- **Authentication**
  - `/api/auth/login` - User authentication
  - `/api/auth/register` - User registration

- **User Management**
  - `/api/users` - User operations
  - `/api/admin/users` - Admin user management

- **Quiz Operations**
  - `/api/quizzes` - Quiz CRUD operations
  - `/api/quizzes/{quizId}` - Specific quiz operations
  - `/api/quizzes/{quizId}/questions` - Quiz question management

## Configuration

### Environment Variables

- **Frontend**
  - `.env.local` for local development

- **Backend**
  - `application.properties` for database and server configurations

### Key Configurations

- **Frontend**
  - Tailwind CSS for styling
  - Next.js for routing and server-side rendering

- **Backend**
  - Spring Security for authentication
  - Redis for caching
  - MySQL for data persistence

## Deployment

### Frontend Deployment

1. Build the production-ready frontend:

   ```bash
   npm run build
   ```

2. Deploy the `out` directory to your hosting provider.

### Backend Deployment

1. Package the backend application:

   ```bash
   mvn package
   ```

2. Deploy the generated JAR file to your server or cloud provider.

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
