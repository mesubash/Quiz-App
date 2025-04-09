"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Brain, BookOpen, Users, Award, Trophy, ChevronRight, Code, Globe, Book, Dumbbell } from "lucide-react"
import { ThemeToggle } from "@/app/components/theme-toggle"
import Preloader from "@/app/components/preloader"
import { useTheme } from "next-themes"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const popularQuizzes = [
    {
      id: 1,
      title: "Web Development Fundamentals",
      description: "Test your knowledge of HTML, CSS, and JavaScript basics.",
      category: "Technology",
      icon: Code,
      participants: "2.5k",
      difficulty: "Beginner",
    },
    {
      id: 2,
      title: "World Geography Challenge",
      description: "Explore countries, capitals, and geographical wonders.",
      category: "Geography",
      icon: Globe,
      participants: "1.8k",
      difficulty: "Intermediate",
    },
    {
      id: 3,
      title: "Literature Classics",
      description: "Test your knowledge of famous books and authors.",
      category: "Literature",
      icon: Book,
      participants: "1.2k",
      difficulty: "Advanced",
    },
    {
      id: 4,
      title: "Fitness & Nutrition",
      description: "Learn about healthy living and exercise science.",
      category: "Health",
      icon: Dumbbell,
      participants: "3.1k",
      difficulty: "Intermediate",
    },
  ]

  return (
    <>
      <Preloader />
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

        {/* Hero Section */}
        <div className="pt-32 pb-20 text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Test Your Knowledge with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
                Interactive Quizzes
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
              Join thousands of learners and test your knowledge across various topics. Create an account to track your progress and compete with others.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-full text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 transition-opacity font-semibold text-lg"
              >
                Get Started
              </Link>
              <Link
                href="/browse-quizzes"
                className="w-full sm:w-auto px-8 py-4 rounded-full text-gray-700 dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold text-lg border border-gray-200 dark:border-gray-700"
              >
                Browse Quizzes
              </Link>
            </div>
          </div>
        </div>

        {/* Popular Quizzes Section */}
        <div className="py-20 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Popular Quizzes</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Start with our most engaging challenges
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {popularQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        {quiz.category}
                      </span>
                      <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                        <quiz.icon className="h-4 w-4" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {quiz.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                      {quiz.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          <Users className="h-4 w-4 inline mr-1" />
                          {quiz.participants}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {quiz.difficulty}
                        </span>
                      </div>
                      <Link
                        href={`/quiz/${quiz.id}`}
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium inline-flex items-center"
                      >
                        Take Quiz
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/browse-quizzes"
                className="inline-flex items-center px-6 py-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              >
                Browse All Quizzes
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose QuizMaster?</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                We offer a comprehensive platform for learning and testing your knowledge.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: BookOpen,
                  title: "Wide Range of Topics",
                  description: "From technology to history, science to arts - explore diverse quiz categories",
                },
                {
                  icon: Users,
                  title: "Active Community",
                  description: "Join a vibrant community of learners and share your knowledge",
                },
                {
                  icon: Award,
                  title: "Track Progress",
                  description: "Monitor your performance and see how you improve over time",
                },
                {
                  icon: Trophy,
                  title: "Compete & Win",
                  description: "Participate in challenges and earn achievements",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mb-4">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-purple-600 to-blue-500 rounded-2xl p-8 md:p-16 text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Ready to Test Your Knowledge?</h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
                Join QuizMaster today and start your journey of discovery and learning.
              </p>
              <Link
                href="/register"
                className="inline-block px-8 py-4 rounded-full bg-white text-purple-600 hover:bg-opacity-90 transition-opacity font-semibold text-lg"
              >
                Create Free Account
              </Link>
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
    </>
  )
}
