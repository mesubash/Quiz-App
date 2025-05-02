"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { userService } from "@/app/services/api"
import { Search, Filter, Clock, Target, Award, ChevronDown, BarChart } from "lucide-react"
import DashboardLayout from "../dashboard/layout"

type QuizAttempt = {
  id: string
  quizId: string
  quizTitle: string
  score: number
  completedAt: string
  timeSpent: number
  totalQuestions: number
  correctAnswers: number
  category: string
}

export default function MyQuizzesPage() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [filteredAttempts, setFilteredAttempts] = useState<QuizAttempt[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [visibleAttempts, setVisibleAttempts] = useState(6)
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([])

  useEffect(() => {
    const fetchQuizAttempts = async () => {
      try {
        const data = await userService.getQuizHistory()
        setAttempts(data)
        setFilteredAttempts(data)

        const uniqueCategories = Array.from(
          new Set(data.map((attempt: QuizAttempt) => attempt.category))
        ).map((category) => ({
          id: String(category).toLowerCase().replace(/\s+/g, '-'),
          name: String(category)
        }))
        setCategories(uniqueCategories)
      } catch (error) {
        console.error("Error fetching quiz attempts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuizAttempts()
  }, [])

  useEffect(() => {
    const filtered = attempts.filter((attempt) => {
      const matchesCategory = selectedCategory === "All" || attempt.category === selectedCategory
      const matchesSearch = attempt.quizTitle.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    })

    setFilteredAttempts(filtered)
    setVisibleAttempts(6)
  }, [selectedCategory, searchTerm, attempts])

  const loadMoreAttempts = () => {
    setVisibleAttempts((prev) => prev + 6)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading quiz history...</p>
        </div>
      </div>
    )
  }

  const displayedAttempts = filteredAttempts.slice(0, visibleAttempts)
  const hasMoreAttempts = filteredAttempts.length > visibleAttempts
  const content = (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Quiz History</h1>
        <p className="text-gray-600 dark:text-gray-400">Track your progress and review past quiz attempts</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 mr-4">
              <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Quizzes Taken</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{attempts.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-4">
              <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {attempts.length > 0
                  ? `${Math.round(
                      attempts.reduce((acc, curr) => acc + curr.score, 0) / attempts.length
                    )}%`
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 mr-4">
              <BarChart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Best Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {attempts.length > 0
                  ? `${Math.max(...attempts.map(a => a.score))}%`
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
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
              className="input pl-10"
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
                id="category"
                className="input pl-10 appearance-none"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option key="all" value="All">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz attempt cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedAttempts.length > 0 ? (
          <>
            {displayedAttempts.map((attempt) => (
              <div key={attempt.id} className="card overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {attempt.quizTitle}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium 
                      ${attempt.score >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
                      attempt.score >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'}`}>
                      {attempt.score}%
                    </span>
                  </div>
                  
                  <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center justify-between">
                      <span>Correct Answers:</span>
                      <span>{attempt.correctAnswers}/{attempt.totalQuestions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Time Spent:</span>
                      <span>{Math.round(attempt.timeSpent / 60)} minutes</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Completed:</span>
                      <span>{new Date(attempt.completedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                  <Link
                    href={`/quiz-attempts/${attempt.id}`}
                    className="btn-secondary w-full flex justify-center items-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}

            {/* Load more button */}
            {hasMoreAttempts && (
              <div className="col-span-full flex justify-center mt-4">
                <button
                  onClick={loadMoreAttempts}
                  className="flex items-center px-6 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-200 rounded-lg transition-colors duration-200"
                >
                  <span>Load More</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="col-span-full text-center py-12 card">
            <p className="text-gray-500 dark:text-gray-400">No quiz attempts found</p>
            <Link
              href="/quizzes"
              className="mt-4 btn-primary inline-flex items-center"
            >
              Take Your First Quiz
            </Link>
          </div>
        )}
      </div>
    </div>
  )

  return <DashboardLayout>{content}</DashboardLayout>
    
}