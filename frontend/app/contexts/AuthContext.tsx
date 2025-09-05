import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { useRouter } from "next/navigation"
import { authService } from "../services/api"

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
  register: (username: string, firstName: string, lastName: string, email: string, password: string, role: string) => Promise<void>;
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
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach(cookie => {
      const [name] = cookie.split("=");
      document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    
    setUser(null);
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Set loading state
      setLoading(true);
    
      // First attempt server logout
      await authService.logout(false)
      // Then clear context state
      clearAuthState();
      window.location.href = "/login"; // Redirect to login page
    } catch (error) {
      console.error("Logout failed:", error)

      // Still clear context state on error
      throw error
    }finally{
      setLoading(false);
      setUser(null);
    }
  }, [clearAuthState]);
  
  const refreshTokenIfNeeded = useCallback(async (): Promise<string | null> => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return null;
  
      const newToken = await authService.refreshToken();
      return newToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
      return null;
    }
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

  const register = async (username: string, firstName: string, lastName: string, email: string, password: string, role: string) => {
    setLoading(true);
    try {
      const user = await authService.register(username, firstName, lastName, email, password, role);
      // Registration successful - user can now login
      // Don't automatically log them in, let them go to login page
    } catch (error: any) {
      // Extract the error message and throw a cleaner error (don't log the original axios error)
      let errorMessage = "Failed to create account. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message && !error.message.includes('Request failed with status code')) {
        errorMessage = error.message;
      }
      
      // Throw a clean error with just the message
      const cleanError = new Error(errorMessage);
      cleanError.name = 'RegistrationError';
      throw cleanError;
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
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