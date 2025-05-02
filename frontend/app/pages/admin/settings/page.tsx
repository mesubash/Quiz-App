"use client"

import { useState, useEffect } from "react"
import { Save, RefreshCw, AlertCircle } from "lucide-react"

export default function AdminSettingsPage() {
  // Initial settings state
  const defaultSettings = {
    quizSettings: {
      defaultTimeLimit: 10,
      showCorrectAnswers: true,
      allowRetakes: true,
      maxAttemptsPerQuiz: 3,
    },
    emailSettings: {
      sendWelcomeEmail: true,
      sendQuizCompletionEmail: true,
    },
    authSettings: {
      jwtTokenExpiry: 3600, // 1 hour in seconds
      jwtIssuer: "quizapp-api",
    },
    systemHealth: {
      mysqlStatus: "Unknown",
      redisStatus: "Unknown",
    },
  }

  const [settings, setSettings] = useState(defaultSettings)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Simulate fetching system health on mount
  useEffect(() => {
    fetchSystemHealth()
  }, [])

  // Validate form inputs
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (settings.quizSettings.defaultTimeLimit < 1) {
      newErrors.defaultTimeLimit = "Time limit must be at least 1 minute"
    }
    if (settings.quizSettings.allowRetakes && settings.quizSettings.maxAttemptsPerQuiz < 1) {
      newErrors.maxAttemptsPerQuiz = "Max attempts must be at least 1"
    }
    if (settings.authSettings.jwtTokenExpiry < 300) {
      newErrors.jwtTokenExpiry = "Token expiry must be at least 300 seconds"
    }
    if (!settings.authSettings.jwtIssuer.trim()) {
      newErrors.jwtIssuer = "JWT issuer is required"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle input changes
  const handleChange = (
    section: keyof typeof settings,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined

    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
      },
    }))
    setErrors((prev) => ({ ...prev, [name]: "" }))
    setMessage(null)
  }

  // Simulate fetching system health
  const fetchSystemHealth = async () => {
    setIsLoading(true)
    try {
      // Placeholder: Replace with actual API call
      // const response = await fetch("/api/admin/system-health")
      // const data = await response.json()
      const data = {
        mysqlStatus: "Connected",
        redisStatus: "Connected",
      }
      setSettings((prev) => ({
        ...prev,
        systemHealth: data,
      }))
      setMessage({ type: "success", text: "System health refreshed" })
    } catch (error) {
      setMessage({ type: "error", text: "Failed to fetch system health" })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle form submission
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      // Placeholder: Replace with actual API call
      // await fetch("/api/admin/settings", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(settings),
      // })
      console.log("Saving settings:", settings)
      setMessage({ type: "success", text: "Settings saved successfully!" })
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save settings" })
    } finally {
      setIsLoading(false)
    }
  }

  // Reset to default settings
  const handleReset = () => {
    if (window.confirm("Reset all settings to default?")) {
      setSettings(defaultSettings)
      setErrors({})
      setMessage({ type: "success", text: "Settings reset to default" })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Settings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Configure quiz behavior, email notifications, authentication, and system health.
          </p>
        </div>

        {/* Message Feedback */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center ${
              message.type === "success"
                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
            }`}
          >
            <AlertCircle className="h-5 w-5 mr-2" />
            {message.text}
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-8">
          {/* Quiz Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quiz Settings</h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="defaultTimeLimit"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Default Time Limit (minutes)
                </label>
                <input
                  type="number"
                  id="defaultTimeLimit"
                  name="defaultTimeLimit"
                  value={settings.quizSettings.defaultTimeLimit}
                  onChange={(e) => handleChange("quizSettings", e)}
                  min="1"
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400 py-2 px-3"
                  aria-invalid={!!errors.defaultTimeLimit}
                  aria-describedby={errors.defaultTimeLimit ? "defaultTimeLimit-error" : undefined}
                />
                {errors.defaultTimeLimit && (
                  <p id="defaultTimeLimit-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.defaultTimeLimit}
                  </p>
                )}
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showCorrectAnswers"
                  name="showCorrectAnswers"
                  checked={settings.quizSettings.showCorrectAnswers}
                  onChange={(e) => handleChange("quizSettings", e)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-700 rounded"
                />
                <label
                  htmlFor="showCorrectAnswers"
                  className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
                >
                  Show correct answers after quiz completion
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowRetakes"
                  name="allowRetakes"
                  checked={settings.quizSettings.allowRetakes}
                  onChange={(e) => handleChange("quizSettings", e)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-700 rounded"
                />
                <label
                  htmlFor="allowRetakes"
                  className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
                >
                  Allow users to retake quizzes
                </label>
              </div>
              <div>
                <label
                  htmlFor="maxAttemptsPerQuiz"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Maximum Attempts per Quiz
                </label>
                <input
                  type="number"
                  id="maxAttemptsPerQuiz"
                  name="maxAttemptsPerQuiz"
                  value={settings.quizSettings.maxAttemptsPerQuiz}
                  onChange={(e) => handleChange("quizSettings", e)}
                  min="1"
                  disabled={!settings.quizSettings.allowRetakes}
                  className={`mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400 py-2 px-3 ${
                    !settings.quizSettings.allowRetakes ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  aria-invalid={!!errors.maxAttemptsPerQuiz}
                  aria-describedby={errors.maxAttemptsPerQuiz ? "maxAttemptsPerQuiz-error" : undefined}
                />
                {errors.maxAttemptsPerQuiz && (
                  <p id="maxAttemptsPerQuiz-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.maxAttemptsPerQuiz}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Email Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sendWelcomeEmail"
                  name="sendWelcomeEmail"
                  checked={settings.emailSettings.sendWelcomeEmail}
                  onChange={(e) => handleChange("emailSettings", e)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-700 rounded"
                />
                <label
                  htmlFor="sendWelcomeEmail"
                  className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
                >
                  Send welcome email to new users
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sendQuizCompletionEmail"
                  name="sendQuizCompletionEmail"
                  checked={settings.emailSettings.sendQuizCompletionEmail}
                  onChange={(e) => handleChange("emailSettings", e)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-700 rounded"
                />
                <label
                  htmlFor="sendQuizCompletionEmail"
                  className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
                >
                  Send email after quiz completion
                </label>
              </div>
            </div>
          </div>

          {/* Authentication Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Authentication</h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="jwtTokenExpiry"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  JWT Token Expiry (seconds)
                </label>
                <input
                  type="number"
                  id="jwtTokenExpiry"
                  name="jwtTokenExpiry"
                  value={settings.authSettings.jwtTokenExpiry}
                  onChange={(e) => handleChange("authSettings", e)}
                  min="300"
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400 py-2 px-3"
                  aria-invalid={!!errors.jwtTokenExpiry}
                  aria-describedby={errors.jwtTokenExpiry ? "jwtTokenExpiry-error" : undefined}
                />
                {errors.jwtTokenExpiry && (
                  <p id="jwtTokenExpiry-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.jwtTokenExpiry}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="jwtIssuer"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  JWT Issuer
                </label>
                <input
                  type="text"
                  id="jwtIssuer"
                  name="jwtIssuer"
                  value={settings.authSettings.jwtIssuer}
                  onChange={(e) => handleChange("authSettings", e)}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400 py-2 px-3"
                  aria-invalid={!!errors.jwtIssuer}
                  aria-describedby={errors.jwtIssuer ? "jwtIssuer-error" : undefined}
                />
                {errors.jwtIssuer && (
                  <p id="jwtIssuer-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.jwtIssuer}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">System Health</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    MySQL Database
                  </span>
                  <span
                    className={`mt-1 text-sm ${
                      settings.systemHealth.mysqlStatus === "Connected"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {settings.systemHealth.mysqlStatus}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={fetchSystemHealth}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-md shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center disabled:opacity-50"
                  aria-label="Refresh MySQL status"
                >
                  <RefreshCw
                    className={`h-5 w-5 mr-2 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Redis Cache
                  </span>
                  <span
                    className={`mt-1 text-sm ${
                      settings.systemHealth.redisStatus === "Connected"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {settings.systemHealth.redisStatus}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={fetchSystemHealth}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-md shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center disabled:opacity-50"
                  aria-label="Refresh Redis status"
                >
                  <RefreshCw
                    className={`h-5 w-5 mr-2 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-md shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 flex items-center disabled:opacity-50"
              aria-label="Reset settings to default"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Reset to Default
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-medium rounded-md shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center disabled:opacity-50"
              aria-label="Save settings"
            >
              <Save className="h-5 w-5 mr-2" />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}