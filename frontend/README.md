# Quiz Application - Frontend Documentation

![React](https://img.shields.io/badge/React-18.2.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-13.4.0-black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.0-teal)

## 🚀 Live Demo

**Frontend URL**: [https://quizapp.subashsdhami.com.np/](https://quizapp.subashsdhami.com.np/)

Test the live application with all the features mentioned below.

## Table of Contents

- Project Overview
- Features
- Technology Stack
- Frontend Documentation
- Setup & Installation
- Contributing
- License

---

## Project Overview

A comprehensive online quiz platform that enables:

- User authentication and authorization
- Quiz creation and management
- Real-time quiz attempts
- Performance analytics and leaderboards
- Interactive and responsive user interface

This project is built using **Next.js** for the frontend, ensuring scalability, maintainability, and a seamless user experience.

---

## Features

### Core Modules

- **User Management**
  - Registration with email validation
  - Role-based access control (Admin/User)

- **Quiz Engine**
  - Multiple question types (MCQ, True/False, etc.)
  - Time-limited quizzes
  - Automatic scoring and result calculation

- **Reporting**
  - User performance analytics
  - Quiz statistics
  - Leaderboards (global and quiz-specific)

- **Frontend Features**
  - Responsive design with Tailwind CSS
  - Dark mode support
  - Real-time feedback with toast notifications
  - Interactive dashboards for users and admins

---

## Technology Stack

### Frontend

- **Framework**: Next.js 13.4.0
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.3.0
- **State Management**: React Context API

---

## Frontend Documentation

### Folder Structure

```plaintext
frontend/
├── app/
│   ├── components/       # Reusable UI components
│   ├── contexts/         # Context API for global state
│   ├── pages/            # Next.js pages
│   ├── services/         # API service functions
│   ├── types/            # TypeScript type definitions
│   ├── globals.css       # Global CSS styles
│   ├── layout.tsx        # Root layout component
│   └── page.tsx          # Home page
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── next.config.mjs       # Next.js configuration
```

### Key Features

- **Dark Mode**: Implemented using `next-themes`.
- **Toast Notifications**: Real-time feedback using custom toast components.
- **Dynamic Routing**: Utilizes Next.js dynamic routes for quizzes and user profiles.
- **Responsive Design**: Fully responsive UI with Tailwind CSS.

### Pages Overview

- **Home Page**: Overview of the platform and popular quizzes.
- **Admin Dashboard**: Manage quizzes, view analytics, and handle user roles.
- **User Dashboard**: Track quiz history, performance, and achievements.
- **Quiz Pages**: Attempt quizzes with real-time feedback.
- **Contact Page**: Contact form with validation and simulated API calls.

### Running the Frontend

1. Navigate to the `frontend` directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

### 🌐 Live Demo

You can also test the live deployment at: **[https://quizapp.subashsdhami.com.np/](https://quizapp.subashsdhami.com.np/)**

---

## Setup & Installation

### Prerequisites

- Node.js 18+
- npm 9+

### Frontend Setup

**🔗 Live Demo**: Test the application at [https://quizapp.subashsdhami.com.np/](https://quizapp.subashsdhami.com.np/)

**Local Development Setup**:

1. Clone the repository:

   ```bash
   git clone git@github.com:mesubash/Quiz-App.git
   cd Quiz-App/frontend
   ```

2. Follow the frontend setup instructions provided above.

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