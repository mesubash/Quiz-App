"use client"

import { useEffect, useState } from "react"
import { Brain } from "lucide-react"

export default function Preloader() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center">
        <div className="relative">
          {/* Outer ring animation */}
          <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/20" />
          <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-purple-600 to-blue-500 opacity-50" />
          
          {/* Logo container */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-500">
            <Brain className="h-8 w-8 text-white animate-bounce" />
          </div>
        </div>
        
        {/* Loading text */}
        <div className="mt-4 flex items-center space-x-2">
          <div className="text-xl font-semibold text-gray-900 dark:text-white">QuizMaster</div>
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400"
                style={{
                  animation: `bounce 1.4s infinite ${i * 0.2}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}
