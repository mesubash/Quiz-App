"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { quizService } from "@/app/services/api"
import { Search, Filter, Plus, Edit, Trash2, Eye, Clock } from "lucide-react"

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
  timeLimitMinutes: number // Backend uses timeLimitMinutes
  isPublished: boolean
  difficulty: string // Backend uses difficulty enum
  questions: QuizQuestion[]
  createdById?: number
}

export default function ManageQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([])
  const [difficulties, setDifficulties] = useState<string[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true)
        const data = await quizService.getAllQuizzes()
        
        // Debug the API response
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

        // Extract unique difficulties
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

  useEffect(() => {
    // Filter quizzes based on difficulty and search term
    const filtered = quizzes.filter((quiz) => {
      const matchesDifficulty = selectedDifficulty === "All" || quiz.difficulty === selectedDifficulty
      const matchesSearch =
        (quiz.title && quiz.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase()))
      return matchesDifficulty && matchesSearch
    })

    setFilteredQuizzes(filtered)
  }, [selectedDifficulty, searchTerm, quizzes])

  const handleDeleteQuiz = async (id: number) => {
    if (confirm("Are you sure you want to delete this quiz?")) {
      try {
        // Call API to delete quiz
        await quizService.deleteQuiz(id)
        
        // Update local state
        setQuizzes(quizzes.filter((quiz) => quiz.id !== id))
        alert("Quiz deleted successfully")
      } catch (error) {
        console.error("Error deleting quiz:", error)
        alert("Failed to delete quiz. Please try again.")
      }
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Manage Quizzes</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredQuizzes.length} {filteredQuizzes.length === 1 ? "quiz" : "quizzes"} available
          </p>
        </div>
        <Link
          href="/admin/create-quiz"
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
                          href={`/admin/quizzes/edit/${quiz.id}`}
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
    </div>
  )
}