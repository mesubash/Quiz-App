"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Add a small delay to allow auth context to initialize
    const timer = setTimeout(() => {
      // Use router.push instead of redirect for client components
      router.push("/login")
    }, 500)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Quiz App</h1>
      <p className="mt-4 text-xl">Loading...</p>
    </div>
  )
}

