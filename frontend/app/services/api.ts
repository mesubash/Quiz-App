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

// Single interceptor for handling 401s and token refresh
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
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
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
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await authService.logout(true);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Service
export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/login", {
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
      // First try to notify server
      await api.post("/auth/logout");

      // Only clear storage after successful server logout
      clearAuthState();
    } catch (error) {
      if (!silent) {
        console.error("Logout error:", error);
      }
      // On server error, still clear local state
      clearAuthState();
      throw error; // Re-throw to handle in UI
    }
  },

  refreshToken: async () => {
    try {
      const storedRefreshToken = localStorage.getItem("refreshToken");
      if (!storedRefreshToken) {
        // Instead of throwing, try to get refresh token from cookie
        const cookies = document.cookie.split(";");
        const refreshTokenCookie = cookies.find((c) =>
          c.trim().startsWith("refreshToken=")
        );
        if (!refreshTokenCookie) {
          // If no token in localStorage or cookies, handle gracefully
          await authService.logout(true);
          throw new Error("Session expired. Please login again.");
        }
        // Extract token from cookie
        const token = refreshTokenCookie.split("=")[1];
        localStorage.setItem("refreshToken", token);
      }

      const response = await api.post("/auth/token/refresh", {
        token: storedRefreshToken || localStorage.getItem("refreshToken"),
      });

      const { accessToken, refreshToken } = response.data;

      // Update both localStorage and cookies
      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
        document.cookie = `refreshToken=${refreshToken}; path=/; secure; samesite=strict`;
      }

      return accessToken;
    } catch (error) {
      // Clear auth state on refresh failure
      await authService.logout(true);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error("Session expired. Please login again.");
        }
        throw new Error(
          error.response?.data?.message || "Failed to refresh token"
        );
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
const clearAuthState = () => {
  // Clear localStorage
  localStorage.clear();
  sessionStorage.clear();

  // Clear cookies
  document.cookie.split(";").forEach((cookie) => {
    const [name] = cookie.split("=");
    document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
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
    try {
      const response = await api.get<User>("/user/profile");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      throw error;
    }
  },

  getQuizHistory: async () => {
    try {
      const response = await api.get("/user/quiz-history");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch quiz history:", error);
      throw error;
    }
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
