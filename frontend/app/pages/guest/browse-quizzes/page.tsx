"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/app/users/contexts/AuthContext"
import { Brain, Search, Users, Clock, Tag, ChevronRight, Filter } from "lucide-react"
import { ThemeToggle } from "@/app/components/theme-toggle"

export default function BrowseQuizzes() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "tech", name: "Technology" },
    { id: "science", name: "Science" },
    { id: "history", name: "History" },
    { id: "arts", name: "Arts & Literature" },
    { id: "sports", name: "Sports" },
  ]

  // Sample quiz data - replace with actual API call
  const quizzes = [
    {
      id: 1,
      title: "Web Development Fundamentals",
      description: "Test your knowledge of HTML, CSS, and JavaScript basics.",
      category: "tech",
      participants: 1234,
      duration: "20 min",
      difficulty: "Beginner",
      tags: ["HTML", "CSS", "JavaScript"],
    },
    {
      id: 2,
      title: "Space Exploration",
      description: "Journey through the cosmos with this space science quiz.",
      category: "science",
      participants: 856,
      duration: "15 min",
      difficulty: "Intermediate",
      tags: ["Astronomy", "NASA", "Space"],
    },
    {
      id: 3,
      title: "World War II",
      description: "Test your knowledge about World War II events and figures.",
      category: "history",
      participants: 2341,
      duration: "25 min",
      difficulty: "Advanced",
      tags: ["History", "War", "Politics"],
    },
    {
      id: 4,
      title: "Classical Literature",
      description: "Explore the world of classical literature and authors.",
      category: "arts",
      participants: 567,
      duration: "30 min",
      difficulty: "Intermediate",
      tags: ["Books", "Authors", "Classics"],
    },
    {
      id: 5,
      title: "Olympic History",
      description: "Test your knowledge of Olympic games and champions.",
      category: "sports",
      participants: 789,
      duration: "15 min",
      difficulty: "Beginner",
      tags: ["Olympics", "Athletes", "Sports"],
    },
  ]

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || quiz.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30"
      case "intermediate":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30"
      case "advanced":
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30"
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-purple-900/30">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 text-white">
                  <Brain className="h-6 w-6" />
                </div>
                <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">QuizMaster</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {!user && (
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:opacity-90 px-6 py-2 rounded-full text-sm font-medium transition-opacity"
                >
                  Join Now
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and Filter Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1 max-w-lg">
                <input
                  type="text"
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <div className="flex items-center gap-4">
                <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quiz Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredQuizzes.map(quiz => (
              <Link
                key={quiz.id}
                href={user ? `/quiz/${quiz.id}` : `/login?redirect=/quiz/${quiz.id}`}
                className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all hover:scale-[1.02]"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-purple-600 dark:text-purple-400 font-semibold capitalize">
                      {quiz.category}
                    </div>
                    <div className={`text-sm px-2 py-1 rounded-full ${getDifficultyColor(quiz.difficulty)}`}>
                      {quiz.difficulty}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {quiz.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{quiz.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {quiz.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Users className="h-4 w-4 mr-1" />
                        {quiz.participants.toLocaleString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-1" />
                        {quiz.duration}
                      </div>
                    </div>
                    <span className="flex items-center text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
                      {user ? "Start Quiz" : "Login to Start"} <ChevronRight className="h-4 w-4 ml-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 text-white">
                <Brain className="h-6 w-6" />
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">QuizMaster</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                About
              </Link>
              <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Contact
              </Link>
              <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Terms
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
            {new Date().getFullYear()} QuizMaster. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
