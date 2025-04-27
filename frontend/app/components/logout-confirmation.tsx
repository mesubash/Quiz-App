"use client"

import { useState, useEffect } from "react"
import { LogOut, X } from "lucide-react"
import { authService } from "../services/api"

type LogoutConfirmationProps = {
  isOpen: boolean
  onClose: () => void
}

export default function LogoutConfirmation({ isOpen, onClose }: LogoutConfirmationProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Delay animation slightly for smoother effect
      setTimeout(() => setAnimateIn(true), 10)
    } else {
      setAnimateIn(false)
    }
  }, [isOpen])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await authService.logout()
      // The logout function will handle redirection
    } catch (error) {
      console.error("Logout failed:", error)
      setIsLoggingOut(false)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          animateIn ? "opacity-50" : "opacity-0"
        }`} 
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div 
        className={`relative w-full max-w-md sm:w-auto overflow-hidden transform transition-all duration-300 ${
          animateIn 
            ? "translate-y-0 opacity-100" 
            : "translate-y-10 opacity-0"
        }`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-t-xl sm:rounded-xl shadow-xl p-6 mx-auto">
          <div className="absolute right-4 top-4">
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <LogOut className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Sign Out</h3>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to sign out of your account?
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 py-2.5 px-4 rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:opacity-70 flex justify-center items-center"
              >
                {isLoggingOut ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing out...
                  </>
                ) : (
                  "Yes, Sign Out"
                )}
              </button>
              <button
                onClick={onClose}
                disabled={isLoggingOut}
                className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-70"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}