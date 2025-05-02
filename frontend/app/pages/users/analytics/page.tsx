"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Award, Clock, TrendingUp, Star, Target, BookOpen } from "lucide-react"
import DashboardLayout from "../dashboard/layout"

export default function Analytics() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [analyticsData, setAnalyticsData] = useState(null)

  useEffect(() => {
    setMounted(true)
    // Fetch user analytics from backend (replace with actual API call)
    // fetch("/api/user/analytics")
    //   .then((res) => res.json())
    //   .then((data) => setAnalyticsData(data))
  }, [])

  // Placeholder data (replace with API data)
  const categoryScores = [
    { category: "Math", score: 88 },
    { category: "Science", score: 92 },
    { category: "History", score: 78 },
    { category: "Literature", score: 85 },
  ]

  const progressData = [
    { date: "2025-03-01", score: 80 },
    { date: "2025-03-15", score: 85 },
    { date: "2025-04-01", score: 88 },
    { date: "2025-04-15", score: 90 },
    { date: "2025-05-01", score: 92 },
  ]

  const quizAttempts = [
    { id: 1, quiz: "Algebra Basics", category: "Math", score: 90, success: "90%", date: "2025-04-05" },
    { id: 2, quiz: "Physics 101", category: "Science", score: 95, success: "95%", date: "2025-04-04" },
    { id: 3, quiz: "World History", category: "History", score: 75, success: "75%", date: "2025-04-03" },
  ]

  const personalBests = {
    highestScore: { quiz: "Physics 101", score: 95, date: "2025-04-04" },
    fastestCompletion: { quiz: "Math Quick Quiz", time: "5m 23s", date: "2025-04-01" },
  }

  const comparisons = [
    { quiz: "Algebra Basics", current: 90, previous: 85, date: "2025-04-05" },
    { quiz: "World History", current: 75, previous: 70, date: "2025-04-03" },
  ]

  const strengths = ["Science (92%)", "Math (88%)"]
  const weaknesses = ["History (78%)"]

  if (!mounted) return null
  const content = (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Your Analytics
      </h1>

      {/* Performance Overview */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Performance Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center hover:scale-105 transition-transform duration-200">
            <Award className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-4" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Score</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">86%</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center hover:scale-105 transition-transform duration-200">
            <BookOpen className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-4" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Quizzes Taken</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">12</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center hover:scale-105 transition-transform duration-200">
            <Clock className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-4" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Time Spent</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">4h 32m</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Scores by Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryScores}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#4B5563" : "#E5E7EB"} />
                <XAxis dataKey="category" stroke={theme === "dark" ? "#fff" : "#000"} />
                <YAxis stroke={theme === "dark" ? "#fff" : "#000"} />
                <Tooltip contentStyle={{ backgroundColor: theme === "dark" ? "#1F2937" : "#fff", border: "none" }} />
                <Bar dataKey="score" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Progress Over Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#4B5563" : "#E5E7EB"} />
                <XAxis dataKey="date" stroke={theme === "dark" ? "#fff" : "#000"} />
                <YAxis stroke={theme === "dark" ? "#fff" : "#000"} />
                <Tooltip contentStyle={{ backgroundColor: theme === "dark" ? "#1F2937" : "#fff", border: "none" }} />
                <Line type="monotone" dataKey="score" stroke="#8B5CF6" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Detailed Statistics */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Detailed Statistics</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Quiz Attempts</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="py-2 px-4 text-gray-600 dark:text-gray-300">Quiz</th>
                  <th className="py-2 px-4 text-gray-600 dark:text-gray-300">Category</th>
                  <th className="py-2 px-4 text-gray-600 dark:text-gray-300">Score</th>
                  <th className="py-2 px-4 text-gray-600 dark:text-gray-300">Success Rate</th>
                  <th className="py-2 px-4 text-gray-600 dark:text-gray-300">Date</th>
                </tr>
              </thead>
              <tbody>
                {quizAttempts.map((attempt) => (
                  <tr key={attempt.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-2 px-4 text-gray-900 dark:text-white">{attempt.quiz}</td>
                    <td className="py-2 px-4 text-gray-900 dark:text-white">{attempt.category}</td>
                    <td className="py-2 px-4 text-gray-900 dark:text-white">{attempt.score}%</td>
                    <td className="py-2 px-4 text-gray-900 dark:text-white">{attempt.success}</td>
                    <td className="py-2 px-4 text-gray-900 dark:text-white">{attempt.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Learning Progress</h3>
            <div className="space-y-2">
              {categoryScores.map((cat) => (
                <div key={cat.category} className="flex items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300 w-24">{cat.category}</span>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600"
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-900 dark:text-white ml-2">{cat.score}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Performance Trends</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Recent Improvement: <span className="text-purple-600 dark:text-purple-400">+5%</span> in Math</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Consistency: Stable in Science</p>
          </div>
        </div>
      </section>

      {/* Achievement Tracking */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Achievement Tracking</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:scale-105 transition-transform duration-200">
            <Star className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Highest Score</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{personalBests.highestScore.quiz}</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">{personalBests.highestScore.score}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{personalBests.highestScore.date}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:scale-105 transition-transform duration-200">
            <Clock className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fastest Completion</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{personalBests.fastestCompletion.quiz}</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">{personalBests.fastestCompletion.time}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{personalBests.fastestCompletion.date}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:scale-105 transition-transform duration-200">
            <Target className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Strengths & Weaknesses</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Strengths: {strengths.join(", ")}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Weaknesses: {weaknesses.join(", ")}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Comparison with Previous Attempts</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="py-2 px-4 text-gray-600 dark:text-gray-300">Quiz</th>
                  <th className="py-2 px-4 text-gray-600 dark:text-gray-300">Current Score</th>
                  <th className="py-2 px-4 text-gray-600 dark:text-gray-300">Previous Score</th>
                  <th className="py-2 px-4 text-gray-600 dark:text-gray-300">Date</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((comp, index) => (
                  <tr key={index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-2 px-4 text-gray-900 dark:text-white">{comp.quiz}</td>
                    <td className="py-2 px-4 text-gray-900 dark:text-white">{comp.current}%</td>
                    <td className="py-2 px-4 text-gray-900 dark:text-white">{comp.previous}%</td>
                    <td className="py-2 px-4 text-gray-900 dark:text-white">{comp.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  </div>
)

  return <DashboardLayout>{content}</DashboardLayout>
   
}