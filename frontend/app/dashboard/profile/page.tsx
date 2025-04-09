"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/contexts/AuthContext"
import { userService } from "@/app/services/api"
import { User, Mail, Calendar, Award, CheckCircle } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [quizHistory, setQuizHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, historyData] = await Promise.all([
          userService.getUserProfile(),
          userService.getQuizHistory(),
        ])

        setProfile(profileData)
        setQuizHistory(historyData)
        setName(profileData.name || user?.name || "")
        setBio(profileData.bio || "")
      } catch (error) {
        console.error("Error fetching profile data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault()

    // Simulate API call
    setTimeout(() => {
      setSaveSuccess(true)

      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    }, 1000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile overview */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-32 h-32 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-4xl font-bold text-blue-600 dark:text-blue-400 shadow-md">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center md:text-left">
              {profile?.name || user?.name || "User"}
            </h1>
            <div className="flex flex-col sm:flex-row gap-2 mt-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4 mr-1" />
                {user?.email}
              </div>
              <div className="hidden sm:block text-gray-400 dark:text-gray-600">•</div>
              <div className="flex items-center justify-center md:justify-start text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4 mr-1" />
                Joined April 2023
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Quizzes Taken</p>
                <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">{profile?.quizzesTaken || 0}</p>
              </div>

              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Score</p>
                <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                  {profile?.averageScore || 0}%
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ranking</p>
                <p className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">#42</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz history */}
      <div className="card p-6">
        <div className="flex items-center mb-4">
          <Award className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quiz History</h2>
        </div>

        {quizHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Quiz Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Date
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
                    Result
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {quizHistory.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {item.quizName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {item.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {item.score}/{item.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          Math.round((item.score / item.total) * 100) >= 80
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : Math.round((item.score / item.total) * 100) >= 60
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : Math.round((item.score / item.total) * 100) >= 40
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {Math.round((item.score / item.total) * 100)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">No quiz history available</p>
            <a href="/dashboard/quizzes" className="mt-2 text-blue-600 dark:text-blue-400 hover:underline">
              Take your first quiz
            </a>
          </div>
        )}
      </div>

      {/* Profile settings */}
      <div className="card p-6">
        <div className="flex items-center mb-4">
          <User className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Information</h2>
        </div>

        {saveSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 rounded-md flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <input type="text" id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="input bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
              value={user?.email || ""}
              disabled
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Email address cannot be changed</p>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              className="input"
              placeholder="Tell us a bit about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

