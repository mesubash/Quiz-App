"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import LogoutConfirmation from "../components/logout-confirmation"

type LogoutContextType = {
  openLogoutModal: () => void
  closeLogoutModal: () => void
}

export const LogoutContext = createContext<LogoutContextType | undefined>(undefined)

export function LogoutProvider({ children }: { children: ReactNode }) {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const openLogoutModal = () => setIsLogoutModalOpen(true)
  const closeLogoutModal = () => setIsLogoutModalOpen(false)

  return (
    <LogoutContext.Provider value={{ openLogoutModal, closeLogoutModal }}>
      {children}
      <LogoutConfirmation isOpen={isLogoutModalOpen} onClose={closeLogoutModal} />
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