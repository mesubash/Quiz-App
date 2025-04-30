"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./AuthContext"
import LogoutConfirmation from "../components/LogoutConfirmation"

type LogoutContextType = {
  openLogoutModal: () => void
  closeLogoutModal: () => void
}

const LogoutContext = createContext<LogoutContextType | undefined>(undefined)

export function LogoutProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { logout } = useAuth()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const openLogoutModal = () => setIsLogoutModalOpen(true)
  const closeLogoutModal = () => setIsLogoutModalOpen(false)

  const handleLogout = async () => {
    try {
      // First notify server
      await logout()
      // Then close modal and redirect
      closeLogoutModal()
      window.location.href = "/login" // Use window.location for full page reload
    } catch (error) {
      console.error("Logout failed:", error)
      closeLogoutModal()
      window.location.href = "/login"
    }
  }

  return (
    <LogoutContext.Provider value={{ openLogoutModal, closeLogoutModal }}>
      {children}
      <LogoutConfirmation 
        isOpen={isLogoutModalOpen}
        onClose={closeLogoutModal}
        onConfirm={handleLogout}
      />
    </LogoutContext.Provider>
  )
}

export function useLogout() {
  const context = useContext(LogoutContext)
  if (!context) {
    throw new Error("useLogout must be used within a LogoutProvider")
  }
  return context
}