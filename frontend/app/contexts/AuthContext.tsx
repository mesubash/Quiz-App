"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authService } from "../services/api"

type User = {
  id: string
  email: string
  name: string
  role: "admin" | "user"
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string, role: "admin" | "user") => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
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
    // Check for saved user on client-side only
    const checkAuth = async () => {
      try {
        setIsLoading(true)

        // First check if we have a user in localStorage
        const savedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        } else {
          // If no user in localStorage, try to verify with backend
          try {
            const userData = await authService.checkAuth()
            setUser(userData)
            localStorage.setItem("user", JSON.stringify(userData))
          } catch (error) {
            // If verification fails, clear any existing tokens
            console.warn("Auth verification failed, clearing tokens", error)
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            setUser(null)
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const isAuthenticated = !!user

  const login = async (email: string, password: string, role: "admin" | "user") => {
    try {
      setIsLoading(true)

      const response = await authService.login(email, password, role)
      setUser(response.user)

      // Redirect based on role
      if (role === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Login failed:", error)
      throw new Error("Login failed. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true)

      const response = await authService.register(name, email, password)
      setUser(response.user)
      router.push("/dashboard")
    } catch (error) {
      console.error("Registration failed:", error)
      throw new Error("Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true)
      await authService.resetPassword(email)
    } catch (error) {
      console.error("Password reset failed:", error)
      throw new Error("Password reset failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    router.push("/login")
  }

  const value = {
    user,
    login,
    register,
    resetPassword,
    logout,
    isAuthenticated,
    isLoading,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
