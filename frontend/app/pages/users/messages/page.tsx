"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Bell, MessageSquare, Send, Award, BookOpen } from "lucide-react"
import DashboardLayout from "../dashboard/layout"
import { toast } from "react-hot-toast"

type NotificationType = "Result" | "Quiz" | "Announcement" | "Achievement"
type MessageType = "Question" | "Support Request" | "Feedback"

interface Notification {
  id: number
  type: NotificationType
  title: string
  content: string
  timestamp: string
}

export default function MessagesPage() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<"All" | NotificationType>("All")
  const [messageType, setMessageType] = useState<MessageType>("Question")
  const [messageContent, setMessageContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      // Simulated API call - replace with actual API
      setNotifications([
        { id: 1, type: "Result", title: "Quiz Result: Algebra Basics", content: "You scored 90%! Great job!", timestamp: "2025-04-05 10:00" },
        { id: 2, type: "Quiz", title: "New Quiz Available", content: "Try the new Science Trivia quiz!", timestamp: "2025-04-04 15:30" },
        { id: 3, type: "Announcement", title: "System Update", content: "New features added to the quiz platform.", timestamp: "2025-04-03 09:00" },
        { id: 4, type: "Achievement", title: "Achievement Unlocked", content: "Fastest Completion: Math Quick Quiz", timestamp: "2025-04-01 12:00" },
      ])
    } catch (error) {
      toast.error("Failed to load notifications")
      console.error("Error fetching notifications:", error)
    }
  }

  const handleSubmitMessage = async () => {
    if (!messageContent.trim()) {
      toast.error("Please enter a message")
      return
    }

    setIsLoading(true)
    try {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Message sent successfully!")
      setMessageContent("")
    } catch (error) {
      toast.error("Failed to send message")
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredNotifications = filter === "All" 
    ? notifications 
    : notifications.filter((n) => n.type === filter)

  if (!mounted) return null

  const content = (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Messages & Notifications
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View your notifications and contact support
        </p>
      </div>

      {/* Notifications */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Notifications
        </h2>
        <div className="flex gap-2 mb-4 flex-wrap">
          {["All", "Result", "Quiz", "Announcement", "Achievement"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type as "All" | NotificationType)}
              className={`px-3 py-1 rounded-lg text-sm ${
                filter === type
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              } transition-all duration-200`}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex items-start hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {notification.type === "Result" && <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 mr-3" />}
                {notification.type === "Quiz" && <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 mr-3" />}
                {notification.type === "Announcement" && <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 mr-3" />}
                {notification.type === "Achievement" && <Award className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 mr-3" />}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{notification.content}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{notification.timestamp}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-4">
              No notifications found
            </p>
          )}
        </div>
      </div>

      {/* Contact Form */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Contact Support
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Message Type
            </label>
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value as MessageType)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="Question">Question</option>
              <option value="Support Request">Support Request</option>
              <option value="Feedback">Feedback</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Message
            </label>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Type your message here..."
              className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600 min-h-[120px]"
            />
          </div>
          <button
            onClick={handleSubmitMessage}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center ${
              isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:from-purple-700 hover:to-blue-700'
            } transition-all duration-200`}
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {isLoading ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </div>
    </div>
  )

  return <DashboardLayout>{content}</DashboardLayout>
}