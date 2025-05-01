"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "../../../contexts/AuthContext"
import { useTheme } from "next-themes"
import { useLogout } from "@/app/contexts/LogoutContext"
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
  User,
} from "lucide-react"

interface SidebarProps {
  onCollapsedChange?: (collapsed: boolean) => void
}

export function Sidebar({ onCollapsedChange }: SidebarProps) {
  const { user, logout } = useAuth()
  const { openLogoutModal } = useLogout()
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  const toggleCollapsed = () => {
    setCollapsed(!collapsed)
    onCollapsedChange?.(!collapsed)
  }

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleLogout = () => {
    logout()
  }

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      title: "My Quizzes",
      icon: BookOpen,
      href: "/my-quizzes",
    },
    {
      title: "Leaderboard",
      icon: Trophy,
      href: "/leaderboard",
    },
    {
      title: "Analytics",
      icon: BarChart,
      href: "/analytics",
    },
    {
      title: "Messages",
      icon: MessageSquare,
      href: "/messages",
    },
    {
      title: "Help",
      icon: HelpCircle,
      href: "/help",
    },
  ]

  if (!mounted) {
    return null
  }

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      } ${collapsed ? "lg:w-20" : "lg:w-64"}`}
    >
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 p-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 z-50"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Sidebar Content */}
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <Link
            href="/"
            className={`flex items-center ${collapsed ? "justify-center" : "justify-start"}`}
          >
            <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 text-white">
              <BookOpen className="h-6 w-6" />
            </div>
            {!collapsed && (
              <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
                QuizMaster
              </span>
            )}
          </Link>
          <button
            onClick={toggleCollapsed}
            className="hidden lg:block p-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    pathname === item.href
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <item.icon className="h-5 w-5" />
                  {!collapsed && <span className="ml-3">{item.title}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className={`flex items-center w-full p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                  collapsed ? "justify-center" : "justify-between"
                }`}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-semibold">
                    {user?.email?.[0] || "U"}
                  </div>
                  {!collapsed && (
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.email || "User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>
                  )}
                </div>
                {!collapsed && <MoreVertical className="h-5 w-5" />}
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[220px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-[100]"
                sideOffset={5}
                align="end"
              >
                <DropdownMenu.Item className="outline-none">
                  <Link
                    href="/profile"
                    className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="outline-none">
                  <Link
                    href="/settings"
                    className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="outline-none">
                  <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4 mr-2" />
                    ) : (
                      <Moon className="h-4 w-4 mr-2" />
                    )}
                    Toggle Theme
                  </button>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
                <DropdownMenu.Item className="outline-none">
                  <button
                    onClick={openLogoutModal}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </div>
  )
}
