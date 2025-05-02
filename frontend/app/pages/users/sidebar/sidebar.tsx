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
  X,
} from "lucide-react"

export interface SidebarProps {
  onCollapsedChange: (collapsed: boolean) => void
  onMobileClose: () => void
  mobileOpen: boolean
}

export function Sidebar({
  onCollapsedChange,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const { user, logout } = useAuth()
  const { openLogoutModal } = useLogout()
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
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
    onMobileClose()
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
    <aside
      className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        ${collapsed || isMobile ? "md:w-16" : "md:w-64"}
        ${isMobile ? "w-16" : "w-64"}`}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3">
          <Link
            href="/"
            className={`flex items-center ${collapsed || isMobile ? "justify-center" : "justify-start"} flex-1`}
          >
            <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            {!(collapsed || isMobile) && (
              <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
                QuizMaster
              </span>
            )}
          </Link>
          {/* Close button for mobile */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-1 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
          {/* Collapse button for desktop */}
          <button
            onClick={toggleCollapsed}
            className="hidden md:block p-1 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={isMobile ? toggleMobileMenu : undefined}
                  className={`flex items-center px-2 py-2 rounded-lg transition-colors ${
                    pathname === item.href
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  } ${collapsed || isMobile ? "justify-center" : ""}`}
                  title={collapsed || isMobile ? item.title : undefined}
                >
                  <item.icon className="h-5 w-5" />
                  {!(collapsed || isMobile) && <span className="ml-3 text-sm">{item.title}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Menu */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-800">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className={`flex items-center w-full p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                  collapsed || isMobile ? "justify-center" : "justify-between"
                }`}
                title={collapsed || isMobile ? user?.email || "User" : undefined}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-semibold text-xs">
                    {user?.email?.[0] || "U"}
                  </div>
                  {!(collapsed || isMobile) && (
                    <div className="ml-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                        {user?.email || "User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                        {user?.email}
                      </p>
                    </div>
                  )}
                </div>
                {!(collapsed || isMobile) && <MoreVertical className="h-4 w-4" />}
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[200px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-[100]"
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
    </aside>
  )
}