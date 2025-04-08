"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/app/contexts/AuthContext"
import { Brain, Users, Clock, Tag, ChevronLeft, Star, Trophy, BookOpen } from "lucide-react"
import { ThemeToggle } from "@/app/components/theme-toggle"

export default function QuizDetails({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const [isStarting, setIsStarting] = useState(false)

  // Mock quiz data - replace with actual API call
  const quiz = {
    id: parseInt(params.id),
    title: "Web Development Fundamentals",
    description: "Test your knowledge of HTML, CSS, and JavaScript basics. This comprehensive quiz covers everything from basic syntax to advanced concepts in modern web development.",
    category: "Technology",
    participants: 1234,
    duration: "20 min",
    difficulty: "Beginner",
    tags: ["HTML", "CSS", "JavaScript"],
    totalQuestions: 20,
    topScore: 98,
    requirements: [
      "Basic understanding of web technologies",
      "Familiarity with HTML structure",
      "Knowledge of CSS selectors",
    ],
    sections: [
      "HTML Fundamentals",
      "CSS Styling",
      "JavaScript Basics",
      "DOM Manipulation",
    ],
    createdBy: "John Doe",
    lastUpdated: "2025-03-15",
  }

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-purple-900/30">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Please login to view this quiz</h1>
          <Link
            href={`/login?redirect=/quiz/${params.id}`}
            className="inline-flex items-center px-6 py-3 rounded-full text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 transition-opacity font-semibold"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-purple-900/30">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/browse-quizzes" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back to Quizzes
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Quiz Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-purple-600 dark:text-purple-400 font-semibold capitalize">
                {quiz.category}
              </div>
              <div className={`text-sm px-3 py-1.5 rounded-full ${getDifficultyColor(quiz.difficulty)}`}>
                {quiz.difficulty}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{quiz.title}</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{quiz.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <Users className="h-5 w-5 mr-2" />
                <span>{quiz.participants.toLocaleString()} participants</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <Clock className="h-5 w-5 mr-2" />
                <span>{quiz.duration}</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <BookOpen className="h-5 w-5 mr-2" />
                <span>{quiz.totalQuestions} questions</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <Trophy className="h-5 w-5 mr-2" />
                <span>Top score: {quiz.topScore}%</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {quiz.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-1.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                >
                  <Tag className="h-4 w-4 mr-1" />
                  {tag}
                </span>
              ))}
            </div>

            <button
              onClick={() => setIsStarting(true)}
              disabled={isStarting}
              className="w-full md:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStarting ? "Preparing Quiz..." : "Start Quiz"}
            </button>
          </div>

          {/* Quiz Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Requirements */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Requirements</h2>
              <ul className="space-y-3">
                {quiz.requirements.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <Star className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sections */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quiz Sections</h2>
              <ul className="space-y-3">
                {quiz.sections.map((section, index) => (
                  <li key={index} className="flex items-start">
                    <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">{section}</span>
                  </li>
                ))}
              </ul>
            </div>
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
              <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Contact
              </Link>
              <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Terms
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} QuizMaster. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
