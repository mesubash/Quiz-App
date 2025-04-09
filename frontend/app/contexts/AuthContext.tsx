"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authService } from "../services/api"

type User = {
  id: string
  email: string
  username: string
  role: string
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize user state from localStorage
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false) // Mark loading as complete
  }, [])

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    const data = await authService.login(email, password)
    setUser(data.user)
  
    // Save user and tokens to localStorage
    localStorage.setItem("accessToken", data.accessToken)
    localStorage.setItem("refreshToken", data.refreshToken)
    localStorage.setItem("user", JSON.stringify(data.user))
  
    // Save email to localStorage if "Remember Me" is checked
    if (rememberMe) {
      localStorage.setItem("rememberedEmail", email)
    } else {
      localStorage.removeItem("rememberedEmail")
    }
  
    // Redirect based on role and fetch profile
    if (data.user.role === "ADMIN") {
      await authService.fetchProfile("/admin/profile") // Fetch admin profile
      router.push("/admin")
    } else {
      await authService.fetchProfile("/user/profile") // Fetch user profile
      router.push("/dashboard")
    }
  }
  const register = async (username: string, email: string, password: string) => {
    await authService.register(username, email, password)
    router.push("/login")
  }

  const logout = () => {
    // Clear user and tokens from localStorage
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    setUser(null)
    router.push("/login")
  }

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}