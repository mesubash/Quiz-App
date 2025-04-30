"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/app/services/api"
import { ArrowLeft, LogOut } from "lucide-react"

export default function LogoutPage() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await authService.logout()
      window.location.href = "/login"
      // The logout function in authService will handle credential cleanup and redirection
    } catch (error) {
      console.error("Logout error:", error)
      setError("Something went wrong during logout. Please try again.")
      setIsLoggingOut(false)
    }
  }

  const handleCancel = () => {
    // Get the previous location from history if available, otherwise go to dashboard
    router.back()
  }
  useEffect(() => {
    // Auto-logout if user hits /logout directly
    if (typeof window !== "undefined") {
      handleLogout()
    }
  }, []) 

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <LogOut className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sign Out</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Are you sure you want to sign out of your account?
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? "Signing out..." : "Yes, Sign Out"}
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoggingOut}
              className="w-full py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
  return null
}