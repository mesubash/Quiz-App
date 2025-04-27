"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/contexts/AuthContext"
import { AdminSidebar } from "./sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log("Admin layout mounting, user:", user);
    setMounted(true)
    
    // If no user, redirect to login
    if (!user) {
      console.log("No user found, redirecting to login");
      router.push("/login")
      return;
    } 
    
    // Check for admin role (case-insensitive)
    if (user.role && user.role.toLowerCase() !== "admin") {
      console.log("User is not admin, redirecting to dashboard");
      router.push("/dashboard")
    }
  }, [user, router])

  if (!mounted) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
    </div>
  );

  if (!user) return null; // Don't render anything while redirecting

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* AdminSidebar */}
      <AdminSidebar />

      {/* Main content */}
      <div className="flex-1 ml-0 lg:ml-64 p-4 lg:p-8">
        {children}
      </div>
    </div>
  )
}