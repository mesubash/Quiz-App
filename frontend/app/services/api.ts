import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { QuizData } from "@/app/types/quiz";

// Types
type User = {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  enabled: boolean;
  joinDate?: string;
  quizzesTaken?: number;
  averageScore?: number;
};

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

type QuizAttempt = {
  attemptId: string;
  answers: {
    questionId: string;
    selectedOptionIds: string[];
  }[];
};

// Axios instance configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Track refresh token state
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

// Add request interceptor to add auth header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Update the refresh token endpoint path
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          const token = await new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await authService.refreshToken();
        processQueue(null, newAccessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await authService.logout(true);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/signin", {
        // Changed from /auth/login
        email,
        password,
      });

      const { accessToken, refreshToken, user } = response.data;

      // Store tokens and user data
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error("Invalid email or password");
        }
        if (error.response?.status === 401) {
          throw new Error("Unauthorized access");
        }
      }
      throw error;
    }
  },

  register: async (
    username: string,
    email: string,
    password: string
  ): Promise<User> => {
    const response = await api.post<User>("/auth/register", {
      username,
      email,
      password,
    });
    return response.data;
  },

  logout: async (silent: boolean = false) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        await api.post("/auth/logout");
      }
    } catch (error) {
      if (!silent) {
        console.error("Error during logout:", error);
      }
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      document.cookie =
        "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "/login";
    }
  },
  refreshToken: async () => {
    try {
      const storedRefreshToken = localStorage.getItem("refreshToken");
      if (!storedRefreshToken) {
        throw new Error("No refresh token found");
      }

      const response = await api.post("/auth/refresh", {
        // Changed from /auth/token/refresh
        token: storedRefreshToken, // Changed from refreshToken to token
      });

      const { accessToken, refreshToken } = response.data;

      // Update stored tokens
      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      return accessToken;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          await authService.logout(true);
          throw new Error("Session expired. Please login again.");
        }
        if (error.response?.status === 500) {
          throw new Error("Server error. Please try again later.");
        }
      }
      throw error;
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    if (user) {
      return JSON.parse(user);
    }
    return null;
  },
  fetchProfile: async (endpoint: string) => {
    const response = await api.get(endpoint);
    return response.data;
  },
};

// Admin Service
export const adminService = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>("/admin/users");
    return response.data;
  },

  deleteUser: async (username: string): Promise<void> => {
    await api.delete(`/admin/users/${username}`);
  },

  toggleUserStatus: async (userId: string, status: boolean): Promise<User> => {
    const response = await api.patch<User>(`/admin/users/${userId}/status`, {
      enabled: status,
    });
    return response.data;
  },
};

// Quiz Service
export const quizService = {
  getAllQuizzes: async () => {
    const response = await api.get("/quizzes");
    return response.data;
  },

  getQuizById: async (id: number) => {
    try {
      const response = await api.get(`/quizzes/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error("Quiz not found");
        }
        if (error.response?.status === 401) {
          throw new Error("Unauthorized access");
        }
      }
      throw error;
    }
  },

  createQuiz: async (quizData: QuizData) => {
    const response = await api.post("/quizzes/create", quizData);
    return response.data;
  },

  updateQuiz: async (id: number, quizData: QuizData) => {
    try {
      const response = await api.put(`/quizzes/${id}`, quizData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error("Quiz not found");
        }
        if (error.response?.status === 401) {
          throw new Error("Unauthorized access");
        }
      }
      throw error;
    }
  },

  deleteQuiz: async (id: number) => {
    await api.delete(`/quizzes/${id}`);
  },

  startQuizAttempt: async (quizId: string) => {
    const response = await api.post(`/attempts/start`, { quizId });
    return response.data;
  },

  submitQuizAttempt: async (
    attemptId: string,
    answers: QuizAttempt["answers"]
  ) => {
    const response = await api.post(`/attempts/${attemptId}/submit`, {
      answers,
    });
    return response.data;
  },

  getQuizHistory: async (quizId: string) => {
    const response = await api.get(`/quizzes/${quizId}/history`);
    return response.data;
  },
};

// User Service
export const userService = {
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>("/user/profile");
    return response.data;
  },

  getQuizHistory: async () => {
    const response = await api.get("/user/quiz-history");
    return response.data;
  },

  getQuizAttempt: async (attemptId: string) => {
    const response = await api.get(`/user/quiz-attempts/${attemptId}`);
    return response.data;
  },

  getLeaderboard: async () => {
    const response = await api.get("/leaderboard");
    return response.data;
  },

  getQuizLeaderboard: async (quizId: string) => {
    const response = await api.get(`/leaderboard/quiz/${quizId}`);
    return response.data;
  },
};

export default api;
