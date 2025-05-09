"use client"

import { ThemeProvider } from "next-themes"
import { AuthProvider } from "./contexts/AuthContext"
import { LogoutProvider } from "./contexts/LogoutContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" >
      <AuthProvider>
        <LogoutProvider>
          {children}
        </LogoutProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}