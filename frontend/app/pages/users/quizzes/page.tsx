"use client"

import React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { quizService } from "@/app/services/api"
import { Search, Filter, Clock, BookOpen, Tag, ChevronDown } from "lucide-react"
import DashboardLayout from "../dashboard/layout"

type Quiz = {
  id: string;
  title: string;
  description: string;
  category: string;
  timeLimitMinutes: number;
  questions: any[];
}

type Category = {
  id: string;
  name: string;
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [visibleQuizzes, setVisibleQuizzes] = useState(6)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch quizzes
        const quizData = await quizService.getAllQuizzes()
        setQuizzes(quizData)
        setFilteredQuizzes(quizData)

        // Fetch categories using getAllCategories
        const categoryData: string[] = await quizService.getAllCategories()
        // Normalize categories: remove null/undefined, handle case-insensitive duplicates
        const normalizedCategories = Array.from(
          new Set(
            categoryData
              .filter((cat: string | null) => cat && cat.trim() !== "") // Remove null/empty
              .map((cat: string) => cat.toLowerCase()) // Normalize to lowercase
          )
        ).map((cat, index) => ({
          id: `cat-${index}-${cat.replace(/\s+/g, '-')}`,
          name: cat.charAt(0).toUpperCase() + cat.slice(1) // Capitalize first letter
        }))
        setCategories([{ id: "all", name: "All Categories" }, ...normalizedCategories])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    // Filter quizzes based on category and search term
    const filtered = quizzes.filter((quiz) => {
      const matchesCategory =
        selectedCategory === "All Categories" || // Match all quizzes for "All Categories"
        (quiz.category && quiz.category.toLowerCase() === selectedCategory.toLowerCase());
      const matchesSearch =
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  
    setFilteredQuizzes(filtered);
    setVisibleQuizzes(6); // Reset visible quizzes when filters change
  }, [selectedCategory, searchTerm, quizzes]);

  const loadMoreQuizzes = () => {
    setVisibleQuizzes((prev) => prev + 6)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[70vh] bg-gray-100 dark:bg-gray-900">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading quizzes...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const displayedQuizzes = filteredQuizzes.slice(0, visibleQuizzes)
  const hasMoreQuizzes = filteredQuizzes.length > visibleQuizzes

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Browse Quizzes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore our collection of quizzes to test your knowledge
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                id="search"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                placeholder="Search quizzes by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search quizzes"
              />
            </div>

            {/* Category Filter */}
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="w-5 h-5 text-gray-400" aria-hidden="true" />
              </div>
              <select
                id="category"
                className="w-full pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none transition-all"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by category"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Quiz Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedQuizzes.length > 0 ? (
            <>
              {displayedQuizzes.map((quiz, index) => (
                <div
                  key={quiz.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transform transition-all hover:scale-105 hover:shadow-lg animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {quiz.title}
                      </h2>
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 rounded-full flex items-center">
                        <Tag className="w-3 h-3 mr-1" />
                        {quiz.category}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-3">
                      {quiz.description}
                    </p>
                    <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {quiz.timeLimitMinutes} min
                      </span>
                      <span className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {quiz.questions.length} questions
                      </span>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      href={`/quizzes/${quiz.id}/attempt`}
                      className="block w-full text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                      aria-label={`Start quiz: ${quiz.title}`}
                    >
                      Start Quiz
                    </Link>
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {hasMoreQuizzes && (
                <div className="col-span-full flex justify-center mt-6">
                  <button
                    onClick={loadMoreQuizzes}
                    className="flex items-center px-6 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 dark:text-purple-200 rounded-lg transition-colors focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    aria-label="Load more quizzes"
                  >
                    <span>Load More Quizzes</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </button>
                </div>
              )}

              {/* No More Quizzes Message */}
              {!hasMoreQuizzes && filteredQuizzes.length > 6 && (
                <div className="col-span-full text-center py-6">
                  <p className="text-gray-500 dark:text-gray-400">
                    No more quizzes available
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No quizzes found matching your criteria
              </p>
              <button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("All")
                }}
                className="text-purple-600 dark:text-purple-400 hover:underline focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded"
                aria-label="Clear all filters"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Custom CSS for Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </DashboardLayout>
  )
}