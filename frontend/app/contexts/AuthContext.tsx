import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../services/api";

// Define the User type
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

// Utility functions for cookies
function setCookie(name: string, value: string, days: number = 1) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict;secure`;
}

function clearAuthCookies() {
  const cookies = ["accessToken", "role", "refreshToken"];
  cookies.forEach((name) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict;secure`;
  });
}

// Create the AuthContext
const AuthContext = createContext<{
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  loading: boolean;
  refreshTokenIfNeeded: () => Promise<string | null>;
  isAuthenticated: boolean;
  authInitialized: boolean;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const router = useRouter();

  // Clear authentication state
  const clearAuthState = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    clearAuthCookies();
    setUser(null);
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authService.logout()
      clearAuthState()
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
      throw error
    }
  }, [clearAuthState, router])

  // Refresh token if needed
  const refreshTokenIfNeeded = useCallback(async (): Promise<string | null> => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return null;

      // Call the refresh token API
      const response = await authService.refreshToken();
      if (response.accessToken) {
        localStorage.setItem("accessToken", response.accessToken);
        setCookie("accessToken", response.accessToken);
        return response.accessToken;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout(); // Call logout on failure
      return null;
    }
    return null;
  }, [logout]);

  // Initialize authentication
  const initAuth = useCallback(async () => {
    if (sessionStorage.getItem("authInitInProgress")) return;

    sessionStorage.setItem("authInitInProgress", "true");

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        setAuthInitialized(true);
        return;
      }

      const userData = await authService.getCurrentUser();
      setUser(userData);
      setCookie("accessToken", token);
      setCookie("role", userData.role);
    } catch (error) {
      console.warn("Auth initialization failed:", error);
      clearAuthState();
    } finally {
      setLoading(false);
      setAuthInitialized(true);
      sessionStorage.removeItem("authInitInProgress");
    }
  }, [clearAuthState]);

  useEffect(() => {
    if (!authInitialized) {
      initAuth();
    }
  }, [authInitialized, initAuth]);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      
      // Store tokens
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.user));
      
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      }
      
      // Set cookies
      setCookie("accessToken", response.accessToken);
      setCookie("role", response.user.role);
      
      // Update user state with type checking
      if (response.user) {
        setUser(response.user);
        // Navigate based on role
        router.push(response.user.role.toLowerCase() === "admin" ? "/admin" : "/dashboard");
      }
    } catch (error) {
      console.error("Login failed:", error);
      clearAuthState();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        refreshTokenIfNeeded,
        isAuthenticated: !!user,
        authInitialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}