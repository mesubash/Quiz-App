import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../services/api";

// Add a utility function for setting cookies
function setCookie(name: string, value: string, days: number = 1) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

type User = {
  id: string;
  email: string;
  username: string;
  role: string;
  // Add other user properties as needed
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for token in localStorage
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setLoading(false);
          return;
        }

        // Fetch user data if token exists
        const userData = await authService.getCurrentUser();
        setUser(userData);
        
        // Ensure cookies are set for middleware (important!)
        setCookie("accessToken", token);
        setCookie("role", userData.role);
        
        console.log("Auth initialized with role:", userData.role);
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Clear invalid auth state
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    setLoading(true);
    
    try {
      console.log("Logging in with:", email);
      const response = await authService.login(email, password);
      
      console.log("Login response:", {
        accessToken: response.accessToken ? "exists" : "missing",
        user: response.user ? { ...response.user, password: "[REDACTED]" } : "missing",
      });

      if (!response || !response.accessToken || !response.user) {
        throw new Error("Invalid login response");
      }

      // Store auth data in localStorage (client-side)
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("user", JSON.stringify(response.user));
      
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // IMPORTANT: Set HTTP cookies for middleware
      setCookie("accessToken", response.accessToken);
      setCookie("role", response.user.role);
      
      console.log("Cookies set for:", {
        role: response.user.role,
        tokenLength: response.accessToken.length
      });

      // Update state
      setUser(response.user);

      // Forced full page reload instead of client-side navigation
      // This ensures middleware has access to the new cookies
      const normalizedRole = response.user.role.toLowerCase();
      if (normalizedRole === "admin") {
        console.log("→ Redirecting to admin dashboard");
        window.location.href = "/admin";
      } else {
        console.log("→ Redirecting to user dashboard");
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      await authService.register(name, email, password);
      router.push("/login");
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    
    // Clear cookies
    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    setUser(null);
    
    // Force full page reload to ensure middleware sees cookie changes
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}