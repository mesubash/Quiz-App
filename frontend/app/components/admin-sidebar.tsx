"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/app/contexts/AuthContext"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { useTheme } from "@/app/contexts/ThemeContext"
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  BarChart,
  Sun,
  Moon,
  HelpCircle,
  MessageSquare,
  User,
  MoreVertical,
  Brain,
} from "lucide-react"

interface AdminSidebarProps {
  onCollapsedChange?: (collapsed: boolean) => void
}

export function AdminSidebar({ onCollapsedChange }: AdminSidebarProps) {
  const { user, logout } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setCollapsed(true)
        onCollapsedChange?.(true)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [onCollapsedChange])

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen)
    } else {
      const newCollapsed = !collapsed
      setCollapsed(newCollapsed)
      onCollapsedChange?.(newCollapsed)
    }
  }

  const closeMobileSidebar = () => {
    if (isMobile) {
      setMobileOpen(false)
    }
  }

  const menuItems = [
    {
      path: "/admin",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      path: "/admin/quizzes",
      label: "Quizzes",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      path: "/admin/users",
      label: "Users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      path: "/admin/analytics",
      label: "Analytics",
      icon: <BarChart className="h-5 w-5" />,
    },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white dark:bg-gray-800 shadow-md text-gray-600 dark:text-gray-300 focus:outline-none"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeMobileSidebar}></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/30 border-r border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300 ease-in-out ${
          isMobile ? (mobileOpen ? "translate-x-0" : "-translate-x-full") : collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <Link href="/admin" className={`flex items-center ${collapsed && !isMobile ? "justify-center" : ""}`}>
            <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 text-white">
              <Brain className="h-6 w-6" />
            </div>
            {(!collapsed || isMobile) && (
              <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">QuizMaster</span>
            )}
          </Link>

          {/* Toggle button for desktop */}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 focus:outline-none transition-colors duration-200"
            >
              {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center ${collapsed && !isMobile ? "justify-center" : "px-4"} py-2 rounded-md ${
                    pathname === item.path
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-200"
                      : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/30 dark:hover:text-purple-200"
                  } transition-all duration-200`}
                  onClick={closeMobileSidebar}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {(!collapsed || isMobile) && <span className="ml-3">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer with User Profile */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className={`flex ${collapsed && !isMobile ? "justify-center" : "items-center"}`}>
            {!collapsed || isMobile ? (
              <>
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                    {user?.name?.charAt(0).toUpperCase() || "A"}
                  </div>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                </div>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button
                      className="ml-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 focus:outline-none transition-colors duration-200"
                      aria-label="User menu"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      className="min-w-[220px] bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-50"
                      sideOffset={5}
                      align="end"
                    >
                      <DropdownMenu.Item className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        Profile Settings
                      </DropdownMenu.Item>

                      <DropdownMenu.Item
                        onClick={() => toggleTheme()}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
                      >
                        {isDarkMode ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                        {isDarkMode ? "Light Mode" : "Dark Mode"}
                      </DropdownMenu.Item>

                      <DropdownMenu.Item className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Get Help
                      </DropdownMenu.Item>

                      <DropdownMenu.Item className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Feedback
                      </DropdownMenu.Item>

                      <DropdownMenu.Separator className="h-px my-1 bg-gray-200 dark:bg-gray-700" />

                      <DropdownMenu.Item
                        onClick={logout}
                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </>
            ) : (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 focus:outline-none transition-colors duration-200"
                    aria-label="User menu"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="min-w-[220px] bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-50"
                    sideOffset={5}
                    align="end"
                  >
                    {/* User Info */}
                    <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {user?.name?.charAt(0).toUpperCase() || "A"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {user?.name || "Admin"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user?.email || "admin@example.com"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu.Item className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Profile Settings
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                      onClick={() => toggleTheme()}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
                    >
                      {isDarkMode ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                      {isDarkMode ? "Light Mode" : "Dark Mode"}
                    </DropdownMenu.Item>

                    <DropdownMenu.Item className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Get Help
                    </DropdownMenu.Item>

                    <DropdownMenu.Item className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Feedback
                    </DropdownMenu.Item>

                    <DropdownMenu.Separator className="h-px my-1 bg-gray-200 dark:bg-gray-700" />

                    <DropdownMenu.Item
                      onClick={logout}
                      className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
