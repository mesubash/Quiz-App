"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { quizService } from "@/app/services/api"
import { Search, Filter, Clock, BookOpen, Tag, ChevronDown } from "lucide-react"

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [filteredQuizzes, setFilteredQuizzes] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [visibleQuizzes, setVisibleQuizzes] = useState(6)

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await quizService.getAllQuizzes()
        setQuizzes(data)
        setFilteredQuizzes(data)

        // Extract unique categories
        const uniqueCategories = Array.from(new Set(data.map((quiz: any) => quiz.category)))
        setCategories(uniqueCategories as string[])
      } catch (error) {
        console.error("Error fetching quizzes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuizzes()
  }, [])

  useEffect(() => {
    // Filter quizzes based on category and search term
    const filtered = quizzes.filter((quiz) => {
      const matchesCategory = selectedCategory === "All" || quiz.category === selectedCategory
      const matchesSearch =
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    })

    setFilteredQuizzes(filtered)
    // Reset visible quizzes when filters change
    setVisibleQuizzes(6)
  }, [selectedCategory, searchTerm, quizzes])

  const loadMoreQuizzes = () => {
    setVisibleQuizzes((prev) => prev + 6)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading quizzes...</p>
        </div>
      </div>
    )
  }

  const displayedQuizzes = filteredQuizzes.slice(0, visibleQuizzes)
  const hasMoreQuizzes = filteredQuizzes.length > visibleQuizzes

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Browse Quizzes</h1>
        <p className="text-gray-600 dark:text-gray-400">Choose from our selection of quizzes to test your knowledge</p>
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
                <option value="All">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedQuizzes.length > 0 ? (
          <>
            {displayedQuizzes.map((quiz) => (
              <div key={quiz.id} className="card overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{quiz.title}</h2>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 rounded-full flex items-center">
                      <Tag className="w-3 h-3 mr-1" />
                      {quiz.category}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-3">{quiz.description}</p>
                  <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {quiz.timeLimit} min
                    </span>
                    <span className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {quiz.questions.length} questions
                    </span>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    href={`/dashboard/quiz/${quiz.id}`}
                    className="btn-primary w-full flex justify-center items-center hover:bg-blue-700 transition-colors duration-200"
                  >
                    Start Quiz
                  </Link>
                </div>
              </div>
            ))}

            {/* Load more button */}
            {hasMoreQuizzes && (
              <div className="col-span-full flex justify-center mt-4">
                <button
                  onClick={loadMoreQuizzes}
                  className="flex items-center px-6 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-200 rounded-lg transition-colors duration-200"
                >
                  <span>Load More Quizzes</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </button>
              </div>
            )}

            {/* No more quizzes message */}
            {!hasMoreQuizzes && filteredQuizzes.length > 6 && (
              <div className="col-span-full text-center py-4">
                <p className="text-gray-500 dark:text-gray-400">No more quizzes available</p>
              </div>
            )}
          </>
        ) : (
          <div className="col-span-full text-center py-12 card">
            <p className="text-gray-500 dark:text-gray-400">No quizzes found matching your criteria</p>
            <button
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("All")
              }}
              className="mt-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

