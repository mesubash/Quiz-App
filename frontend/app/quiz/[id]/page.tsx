"use client"

import { use } from "react"
import Link from "next/link"
import { Brain, Users, Clock, Star, ChevronRight } from "lucide-react"
import { ThemeToggle } from "@/app/components/theme-toggle"

export default function QuizDetails({ params }: { params: { id: string } }) {
  const id = use(Promise.resolve(params.id))

  // Mock quiz data - replace with actual API call
  const quiz = {
    id: parseInt(id),
    title: "Web Development Fundamentals",
    description: "Test your knowledge of HTML, CSS, and JavaScript basics. This comprehensive quiz covers everything from basic syntax to advanced concepts in modern web development.",
    category: "Technology",
    participants: 2500,
    timeLimit: 30,
    difficulty: "Beginner",
    sections: [
      "HTML Basics",
      "CSS Styling",
      "JavaScript Fundamentals",
      "DOM Manipulation",
    ],
    requirements: [
      "Basic understanding of web technologies",
      "Familiarity with programming concepts",
      "Access to a modern web browser",
    ],
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
              <Link
                href="/login"
                className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:opacity-90 px-6 py-2 rounded-full text-sm font-medium transition-opacity"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Quiz Details */}
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  {quiz.category}
                </span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Quiz #{quiz.id}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{quiz.title}</h1>
              <p className="text-gray-600 dark:text-gray-300">{quiz.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Participants</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{quiz.participants.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Time Limit</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{quiz.timeLimit} minutes</p>
                </div>
              </div>
              <div className="flex items-center">
                <Star className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Difficulty</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{quiz.difficulty}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quiz Sections</h2>
                <ul className="space-y-3">
                  {quiz.sections.map((section, index) => (
                    <li key={index} className="flex items-center text-gray-600 dark:text-gray-300">
                      <ChevronRight className="h-4 w-4 text-purple-600 dark:text-purple-400 mr-2" />
                      {section}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Requirements</h2>
                <ul className="space-y-3">
                  {quiz.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-center text-gray-600 dark:text-gray-300">
                      <ChevronRight className="h-4 w-4 text-purple-600 dark:text-purple-400 mr-2" />
                      {requirement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-center">
              <Link
                href={`/quiz/${quiz.id}/start`}
                className="inline-flex items-center px-8 py-3 rounded-full text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 transition-opacity font-semibold text-lg"
              >
                Start Quiz
                <ChevronRight className="h-5 w-5 ml-2" />
              </Link>
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
            &copy; {new Date().getFullYear()} QuizMaster. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
