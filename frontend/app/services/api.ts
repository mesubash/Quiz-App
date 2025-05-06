import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { QuizData } from "@/app/types/quiz";
import { LeaderboardEntry, LeaderboardStats } from "../types/leaderboard";
import { get } from "http";

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

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}
export interface TokenRefreshResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}
const tokenManager = {
  getAccessToken: () => localStorage.getItem("accessToken"),
  setAccessToken: (token: string) => {
    localStorage.setItem("accessToken", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  },
  removeAccessToken: () => {
    localStorage.removeItem("accessToken");
    delete api.defaults.headers.common["Authorization"];
  },
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
  withCredentials: true, // Important for receiving cookies
});

let isRefreshing = false;
let isLoggingOut = false;

let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });
  failedQueue = [];
};

// Update the response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      !originalRequest ||
      isLoggingOut ||
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.headers["X-Skip-Refresh"]
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    try {
      originalRequest._retry = true;
      isRefreshing = true;

      const { data } = await api.post<AuthResponse>(
        "/auth/token/refresh",
        {},
        {
          headers: { "X-Skip-Refresh": "true" },
        }
      );

      if (!data.accessToken) {
        throw new Error("No access token received");
      }

      tokenManager.setAccessToken(data.accessToken);
      processQueue(null, data.accessToken);

      originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAuthState();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// Update request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = tokenManager.getAccessToken();
    if (token && !config.headers["X-Skip-Refresh"]) {
      if (isTokenExpired(token)) {
        try {
          const newToken = await authService.refreshToken();
          config.headers["Authorization"] = `Bearer ${newToken}`;
        } catch (error) {
          console.warn("Preemptive token refresh failed:", error);
        }
      } else {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export class TokenRefreshError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TokenRefreshError";
  }
}

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// Auth Service
export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>(
        "/auth/login",
        {
          email,
          password,
        },
        {
          withCredentials: true, // Important for receiving cookies
        }
      );

      const { accessToken, user } = response.data;

      // Only store access token and user data
      tokenManager.setAccessToken(accessToken);
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
      throw new Error("An error occurred during login");
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
    isLoggingOut = true;
    try {
      // Get current access token
      const token = localStorage.getItem("accessToken");

      // Make logout request with proper headers
      await api.post(
        "/auth/logout",
        {},
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "X-Skip-Refresh": "true",
          },
          withCredentials: true,
        }
      );

      // Clear all auth state
      clearAuthState();
    } catch (error) {
      if (!silent) {
        console.error("Logout error:", error);
      }
      // Still clear state on error
      clearAuthState();
    } finally {
      isLoggingOut = false;
    }
  },

  refreshToken: async () => {
    try {
      const { data } = await api.post<AuthResponse>(
        "/auth/token/refresh",
        {},
        { headers: { "X-Skip-Refresh": "true" } }
      );

      if (!data.accessToken) {
        throw new TokenRefreshError("No access token received");
      }

      tokenManager.setAccessToken(data.accessToken);
      return data.accessToken;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new TokenRefreshError("Refresh token expired");
        }
        if (error.response?.status === 403) {
          throw new TokenRefreshError("Refresh token revoked");
        }
      }
      throw new TokenRefreshError("Token refresh failed");
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    if (user) {
      return JSON.parse(user);
    }
    return null;
  },
};
const clearAuthState = () => {
  // Clear localStorage
  tokenManager.removeAccessToken();
  localStorage.removeItem("user");

  sessionStorage.clear();

  // Clear axios default headers
  delete api.defaults.headers.common["Authorization"];

  // Clear cookie (though backend should handle this)
  document.cookie.split(";").forEach((cookie) => {
    const [name] = cookie.split("=");
    document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${
      window.location.hostname
    };`;
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
    console.log("Quizzes:", response.data);
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

  startQuizAttempt: async (quizId: string | number) => {
    try {
      const response = await api.post("/attempts/start", {
        quizId: Number(quizId),
      });
      return response.data;
    } catch (error: any) {
      // Pass error up for resume logic
      throw error;
    }
  },
  resumeQuizAttempt: async (quizId: string | number) => {
    try {
      const response = await api.get(`/attempts/resume/${quizId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error("No active attempt found for the specified quiz.");
        }
      }
      throw error;
    }
  },

  submitQuizAttempt: async (
    attemptId: number,
    answers: QuizAttempt["answers"]
  ) => {
    // Correct endpoint:
    const response = await api.post(`/attempts/${attemptId}/submit`, {
      answers,
    });
    return response.data;
  },
  endQuizAttempt: async (attemptId: string) => {
    // Correct endpoint:
    const response = await api.post(`/attempts/end`);
    return response.data;
  },

  getQuizHistory: async () => {
    // Correct endpoint for all user attempts:
    const response = await api.get(`/attempts/user`);
    return response.data;
  },
  getQuizAttempt: async (attemptId: string | number) => {
    const response = await api.get(`/attempts/user/${attemptId}`);
    return response.data;
  },
  getAllCategories: async () => {
    const response = await api.get("/quizzes/categories");
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
  getQuizAttemptDetails: async (attemptId: string | number) => {
    try {
      const response = await api.get(
        `/attempts/user/quiz-history/${Number(attemptId)}`
      );
      return response.data;
      console.log("Quiz Attempt Details:", response.data);
    } catch (error) {
      console.error("Failed to fetch quiz attempt details:", error);
      throw error;
    }
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

export const leaderboardService = {
  // Get global leaderboard
  getGlobalLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    try {
      const response = await api.get<LeaderboardEntry[]>("/leaderboard");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch global leaderboard:", error);
      throw new Error("Failed to fetch leaderboard");
    }
  },

  // Get quiz-specific leaderboard
  getQuizLeaderboard: async (quizId: string): Promise<LeaderboardEntry[]> => {
    try {
      const response = await api.get<LeaderboardEntry[]>(
        `/leaderboard/quiz/${quizId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch leaderboard for quiz ${quizId}:`, error);
      throw new Error("Failed to fetch quiz leaderboard");
    }
  },

  // Calculate leaderboard statistics
  getLeaderboardStats: (entries: LeaderboardEntry[]): LeaderboardStats => {
    if (!entries.length) {
      return {
        topScore: 0,
        totalParticipants: 0,
        mostQuizzesTaken: 0,
        averageScore: 0,
      };
    }

    const totalScore = entries.reduce((sum, entry) => sum + entry.score, 0);

    return {
      topScore: Math.max(...entries.map((entry) => entry.score)),
      totalParticipants: entries.length,
      mostQuizzesTaken: Math.max(...entries.map((entry) => entry.quizzesTaken)),
      averageScore: Math.round(totalScore / entries.length),
    };
  },

  // Format rank display
  formatRank: (rank: number): string => {
    if (rank <= 0) return "-";
    const suffixes = ["th", "st", "nd", "rd"];
    const v = rank % 100;
    return rank + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  },
};

export default api;
