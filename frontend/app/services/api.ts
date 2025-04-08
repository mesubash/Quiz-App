import axios, { type AxiosError } from "axios"

// Create axios instance with default config
const api = axios.create({
  baseURL: "http://localhost:8080/api", // Spring Boot backend URL
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to add the token to all requests
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth Services
export const authService = {
  login: async (email: string, password: string, role: string) => {
    try {
      const response = await api.post("/auth/login", { email, password, role })

      // Store token and user info
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.user))

      return response.data
    } catch (error: any) {
      console.error("Login error:", error)

      // For development/testing, use mock data if backend is not available
      if (process.env.NODE_ENV === "development" || error.message === "Network Error") {
        console.warn("Using mock data for login in development mode")
        const mockResponse = {
          user: {
            id: "1",
            email,
            name: email.split("@")[0],
            role,
          },
          token: "mock-jwt-token",
        }

        localStorage.setItem("token", mockResponse.token)
        localStorage.setItem("user", JSON.stringify(mockResponse.user))

        return mockResponse
      }

      throw error
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      const response = await api.post("/auth/register", { name, email, password })

      // Store token and user info
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.user))

      return response.data
    } catch (error) {
      console.error("Registration error:", error)

      // For development/testing, use mock data if backend is not available
      if (process.env.NODE_ENV === "development") {
        console.warn("Using mock data for registration in development mode")
        const mockResponse = {
          user: {
            id: "1",
            email,
            name,
            role: "user",
          },
          token: "mock-jwt-token",
        }

        localStorage.setItem("token", mockResponse.token)
        localStorage.setItem("user", JSON.stringify(mockResponse.user))

        return mockResponse
      }

      throw error
    }
  },

  logout: async () => {
    try {
      // Call logout endpoint if your backend requires it
      await api.post("/auth/logout")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Always clear local storage
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    }
  },

  checkAuth: async () => {
    try {
      const response = await api.get("/auth/me")
      return response.data
    } catch (error) {
      // Check if it's a network error (backend not available)
      if (error.message === "Network Error") {
        console.warn("Backend not available, using fallback for development")

        // For development/preview, check if we have a token in localStorage
        const token = localStorage.getItem("token")
        const savedUser = localStorage.getItem("user")

        if (token && savedUser) {
          // If we have both, consider the user authenticated for development
          return JSON.parse(savedUser)
        }
      }

      console.error("Auth check error:", error)
      throw error
    }
  },
}

// Quiz Services
export const quizService = {
  getAllQuizzes: async () => {
    try {
      const response = await api.get("/quizzes")
      return response.data
    } catch (error) {
      console.error("Error fetching quizzes:", error)

      // For development/testing, use mock data if backend is not available
      if (process.env.NODE_ENV === "development") {
        console.warn("Using mock data for quizzes in development mode")
        return mockQuizzes
      }

      throw error
    }
  },

  getQuizById: async (id: string) => {
    try {
      const response = await api.get(`/quizzes/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching quiz ${id}:`, error)

      // For development/testing, use mock data if backend is not available
      if (process.env.NODE_ENV === "development") {
        console.warn("Using mock data for quiz in development mode")
        return mockQuizzes.find((quiz) => quiz.id === id) || null
      }

      throw error
    }
  },

  createQuiz: async (quizData: any) => {
    try {
      const response = await api.post("/quizzes", quizData)
      return response.data
    } catch (error) {
      console.error("Error creating quiz:", error)
      throw error
    }
  },

  updateQuiz: async (id: string, quizData: any) => {
    try {
      const response = await api.put(`/quizzes/${id}`, quizData)
      return response.data
    } catch (error) {
      console.error(`Error updating quiz ${id}:`, error)
      throw error
    }
  },

  deleteQuiz: async (id: string) => {
    try {
      await api.delete(`/quizzes/${id}`)
      return true
    } catch (error) {
      console.error(`Error deleting quiz ${id}:`, error)
      throw error
    }
  },

  submitQuizAnswers: async (quizId: string, answers: any) => {
    try {
      const response = await api.post(`/quizzes/${quizId}/submit`, { answers })
      return response.data
    } catch (error) {
      console.error(`Error submitting answers for quiz ${quizId}:`, error)

      // For development/testing, use mock data if backend is not available
      if (process.env.NODE_ENV === "development") {
        console.warn("Using mock data for quiz submission in development mode")

        // Mock result calculation
        const quiz = mockQuizzes.find((q) => q.id === quizId)
        if (!quiz) return { score: 0, total: 0 }

        let score = 0
        const questionsWithAnswers = quiz.questions.map((q) => {
          const userAnswer = answers[q.id]
          const isCorrect = q.correctAnswer === userAnswer
          if (isCorrect) score++

          return {
            ...q,
            userAnswer,
            isCorrect,
          }
        })

        return {
          score,
          total: quiz.questions.length,
          questionsWithAnswers,
        }
      }

      throw error
    }
  },
}

