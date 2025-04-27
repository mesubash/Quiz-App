"use client"

import type React from "react"

import { useState } from "react"
import { Save, RefreshCw } from "lucide-react"

export default function AdminSettingsPage() {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "QuizMaster",
    siteDescription: "An interactive quiz platform for learning and fun",
    contactEmail: "admin@quizmaster.com",
    allowRegistration: true,
  })

  const [quizSettings, setQuizSettings] = useState({
    defaultTimeLimit: 10,
    showCorrectAnswers: true,
    allowRetakes: true,
    maxAttemptsPerQuiz: 3,
  })

  const [emailSettings, setEmailSettings] = useState({
    sendWelcomeEmail: true,
    sendQuizCompletionEmail: true,
    emailFooter: "© 2023 QuizMaster. All rights reserved.",
  })

  const handleGeneralSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined

    setGeneralSettings({
      ...generalSettings,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleQuizSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined

    setQuizSettings({
      ...quizSettings,
      [name]: type === "checkbox" ? checked : type === "number" ? Number.parseInt(value) : value,
    })
  }

  const handleEmailSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined

    setEmailSettings({
      ...emailSettings,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would call an API to save the settings
    console.log({
      generalSettings,
      quizSettings,
      emailSettings,
    })
    alert("Settings saved successfully!")
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Admin Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Configure your quiz platform settings</p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* General Settings */}
        <div className="card p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">General Settings</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Site Name
              </label>
              <input
                type="text"
                id="siteName"
                name="siteName"
                value={generalSettings.siteName}
                onChange={handleGeneralSettingsChange}
                className="mt-1 input"
              />
            </div>

            <div>
              <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Site Description
              </label>
              <textarea
                id="siteDescription"
                name="siteDescription"
                value={generalSettings.siteDescription}
                onChange={handleGeneralSettingsChange}
                rows={3}
                className="mt-1 input"
              />
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contact Email
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={generalSettings.contactEmail}
                onChange={handleGeneralSettingsChange}
                className="mt-1 input"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowRegistration"
                name="allowRegistration"
                checked={generalSettings.allowRegistration}
                onChange={handleGeneralSettingsChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="allowRegistration" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Allow new user registrations
              </label>
            </div>
          </div>
        </div>

        {/* Quiz Settings */}
        <div className="card p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quiz Settings</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="defaultTimeLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default Time Limit (minutes)
              </label>
              <input
                type="number"
                id="defaultTimeLimit"
                name="defaultTimeLimit"
                value={quizSettings.defaultTimeLimit}
                onChange={handleQuizSettingsChange}
                min="1"
                className="mt-1 input"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="showCorrectAnswers"
                name="showCorrectAnswers"
                checked={quizSettings.showCorrectAnswers}
                onChange={handleQuizSettingsChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="showCorrectAnswers" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Show correct answers after quiz completion
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowRetakes"
                name="allowRetakes"
                checked={quizSettings.allowRetakes}
                onChange={handleQuizSettingsChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="allowRetakes" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Allow users to retake quizzes
              </label>
            </div>

            <div>
              <label
                htmlFor="maxAttemptsPerQuiz"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Maximum attempts per quiz
              </label>
              <input
                type="number"
                id="maxAttemptsPerQuiz"
                name="maxAttemptsPerQuiz"
                value={quizSettings.maxAttemptsPerQuiz}
                onChange={handleQuizSettingsChange}
                min="1"
                className="mt-1 input"
                disabled={!quizSettings.allowRetakes}
              />
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="card p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Email Settings</h2>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sendWelcomeEmail"
                name="sendWelcomeEmail"
                checked={emailSettings.sendWelcomeEmail}
                onChange={handleEmailSettingsChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="sendWelcomeEmail" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Send welcome email to new users
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="sendQuizCompletionEmail"
                name="sendQuizCompletionEmail"
                checked={emailSettings.sendQuizCompletionEmail}
                onChange={handleEmailSettingsChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="sendQuizCompletionEmail" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Send email after quiz completion
              </label>
            </div>

            <div>
              <label htmlFor="emailFooter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Footer Text
              </label>
              <textarea
                id="emailFooter"
                name="emailFooter"
                value={emailSettings.emailFooter}
                onChange={handleEmailSettingsChange}
                rows={2}
                className="mt-1 input"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-md shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 flex items-center"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Reset to Default
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center"
          >
            <Save className="h-5 w-5 mr-2" />
            Save Settings
          </button>
        </div>
      </form>
    </div>
  )
}

