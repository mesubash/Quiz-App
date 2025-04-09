"use client"

import { useState, useEffect } from "react"
import { userService } from "@/app/services/api"
import { Trophy, Medal, Users, Award, ArrowDown } from "lucide-react"

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [sortBy, setSortBy] = useState<"score" | "quizzesTaken">("score")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await userService.getLeaderboard()
        setLeaderboard(data)
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  // Sort leaderboard based on selected criteria
  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (sortBy === "score") {
      return b.score - a.score
    } else {
      return b.quizzesTaken - a.quizzesTaken
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center">
          <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Check out our top performers and see where you rank!
            </p>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-4">
              <Trophy className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Top Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {leaderboard.length > 0 ? `${Math.max(...leaderboard.map((user) => user.score))}%` : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 mr-4">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Participants</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{leaderboard.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 mr-4">
              <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Most Quizzes Taken</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {leaderboard.length > 0 ? Math.max(...leaderboard.map((user) => user.quizzesTaken)) : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-end p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => setSortBy("score")}
              className={`px-4 py-2 text-sm font-medium rounded-l-md focus:outline-none focus:z-10 flex items-center ${
                sortBy === "score"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
              }`}
            >
              {sortBy === "score" && <ArrowDown className="w-4 h-4 mr-1" />}
              Sort by Score
            </button>
            <button
              onClick={() => setSortBy("quizzesTaken")}
              className={`px-4 py-2 text-sm font-medium rounded-r-md focus:outline-none flex items-center ${
                sortBy === "quizzesTaken"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
              }`}
            >
              {sortBy === "quizzesTaken" && <ArrowDown className="w-4 h-4 mr-1" />}
              Sort by Quizzes Taken
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Rank
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Score
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Quizzes Taken
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedLeaderboard.map((user, index) => (
                <tr key={user.id} className={index < 3 ? "bg-blue-50 dark:bg-blue-900/20" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {index < 3 ? (
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full ${
                            index === 0
                              ? "bg-yellow-400 text-white"
                              : index === 1
                                ? "bg-gray-300 text-gray-800"
                                : "bg-yellow-700 text-white"
                          }`}
                        >
                          {index === 0 ? <Medal className="h-4 w-4" /> : index + 1}
                        </div>
                      ) : (
                        <span className="text-gray-900 dark:text-white">{index + 1}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-200 font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white font-medium">{user.score}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.quizzesTaken}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

