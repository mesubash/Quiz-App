"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/app/contexts/AuthContext"
import { useTheme } from "@/app/contexts/ThemeContext"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import {
  Home,
  BookOpen,
  Trophy,
  HelpCircle,
  Menu,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  Sun,
  Moon,
  MoreVertical,
  MessageSquare,
  LayoutDashboard,
  BarChart,
} from "lucide-react"

interface SidebarProps {
  onCollapsedChange?: (collapsed: boolean) => void
}

export function Sidebar({ onCollapsedChange }: SidebarProps) {
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
      path: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      path: "/dashboard/quizzes",
      label: "Quizzes",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      path: "/dashboard/leaderboard",
      label: "Leaderboard",
      icon: <BarChart className="h-5 w-5" />,
    },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white dark:bg-gray-800 shadow-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity" 
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/30 border-r border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300 ease-in-out
          ${isMobile 
            ? `${mobileOpen ? 'translate-x-0' : '-translate-x-full'} w-64` 
            : collapsed ? 'w-20' : 'w-64'
          }
        `}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <Link 
            href="/dashboard" 
            className={`flex items-center ${collapsed && !isMobile ? "justify-center w-full" : ""}`}
            onClick={isMobile ? closeMobileSidebar : undefined}
          >
            <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold text-xl">
              Q
            </div>
            {(!collapsed || isMobile) && (
              <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white truncate">QuizMaster</span>
            )}
          </Link>

          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-gray-500" />
              )}
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const isActive = pathname === item.path
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    onClick={isMobile ? closeMobileSidebar : undefined}
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors
                      ${isActive 
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-200" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }
                      ${collapsed && !isMobile ? "justify-center" : ""}
                    `}
                  >
                    {item.icon}
                    {(!collapsed || isMobile) && (
                      <span className="ml-3 truncate">{item.label}</span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className={`flex items-center ${collapsed && !isMobile ? "justify-center" : ""}`}>
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
            {(!collapsed || isMobile) && (
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            )}
            
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  aria-label="User menu"
                >
                  <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="min-w-[200px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1.5 z-50"
                  sideOffset={5}
                  align="end"
                >
                  <DropdownMenu.Item asChild>
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Profile Settings
                    </Link>
                  </DropdownMenu.Item>

                  <DropdownMenu.Item
                    className="flex items-center px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors cursor-pointer"
                    onClick={toggleTheme}
                  >
                    {isDarkMode ? (
                      <>
                        <Sun className="h-4 w-4 mr-2" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4 mr-2" />
                        Dark Mode
                      </>
                    )}
                  </DropdownMenu.Item>

                  <DropdownMenu.Item asChild>
                    <Link
                      href="/dashboard/help"
                      className="flex items-center px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Get Help
                    </Link>
                  </DropdownMenu.Item>

                  <DropdownMenu.Item asChild>
                    <Link
                      href="/dashboard/feedback"
                      className="flex items-center px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Feedback
                    </Link>
                  </DropdownMenu.Item>

                  <DropdownMenu.Separator className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

                  <DropdownMenu.Item
                    className="flex items-center px-2 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors cursor-pointer"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </aside>
    </>
  )
}
