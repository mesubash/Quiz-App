"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "../../contexts/AuthContext"
import { useLogout } from "@/app/contexts/LogoutContext"
import { useTheme } from "next-themes"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  HelpCircle,
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  MoreVertical,
  BarChart,
  X,
} from "lucide-react"

interface AdminSidebarProps {
  onCollapsedChange?: (collapsed: boolean) => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export function AdminSidebar({ 
  onCollapsedChange,
  mobileOpen,
  onMobileClose 
}: AdminSidebarProps) {
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
      href: "/admin",
    },
    {
      title: "Users",
      icon: Users,
      href: "/admin/users",
    },
    {
      title: "Quizzes",
      icon: BookOpen,
      href: "/admin/quizzes",
    },
    {
      title: "Analytics",
      icon: BarChart,
      href: "/admin/analytics",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/admin/settings",
    },
  ]

  if (!mounted) {
    return null
  }

  return (
    <aside
    className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out
      ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
      lg:translate-x-0
      ${collapsed || isMobile ? "lg:w-20" : "lg:w-64"}
      ${isMobile ? "w-20" : "w-64"}`}
  >
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link
          href="/admin"
          className={`flex items-center ${collapsed || isMobile ? "justify-center" : "justify-start"} flex-1`}
        >
          <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 text-white">
            <LayoutDashboard className={`${collapsed || isMobile ? "h-6 w-6" : "h-5 w-5"}`} />
          </div>
          {!(collapsed || isMobile) && (
            <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
              Admin Panel
            </span>
          )}
        </Link>
        {/* Close button for mobile */}
        {mobileOpen && (
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        {/* Collapse button for desktop */}
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
          <ul className={`${collapsed || isMobile ? "space-y-3" : "space-y-2"}`}>
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={isMobile ? toggleMobileMenu : undefined}
                  className={`flex items-center ${
                    collapsed || isMobile ? "p-3" : "px-4 py-3"
                  } rounded-lg transition-all duration-200 ${
                    pathname === item.href
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 hover:scale-105"
                  } ${collapsed || isMobile ? "justify-center" : ""}`}
                  title={collapsed || isMobile ? item.title : undefined}
                >
                  <item.icon
                    className={`${
                      collapsed || isMobile ? "h-6 w-6" : "h-5 w-5"
                    } transition-transform duration-200`}
                  />
                  {!(collapsed || isMobile) && <span className="ml-3">{item.title}</span>}
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
                className={`flex items-center w-full ${
                  collapsed || isMobile ? "p-3" : "p-3"
                } rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 transition-all duration-200 ${
                  collapsed || isMobile ? "justify-center" : "justify-between"
                }`}
                title={collapsed || isMobile ? user?.email || "Admin" : undefined}
              >
                <div className="flex items-center">
                  <div
                    className={`flex-shrink-0 ${
                      collapsed || isMobile ? "h-9 w-9" : "h-8 w-8"
                    } rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-semibold transition-all duration-200 hover:scale-105`}
                  >
                    {user?.email?.[0]?.toUpperCase() || "A"}
                  </div>
                  {!(collapsed || isMobile) && (
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                        {user?.email || "Admin"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                        {user?.email}
                      </p>
                    </div>
                  )}
                </div>
                {!(collapsed || isMobile) && (
                  <MoreVertical className="h-5 w-5" />
                )}
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
                    href="/admin/settings"
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
                    Toggle Theme
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4 ml-2" />
                    ) : (
                      <Moon className="h-4 w-4 ml-2" />
                    )}
                  </button>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="outline-none">
                  <Link
                    href="/admin/help"
                    className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help
                  </Link>
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