// User Services
export const userService = {
  getUserProfile: async () => {
    try {
      const response = await api.get("/users/profile")
      return response.data
    } catch (error) {
      console.error("Error fetching user profile:", error)

      // For development/testing, use mock data if backend is not available
      if (process.env.NODE_ENV === "development") {
        console.warn("Using mock data for user profile in development mode")
        return {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          quizzesTaken: 5,
          averageScore: 80,
        }
      }

      throw error
    }
  },

  getQuizHistory: async () => {
    try {
      const response = await api.get("/users/quiz-history")
      return response.data
    } catch (error) {
      console.error("Error fetching quiz history:", error)

      // For development/testing, use mock data if backend is not available
      if (process.env.NODE_ENV === "development") {
        console.warn("Using mock data for quiz history in development mode")
        return [
          { id: "1", quizName: "JavaScript Basics", score: 8, total: 10, date: "2023-04-15" },
          { id: "2", quizName: "React Fundamentals", score: 7, total: 10, date: "2023-04-10" },
          { id: "3", quizName: "CSS Tricks", score: 9, total: 10, date: "2023-04-05" },
        ]
      }

      throw error
    }
  },

  getLeaderboard: async () => {
    try {
      const response = await api.get("/users/leaderboard")
      return response.data
    } catch (error) {
      console.error("Error fetching leaderboard:", error)

      // For development/testing, use mock data if backend is not available
      if (process.env.NODE_ENV === "development") {
        console.warn("Using mock data for leaderboard in development mode")
        return [
          { id: "1", name: "John Doe", score: 95, quizzesTaken: 10 },
          { id: "2", name: "Jane Smith", score: 90, quizzesTaken: 8 },
          { id: "3", name: "Bob Johnson", score: 85, quizzesTaken: 12 },
          { id: "4", name: "Alice Brown", score: 82, quizzesTaken: 7 },
          { id: "5", name: "Charlie Davis", score: 80, quizzesTaken: 9 },
        ]
      }

      throw error
    }
  },

  getAllUsers: async () => {
    try {
      const response = await api.get("/admin/users")
      return response.data
    } catch (error) {
      console.error("Error fetching users:", error)
      throw error
    }
  },

  updateUserStatus: async (userId: string, status: string) => {
    try {
      const response = await api.put(`/admin/users/${userId}/status`, { status })
      return response.data
    } catch (error) {
      console.error(`Error updating user ${userId} status:`, error)
      throw error
    }
  },
}

// Mock data
const mockQuizzes = [
  {
    id: "1",
    title: "JavaScript Basics",
    description: "Test your knowledge of JavaScript fundamentals",
    category: "Programming",
    timeLimit: 10, // minutes
    questions: [
      {
        id: "q1",
        text: "What is JavaScript?",
        options: [
          { id: "a", text: "A programming language" },
          { id: "b", text: "A markup language" },
          { id: "c", text: "A database system" },
          { id: "d", text: "An operating system" },
        ],
        correctAnswer: "a",
      },
      {
        id: "q2",
        text: "Which of the following is not a JavaScript data type?",
        options: [
          { id: "a", text: "String" },
          { id: "b", text: "Boolean" },
          { id: "c", text: "Float" },
          { id: "d", text: "Object" },
        ],
        correctAnswer: "c",
      },
      {
        id: "q3",
        text: "What does DOM stand for?",
        options: [
          { id: "a", text: "Document Object Model" },
          { id: "b", text: "Data Object Model" },
          { id: "c", text: "Document Oriented Model" },
          { id: "d", text: "Digital Ordinance Model" },
        ],
        correctAnswer: "a",
      },
    ],
  },
  {
    id: "2",
    title: "React Fundamentals",
    description: "Check your understanding of React basics",
    category: "Programming",
    timeLimit: 15,
    questions: [
      {
        id: "q1",
        text: "What is React?",
        options: [
          { id: "a", text: "A JavaScript library for building user interfaces" },
          { id: "b", text: "A programming language" },
          { id: "c", text: "A database management system" },
          { id: "d", text: "An operating system" },
        ],
        correctAnswer: "a",
      },
      {
        id: "q2",
        text: "What is JSX in React?",
        options: [
          { id: "a", text: "JavaScript XML - A syntax extension for JavaScript" },
          { id: "b", text: "JavaScript Extension" },
          { id: "c", text: "A React package manager" },
          { id: "d", text: "JavaScript Extra" },
        ],
        correctAnswer: "a",
      },
    ],
  },
  {
    id: "3",
    title: "HTML and CSS",
    description: "Test your web development basics",
    category: "Web Development",
    timeLimit: 10,
    questions: [
      {
        id: "q1",
        text: "What does HTML stand for?",
        options: [
          { id: "a", text: "Hyper Text Markup Language" },
          { id: "b", text: "High Tech Modern Language" },
          { id: "c", text: "Hyper Transfer Markup Language" },
          { id: "d", text: "Home Tool Markup Language" },
        ],
        correctAnswer: "a",
      },
      {
        id: "q2",
        text: "Which CSS property is used to change the text color?",
        options: [
          { id: "a", text: "color" },
          { id: "b", text: "text-color" },
          { id: "c", text: "font-color" },
          { id: "d", text: "foreground-color" },
        ],
        correctAnswer: "a",
      },
    ],
  },
]

export default api

