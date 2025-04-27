"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../contexts/AuthContext"
import { useTheme } from "next-themes"
import { AdminSidebar } from "../../components/admin-sidebar"
import { Footer } from "../../components/footer"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const { theme } = useTheme()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Protect the admin route
  useEffect(() => {
    setMounted(true)
    if (!user) {
      router.push("/login")
    } else if (user.role !== "admin") {
      router.push("/dashboard")
    }
  }, [user, router])

  if (!mounted || !user || user.role !== "admin") {
    return null // Don't render anything while checking authentication
  }

  return (
    <div className={`min-h-screen flex ${theme === "dark" ? "dark" : ""}`}>
      <AdminSidebar onCollapsedChange={setSidebarCollapsed} />

      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
          ml-0 w-full overflow-x-hidden`}
      >
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Admin Dashboard</h1>
        </header>

        <main className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>

        <Footer />
      </div>
    </div>
  )
}
