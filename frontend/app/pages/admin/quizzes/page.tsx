"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { quizService } from "@/app/services/api"
import { Search, Filter, Plus, Edit, Trash2, Eye, Clock, X } from "lucide-react"

// Match backend data structure
interface QuizOption {
  id: number
  text: string
  isCorrect: boolean
}

interface QuizQuestion {
  id: number
  text: string
  options: QuizOption[]
}

interface Quiz {
  id: number
  title: string
  description: string
  timeLimitMinutes: number
  isPublished: boolean
  difficulty: string
  questions: QuizQuestion[]
  createdById?: number
}

type Toast = {
  id: string
  message: string
  type: "success" | "error"
}

type ConfirmDialog = {
  isOpen: boolean
  quizId: number | null
}

export default function ManageQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([])
  const [difficulties, setDifficulties] = useState<string[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({ isOpen: false, quizId: null })

  // Fetch quizzes on mount
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true)
        const data = await quizService.getAllQuizzes()
        console.log("Quiz API response:", data)

        if (!data || !Array.isArray(data)) {
          console.error("API did not return an array", data)
          setError("Failed to load quizzes: Invalid data format")
          setQuizzes([])
          setFilteredQuizzes([])
          return
        }

        setQuizzes(data)
        setFilteredQuizzes(data)

        const uniqueDifficulties = Array.from(
          new Set(data.map((quiz: Quiz) => quiz.difficulty).filter(Boolean))
        )
        setDifficulties(uniqueDifficulties as string[])
        setError(null)
      } catch (error) {
        console.error("Error fetching quizzes:", error)
        setError("Failed to load quizzes. Please try again.")
        setQuizzes([])
        setFilteredQuizzes([])
      } finally {
        setLoading(false)
      }
    }

    fetchQuizzes()
  }, [])

  // Filter quizzes based on difficulty and search term
  useEffect(() => {
    const filtered = quizzes.filter((quiz) => {
      const matchesDifficulty = selectedDifficulty === "All" || quiz.difficulty === selectedDifficulty
      const matchesSearch =
        (quiz.title && quiz.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase()))
      return matchesDifficulty && matchesSearch
    })

    setFilteredQuizzes(filtered)
  }, [selectedDifficulty, searchTerm, quizzes])

  // Auto-remove toasts after 5 seconds
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((prev) => prev.slice(1))
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [toasts])

  // Add a toast notification
  const addToast = (message: string, type: "success" | "error") => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
  }

  // Handle delete quiz with confirmation dialog
  const handleDeleteQuiz = (id: number) => {
    setConfirmDialog({ isOpen: true, quizId: id })
  }

  const confirmDelete = async () => {
    if (!confirmDialog.quizId) return

    try {
      await quizService.deleteQuiz(confirmDialog.quizId)
      setQuizzes(quizzes.filter((quiz) => quiz.id !== confirmDialog.quizId))
      addToast("Quiz deleted successfully", "success")
    } catch (error) {
      console.error("Error deleting quiz:", error)
      addToast("Failed to delete quiz. Please try again.", "error")
    } finally {
      setConfirmDialog({ isOpen: false, quizId: null })
    }
  }

  const cancelDelete = () => {
    setConfirmDialog({ isOpen: false, quizId: null })
  }

  // Format difficulty string for display
  const formatDifficulty = (difficulty: string) => {
    if (!difficulty) return "Unknown"
    return difficulty.charAt(0) + difficulty.slice(1).toLowerCase()
  }

  // Get badge color based on difficulty
  const getDifficultyBadgeColor = (difficulty: string) => {
    if (!difficulty) return "bg-gray-100 text-gray-800"

    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading quizzes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4 text-lg">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center p-4 rounded-lg shadow-lg transform transition-all duration-300 animate-slide-in ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
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

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-4">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md w-full transform transition-all duration-300 animate-slide-down border border-red-500/50">
            <div className="flex items-center mb-4">
              <svg className="h-6 w-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                Confirm Deletion
              </h3>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this quiz? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Manage Quizzes</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredQuizzes.length} {filteredQuizzes.length === 1 ? "quiz" : "quizzes"} available
          </p>
        </div>
        <Link
          href="/admin/quizzes/create-quiz"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Quiz
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="search"
              className="input pl-10 w-full"
              placeholder="Search quizzes by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full md:w-64">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="w-5 h-5 text-gray-400" />
              </div>
              <select
                id="difficulty"
                className="input pl-10 appearance-none w-full"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              >
                <option value="All">All Difficulties</option>
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {formatDifficulty(difficulty)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Quizzes Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Title
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Difficulty
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Questions
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Time Limit
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredQuizzes.length > 0 ? (
                filteredQuizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {quiz.title || "Untitled Quiz"}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                          {quiz.description || "No description"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyBadgeColor(quiz.difficulty)}`}>
                        {formatDifficulty(quiz.difficulty)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        quiz.isPublished 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}>
                        {quiz.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {quiz.questions && quiz.questions.length > 0 
                        ? `${quiz.questions.length} ${quiz.questions.length === 1 ? "question" : "questions"}` 
                        : "0 questions"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-1 text-gray-400" />
                        {quiz.timeLimitMinutes || 0} min
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <div className="flex justify-center space-x-3">
                        <Link
                          href={`/admin/quizzes/preview/${quiz.id}`}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Preview"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        <Link
                          href={`/admin/quizzes/edit-quiz/${quiz.id}`}
                          className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                          title="Edit"
                        >

                          <Edit className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No quizzes found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}