"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import LogoutConfirmation from "../components/LogoutConfirmation"
import { useAuth } from "./AuthContext"


type LogoutContextType = {
  openLogoutModal: () => void
  closeLogoutModal: () => void
  handleLogout: () => Promise<void>
}

export const LogoutContext = createContext<LogoutContextType | undefined>(undefined)

export function LogoutProvider({ children }: { children: ReactNode }) {
  const { logout } = useAuth()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const openLogoutModal = () => setIsLogoutModalOpen(true)
  const closeLogoutModal = () => setIsLogoutModalOpen(false)

  const handleLogout = async () => {
    try {
      await logout()
      closeLogoutModal()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <LogoutContext.Provider value={{ openLogoutModal, closeLogoutModal, handleLogout }}>
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
  if (context === undefined) {
    throw new Error("useLogout must be used within a LogoutProvider")
  }
  return context
}