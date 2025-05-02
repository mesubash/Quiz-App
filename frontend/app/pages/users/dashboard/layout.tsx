"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../../contexts/AuthContext"
import { useTheme } from "next-themes"
import { Sidebar } from "../sidebar/sidebar"
import { Footer } from "../../../components/footer"
import { Sun, Moon } from "lucide-react"


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user,loading } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Update auth check
  useEffect(() => {
    setMounted(true)
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (!mounted || !user) {
    return null // Don't render anything while checking authentication
  }

  return (
    <div className={`min-h-screen flex ${resolvedTheme === "dark" ? "dark" : ""}`}>
      <Sidebar onCollapsedChange={setSidebarCollapsed} />

      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
          ml-0 w-full overflow-x-hidden`}
      >
        <header className="sticky top-0 z-30 flex items-center justify-end h-16 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            aria-label="Toggle theme"
          >
            {resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </header>

        <main className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>

        <Footer />
      </div>
    </div>
  )
}
