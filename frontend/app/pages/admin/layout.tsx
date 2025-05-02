"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../contexts/AuthContext"
import { useTheme } from "next-themes"
import { AdminSidebar } from "./sidebar"
import { Footer } from "../../components/footer"
import { Sun, Moon, Menu } from "lucide-react" // Import icons from lucide-react

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Temporary development bypass
  const DEV_MODE = true // Set to true for development

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!authLoading && mounted) {
      if (!user) {
        console.log("No user found, redirecting to login")
        router.push("/login")
      } else if (user.role !== "ADMIN" && user.role !== "admin") {
        // Using AND operator and checking both cases
        console.log(user)
        console.log(user.role)
        console.log("User is not an admin, redirecting to dashboard")
        router.push("/dashboard")
      }
    }
  }, [user, authLoading, mounted, router])

  if (authLoading || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Checking credentials...</p>
        </div>
      </div>
    )
  }

  if (!DEV_MODE && (!user || user.role !== "admin")) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex ${theme === "dark" ? "dark" : ""}`}>
    {/* Mobile menu overlay */}
    {mobileMenuOpen && (
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={() => setMobileMenuOpen(false)}
      />
    )}

    <AdminSidebar 
      onCollapsedChange={setSidebarCollapsed}
      mobileOpen={mobileMenuOpen}
      onMobileClose={() => setMobileMenuOpen(false)}
    />

    <div
      className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
        ml-0 w-full`}
    >
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        {/* Left side - Mobile menu button */}
        <div className="flex items-center">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
        </div>

        {/* Right side - Theme toggle */}
        <div className="flex items-center">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </header>
        <main className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
        <Footer />
      </div>
    </div>
  )
}