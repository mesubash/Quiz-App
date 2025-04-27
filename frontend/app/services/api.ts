import axios, { type AxiosError } from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: "http://localhost:8080/api", // Spring Boot backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to add the token to all requests
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const response = await api.post("/auth/refresh", { refreshToken });
          localStorage.setItem("accessToken", response.data.accessToken);
          if (error.config && error.config.headers) {
            error.config.headers.Authorization = `Bearer ${response.data.accessToken}`;
          }
          if (error.config) {
            return api.request(error.config);
          }
        } catch (refreshError) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    const { accessToken, refreshToken, user } = response.data;

    // Store tokens and user info
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));

    return response.data;
  },

  register: async (username: string, email: string, password: string) => {
    const response = await api.post("/auth/register", {
      username,
      email,
      password,
    });
    return response.data;
  },

  refreshToken: async () => {
    try {
      const storedRefreshToken = localStorage.getItem("refreshToken");
      if (!storedRefreshToken) {
        throw new Error("No refresh token found. Please log in again.");
      }
  
      // Call the backend to refresh the token
      const response = await api.post("/auth/refresh", { refreshToken: storedRefreshToken });
  
      // Update the access token in localStorage and cookies
      const { accessToken, refreshToken } = response.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
  
      // Optionally, set cookies for server-side middleware
      document.cookie = `accessToken=${accessToken};path=/;SameSite=Strict;secure`;
      document.cookie = `refreshToken=${refreshToken};path=/;SameSite=Strict;secure`;
  
      return accessToken;
    } catch (error) {
      console.error("Token refresh error:", error);
  
      // Clear invalid tokens and redirect to login
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "/login";
  
      throw error;
    }
  },


 
  logout: async () => {
    try {
      // 1. Call the backend to invalidate the token
      const token = localStorage.getItem("accessToken");
      if (token) {
        await api.post(
          "/auth/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      console.log("Backend logout successful");
    } catch (error) {
      console.error("Error during backend logout:", error);
      // Continue with local logout even if backend fails
    } finally {
      // 2. Clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      // 3. Clear cookies
      document.cookie =
        "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // 4. Redirect to login page
      window.location.href = "/login";
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

export const adminService = {
  getAllUsers: async () => {
    try {
      const response = await api.get("/admin/get-all-users");
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  deleteUser: async (username: string) => {
    try {
      const response = await api.delete(`/admin/delete-user/${username}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${username}:`, error);
      throw error;
    }
  },

  toggleUserStatus: async (userId: string, status: boolean) => {
    try {
      const response = await api.patch(`/admin/update-user-status/${userId}`, {
        enabled: status,
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating user status:`, error);
      throw error;
    }
  },
};

// User Services
export const userService = {
  getUserProfile: async () => {
    const response = await api.get("/user/profile");
    return response.data;
  },
  getQuizHistory: async () => {
    const response = await api.get("/user/quiz-history");
    return response.data;
  },
  getQuizHisoryById: async (quizId: string) => {
    const response = await api.get(`/user/quiz-history/${quizId}`);
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

// Quiz Services
export const quizService = {
  getAllQuizzes: async () => {
    try {
      const response = await api.get("/quizzes");
      return response.data;
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      throw error;
    }
  },

  // Get a single quiz by ID
  getQuizById: async (id: number) => {
    try {
      const response = await api.get(`/quizzes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching quiz ${id}:`, error);
      throw error;
    }
  },
  // Create a new quiz
  createQuiz: async (quizData: any) => {
    try {
      console.log("API: Creating quiz with data:", quizData);
      // Use a specific endpoint for quiz creation
      const response = await api.post("/quizzes", quizData);
      return response.data;
    } catch (error) {
      console.error("Error creating quiz:", error);
      throw error;
    }
  },
  getQuizQuestions: async (quizId: string) => {
    const response = await api.get(`/quizzes/${quizId}/questions`);
    return response.data;
  },
  getQuizHistory: async (quizId: string) => {
    const response = await api.get(`/quizzes/history/{quizId}`);
    return response.data;
  },

  startQuizAttempt: async (quizId: string) => {
    const response = await api.post(`/attempts/start?quizId=${quizId}`);
    return response.data;
  },
  updateQuiz: async (id: number, quizData: any) => {
    try {
      const response = await api.put(`/quizzes/${id}`, quizData);
      return response.data;
    } catch (error) {
      console.error(`Error updating quiz ${id}:`, error);
      throw error;
    }
  },

  submitQuizAttempt: async (attemptId: string, answers: any[]) => {
    const response = await api.post(`/attempts/${attemptId}/submit`, {
      answers,
    });
    return response.data;
  },
  deleteQuiz: async (id: number) => {
    try {
      const response = await api.delete(`/quizzes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting quiz ${id}:`, error);
      throw error;
    }
  },
};

export default api;
