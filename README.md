# QuizMaster - Interactive Learning Platform

![React](https://img.shields.io/badge/React-18.2.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-13.4.0-black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.0-teal)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4.4-green)
![JPA](https://img.shields.io/badge/Spring_Data_JPA-3.4.4-yellowgreen)
![Security](https://img.shields.io/badge/Spring_Security-3.4.4-red)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)

## 🚀 Live Demo

**Frontend URL**: [https://quizapp.subashsdhami.com.np/](https://quizapp.subashsdhami.com.np/)

Test the live application with all the features mentioned below.

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

### Production Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Vercel)      │────│   (Railway)     │────│   (Aiven)       │
│   Next.js       │    │   Spring Boot   │    │   MySQL         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                       ┌─────────────────┐
                       │   Cache         │
                       │   (Aiven)       │
                       │   Redis/Valkey  │
                       └─────────────────┘
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

This section covers deployment instructions for both backend and frontend across multiple cloud platforms.

### 🔧 Pre-deployment Setup

#### Backend Environment Variables
Ensure these environment variables are set in your deployment platform:

```bash
# Database Configuration (Aiven MySQL)
DB_HOST=your-mysql-host.aivencloud.com
DB_PORT=22971
DB_NAME=defaultdb
DB_USERNAME=avnadmin
DB_PASSWORD=your-secure-password

# Redis Configuration (Aiven Valkey/Redis)
REDIS_HOST=your-redis-host.aivencloud.com  
REDIS_PORT=22972
REDIS_USERNAME=default
REDIS_PASSWORD=your-redis-password
REDIS_SSL=true

# JWT Configuration
JWT_SECRET=your-jwt-secret-key

# Spring Profile
SPRING_PROFILES_ACTIVE=prod
```

#### Frontend Environment Variables
Configure these in your frontend deployment platform:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com/api

# App Configuration
NEXT_PUBLIC_APP_NAME=Quiz App
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_FRONTEND_URL=https://your-frontend-url.com
```

---

### 🚀 Backend Deployment Options

#### Option 1: Railway (Recommended)

**Why Railway?** Generous free tier, excellent performance, automatic deployments.

**Steps:**
1. Visit [railway.app](https://railway.app) and sign up
2. Connect your GitHub repository: `mesubash/Quiz-App`
3. **Configuration:**
   - **Root Directory**: `backend`
   - **Build**: Auto-detected (uses Dockerfile)
   - **Port**: 8080 (auto-detected)
4. **Add Environment Variables** in Railway dashboard (see variables above)
5. **Deploy**: Automatic on git push

**Expected URL format:** `https://your-app-name.up.railway.app`

#### Option 2: Render

**Why Render?** Good free tier, easy setup, built-in SSL.

**Steps:**
1. Visit [render.com](https://render.com) and create account
2. **New Web Service** → Connect GitHub: `mesubash/Quiz-App`
3. **Configuration:**
   - **Root Directory**: `backend`
   - **Build Command**: `docker build -t quiz-app .`
   - **Start Command**: Leave empty (uses Dockerfile)
   - **Instance Type**: Starter ($7/month) for better performance
4. **Environment Variables**: Add all variables from above
5. **Deploy**: Automatic

**Expected URL format:** `https://your-app-name.onrender.com`

#### Option 3: Koyeb

**Why Koyeb?** Great free tier, fast deployments, good performance.

**Steps:**
1. Visit [koyeb.com](https://www.koyeb.com) and sign up
2. **Deploy from GitHub** → Select `mesubash/Quiz-App`
3. **Configuration:**
   - **Dockerfile Path**: `backend/Dockerfile`
   - **Build Context**: Repository root
   - **Port**: 8080
4. **Environment Variables**: Add all variables
5. **Deploy**: Automatic

**Expected URL format:** `https://your-app-name.koyeb.app`

#### Option 4: DigitalOcean App Platform

**Why DigitalOcean?** Reliable, good documentation, scalable.

**Steps:**
1. Visit [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform)
2. **Create App** → GitHub: `mesubash/Quiz-App`
3. **Configuration:**
   - **Source Directory**: `backend`
   - **Dockerfile Path**: `Dockerfile`
   - **HTTP Port**: 8080
4. **Environment Variables**: Add all variables
5. **Plan**: Basic ($5/month minimum)

**Expected URL format:** `https://your-app-name.ondigitalocean.app`

---

### 🌐 Frontend Deployment Options

#### Option 1: Vercel (Recommended)

**Why Vercel?** Built for Next.js, automatic deployments, excellent performance.

**Steps:**
1. Visit [vercel.com](https://vercel.com) and sign up
2. **Import Project** → GitHub: `mesubash/Quiz-App`
3. **Configuration:**
   - **Root Directory**: `frontend`
   - **Framework**: Next.js (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
4. **Environment Variables**: Add frontend variables
5. **Deploy**: Automatic on git push

**Expected URL format:** `https://your-app-name.vercel.app`

#### Option 2: Netlify

**Why Netlify?** Great free tier, easy setup, good for static sites.

**Steps:**
1. Visit [netlify.com](https://netlify.com) and sign up
2. **Deploy from Git** → GitHub: `mesubash/Quiz-App`
3. **Configuration:**
   - **Base Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `.next`
4. **Environment Variables**: Add frontend variables
5. **Deploy**: Automatic

**Expected URL format:** `https://your-app-name.netlify.app`

#### Option 3: Railway (Frontend)

**Steps:**
1. Create new project in Railway
2. **Deploy from GitHub** → `mesubash/Quiz-App`
3. **Configuration:**
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build && npm run start`
4. **Environment Variables**: Add frontend variables

---

### 🗄️ Database Setup (Aiven)

#### MySQL Database
1. Visit [aiven.io](https://aiven.io) and create account
2. **Create Service** → MySQL
3. **Configuration:**
   - **Service Name**: `quiz-app-mysql`
   - **Region**: Choose closest to your backend
   - **Plan**: Hobbyist (free tier available)
4. **Get Connection Details:**
   - Host, Port, Username, Password
   - Use these in your backend environment variables

#### Redis/Valkey Cache
1. In Aiven dashboard, **Create Service** → Redis/Valkey
2. **Configuration:**
   - **Service Name**: `quiz-app-redis`
   - **Region**: Same as MySQL
   - **Plan**: Hobbyist (free tier)
3. **Get Connection Details** for environment variables

---

### 🔄 Deployment Workflow

#### Recommended Deployment Order:
1. **Database First**: Set up MySQL and Redis on Aiven
2. **Backend Deployment**: Deploy to Railway/Render/Koyeb
3. **Frontend Deployment**: Deploy to Vercel/Netlify with backend URL
4. **Testing**: Verify all functionality works end-to-end

#### Environment Variables Checklist:

**Backend (.env for local, dashboard for production):**
- ✅ Database connection (MySQL)
- ✅ Redis connection
- ✅ JWT secret
- ✅ Spring profile (prod)

**Frontend (.env.local for dev, .env.production template):**
- ✅ Backend API URL
- ✅ App configuration
- ✅ Frontend URL (for CORS)

---

### 🛠️ Troubleshooting Deployment

#### Common Backend Issues:
- **Database Connection**: Check MySQL host, port, credentials
- **Redis Connection**: Ensure SSL is enabled for Aiven Redis
- **Memory Issues**: Increase instance size if needed
- **CORS Errors**: Verify frontend URL in backend CORS configuration

#### Common Frontend Issues:
- **API Connection**: Ensure `NEXT_PUBLIC_API_BASE_URL` is correct
- **Build Errors**: Check all environment variables are set
- **Runtime Errors**: Verify backend is deployed and accessible

#### Quick Deployment Test:
```bash
# Test backend API
curl https://your-backend-url.com/api/health

# Test frontend
curl https://your-frontend-url.com
```

---

### 💰 Cost Estimate

#### Free Tier Options:
- **Backend**: Railway/Koyeb (free tier)
- **Frontend**: Vercel/Netlify (free tier)
- **Database**: Aiven MySQL (hobbyist plan)
- **Redis**: Aiven Redis (hobbyist plan)
- **Total**: $0-5/month

#### Production Ready:
- **Backend**: Railway Starter ($5/month)
- **Frontend**: Vercel Pro ($20/month) 
- **Database**: Aiven MySQL ($8-25/month)
- **Redis**: Aiven Redis ($8-15/month)
- **Total**: $41-65/month

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
