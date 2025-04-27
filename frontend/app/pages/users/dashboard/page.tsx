"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { userService, quizService } from "@/app/services/api"
import { BookOpen, Trophy, Clock, CheckCircle, BarChart3, Award, ArrowRight } from "lucide-react"

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [quizHistory, setQuizHistory] = useState<any[]>([])
  const [recentQuizzes, setRecentQuizzes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, historyData, quizzesData] = await Promise.all([
          userService.getUserProfile(),
          userService.getQuizHistory(),
          quizService.getAllQuizzes(),
        ])

        setProfile(profileData)
        setQuizHistory(historyData)
        // Get recent quizzes (latest 3)
        setRecentQuizzes(quizzesData.slice(0, 3))
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {profile?.name || "User"}!</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          You've taken {profile?.quizzesTaken || 0} quizzes with an average score of {profile?.averageScore || 0}%.
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-4">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Quizzes Taken</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.quizzesTaken || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 mr-4">
              <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.averageScore || 0}%</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 mr-4">
              <Trophy className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ranking</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">#42</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity and available quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent activity */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Award className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            </div>
            <Link
              href="/dashboard/profile"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
            >
              View all
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {quizHistory.length > 0 ? (
            <div className="space-y-4">
              {quizHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{item.quizName}</h3>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      {item.date}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full flex items-center ${
                          Math.round((item.score / item.total) * 100) >= 80
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                            : Math.round((item.score / item.total) * 100) >= 60
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                              : Math.round((item.score / item.total) * 100) >= 40
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                        }`}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {Math.round((item.score / item.total) * 100)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {item.score}/{item.total} correct
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">No activity yet</p>
              <Link
                href="/dashboard/quizzes"
                className="mt-2 inline-block text-blue-600 dark:text-blue-400 hover:underline"
              >
                Take your first quiz
              </Link>
            </div>
          )}
        </div>

        {/* Available quizzes */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Available Quizzes</h2>
            </div>
            <Link
              href="/dashboard/quizzes"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
            >
              View all
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium text-gray-900 dark:text-white">{quiz.title}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{quiz.description}</p>
                <div className="mt-3 flex justify-between items-center">
                  <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {quiz.timeLimit} min
                    </span>
                    <span className="flex items-center">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {quiz.questions.length} questions
                    </span>
                  </div>
                  <Link
                    href={`/dashboard/quiz/${quiz.id}`}
                    className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 shadow-sm"
                  >
                    Start Quiz
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

