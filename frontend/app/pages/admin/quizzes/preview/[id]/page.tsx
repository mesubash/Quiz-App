"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, ChevronDown, X } from "lucide-react"
import { quizService } from "@/app/services/api"
import { QuestionType } from "@/app/types/quiz"

interface Toast {
  id: string
  message: string
  type: "success" | "error"
}

interface Quiz {
  id: string
  title: string
  description: string
  category: string
  timeLimitMinutes: number
  isPublished: boolean
  questions: {
    text: string
    questionType: QuestionType
    isMultipleCorrect: boolean
    difficulty: "EASY" | "MEDIUM" | "HARD"
    explanation: string
    options: { text: string; isCorrect: boolean }[]
  }[]
}

export default function QuizPreviewPage() {
  const router = useRouter()
  const params = useParams()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true)
        const quizData = await quizService.getQuizById(Number(quizId))
        setQuiz(quizData)
      } catch (error) {
        console.error("Error fetching quiz:", error)
        addToast("Failed to load quiz. Please try again.", "error")
      } finally {
        setLoading(false)
      }
    }

    if (quizId) {
      fetchQuiz()
    } else {
      addToast("Invalid quiz ID.", "error")
      router.push("/admin/quizzes")
    }
  }, [quizId, router])

  // Auto-remove toast after 5 seconds
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((prev) => prev.slice(1))
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [toasts])

  const addToast = (message: string, type: "success" | "error") => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
  }
  const handleBackClick = () => {
    router.push("/admin/quizzes")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading quiz preview...</p>
        </div>
      </div>
    )
  }

  const getDifficultyBadgeColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading quiz data...</p>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
          <p className="text-red-600 dark:text-red-400">Quiz not found.</p>
          <button
            onClick={handleBackClick}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center p-4 rounded-lg shadow-lg transform transition-all duration-300 animate-slide-in ${
              toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-4 text-white hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quiz Preview</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Preview the quiz as it will appear to users
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/quizzes")}
          className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Quizzes
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-200 hover:shadow-xl">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{quiz.title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{quiz.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</span>
            <span className="text-gray-900 dark:text-white">{quiz.category}</span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Time Limit
            </span>
            <span className="text-gray-900 dark:text-white">{quiz.timeLimitMinutes} minutes</span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Questions
            </span>
            <span className="text-gray-900 dark:text-white">{quiz.questions.length}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {quiz.questions.map((question, qIndex) => (
          <div
            key={qIndex}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-200 hover:shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Question {qIndex + 1}
              </h3>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getDifficultyBadgeColor(
                  question.difficulty
                )}`}
              >
                {question.difficulty.charAt(0) + question.difficulty.slice(1).toLowerCase()}
              </span>
            </div>
            <p className="text-gray-900 dark:text-white mb-4">{question.text}</p>
            <div className="space-y-3">
              {question.options.map((option, oIndex) => (
                <div
                  key={oIndex}
                  className={`flex items-center p-3 rounded-md border ${
                    option.isCorrect
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <span
                    className={`mr-3 text-sm font-medium ${
                      option.isCorrect
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {String.fromCharCode(65 + oIndex)}.
                  </span>
                  <span
                    className={
                      option.isCorrect
                        ? "text-green-600 dark:text-green-400 font-medium"
                        : "text-gray-900 dark:text-white"
                    }
                  >
                    {option.text}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="relative">
                <button
                  className="flex items-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
                  onClick={() =>
                    document
                      .getElementById(`explanation-${qIndex}`)
                      ?.classList.toggle("hidden")
                  }
                >
                  Show Explanation
                  <ChevronDown className="ml-2 h-4 w-4" />
                </button>
                <div id={`explanation-${qIndex}`} className="hidden mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <span className="text-gray-900 dark:text-white">{question.explanation}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}