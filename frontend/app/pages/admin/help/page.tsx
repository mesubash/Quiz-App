"use client"

import { useState } from "react"
import * as Accordion from "@radix-ui/react-accordion"
import { ChevronDown, Search } from "lucide-react"

export default function AdminHelp() {
  const [searchTerm, setSearchTerm] = useState("")

  const faqs = [
    {
      question: "How do I reset a user's password?",
      answer:
        "Go to the Users page, find the user, and click 'Reset Password'. An email with a reset link will be sent to the user. Ensure the email server is configured in Settings.",
    },
    {
      question: "Why is a quiz not appearing for users?",
      answer:
        "Check if the quiz is marked as 'Published' in the Quizzes page. Also, verify user permissions and ensure the quiz is assigned to the correct user groups.",
    },
    {
      question: "How do I export analytics data?",
      answer:
        "On the Analytics page, select the desired report (e.g., User Performance) and click 'Export as CSV'. Ensure you have admin permissions to access this feature.",
    },
    {
      question: "What should I do if the app is slow?",
      answer:
        "Check the server status in Settings > System Health. Clear cache if needed, and contact support if performance issues persist.",
    },
  ]

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Help Center
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Find guidance on managing your Quiz Application, troubleshooting issues, and contacting support.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search help topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400"
              aria-label="Search help topics"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
          </div>
        </div>

        {/* Help Sections */}
        <div className="space-y-12">
          {/* Overview */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Overview
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              As an admin, you can manage users, quizzes, analytics, and app settings via the Admin Dashboard. Use the sidebar to navigate to:
            </p>
            <ul className="mt-2 list-disc list-inside text-gray-600 dark:text-gray-400">
              <li><strong>Dashboard</strong>: View system status and key metrics.</li>
              <li><strong>Users</strong>: Manage user accounts and roles.</li>
              <li><strong>Quizzes</strong>: Create and edit quizzes and questions.</li>
              <li><strong>Analytics</strong>: Analyze user performance and quiz stats.</li>
              <li><strong>Settings</strong>: Configure app and authentication settings.</li>
            </ul>
          </section>

          {/* User Management */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              User Management
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage user accounts, roles, and permissions on the Users page.
            </p>
            <ul className="mt-2 list-disc list-inside text-gray-600 dark:text-gray-400">
              <li><strong>View Users</strong>: See all users, their roles (Admin, User), and status.</li>
              <li><strong>Edit User</strong>: Update email, role, or reset passwords.</li>
              <li><strong>Delete User</strong>: Remove inactive or unauthorized accounts.</li>
              <li><strong>Add User</strong>: Create new accounts with specific roles.</li>
            </ul>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              <strong>Troubleshooting</strong>: If a user can’t log in, check their account status and JWT token validity in Settings {">"} Authentication.
            </p>
          </section>

          {/* Quiz Management */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Quiz Management
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Create, edit, and manage quizzes and questions on the Quizzes page.
            </p>
            <ul className="mt-2 list-disc list-inside text-gray-600 dark:text-gray-400">
              <li><strong>Create Quiz</strong>: Add a new quiz with a title, description, and questions.</li>
              <li><strong>Edit Quiz</strong>: Update questions, time limits, or visibility (Published/Unpublished).</li>
              <li><strong>Delete Quiz</strong>: Remove outdated or unused quizzes.</li>
              <li><strong>Assign Quiz</strong>: Link quizzes to user groups or individuals.</li>
            </ul>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              <strong>Troubleshooting</strong>: If questions don’t save, ensure MySQL is running and check database logs in Settings {">"} System Health.
            </p>
          </section>

          {/* Analytics */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Analytics
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              View and export performance data on the Analytics page.
            </p>
            <ul className="mt-2 list-disc list-inside text-gray-600 dark:text-gray-400">
              <li><strong>User Performance</strong>: See scores, completion rates, and time taken.</li>
              <li><strong>Quiz Stats</strong>: Analyze question difficulty and pass rates.</li>
              <li><strong>Export Data</strong>: Download reports as CSV for external analysis.</li>
            </ul>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              <strong>Troubleshooting</strong>: If data is missing, verify user submissions and database connectivity.
            </p>
          </section>

          {/* Settings */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Settings
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Configure app settings and authentication on the Settings page.
            </p>
            <ul className="mt-2 list-disc list-inside text-gray-600 dark:text-gray-400">
              <li><strong>App Settings</strong>: Update app name, logo, or email server.</li>
              <li><strong>Authentication</strong>: Manage JWT settings (e.g., token expiry, issuer).</li>
              <li><strong>System Health</strong>: Monitor server status and database connectivity.</li>
            </ul>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              <strong>Troubleshooting</strong>: If settings don’t save, check Redis connectivity for JWT storage (Settings {">"} Authentication).
            </p>
          </section>

          {/* FAQs */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <Accordion.Root
              type="single"
              collapsible
              className="space-y-2"
            >
              {filteredFaqs.map((faq, index) => (
                <Accordion.Item
                  key={index}
                  value={`faq-${index}`}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <Accordion.Trigger
                    className="flex items-center justify-between w-full px-4 py-3 text-left text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400"
                    aria-label={`Toggle FAQ: ${faq.question}`}
                  >
                    <span className="font-medium">{faq.question}</span>
                    <ChevronDown className="h-5 w-5 transition-transform duration-200 data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                  <Accordion.Content className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
            {filteredFaqs.length === 0 && (
              <p className="text-gray-600 dark:text-gray-400">
                No FAQs match your search. Try different keywords or contact support.
              </p>
            )}
          </section>

          {/* Contact Support */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Contact Support
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              For technical issues or further assistance, reach out to our support team:
            </p>
            <ul className="mt-2 list-disc list-inside text-gray-600 dark:text-gray-400">
              <li><strong>Email</strong>: support@quizapp.com</li>
              <li><strong>Phone</strong>: +1-800-QUIZ-APP (Mon-Fri, 9 AM-5 PM)</li>
              <li><strong>Live Chat</strong>: Available in Settings {">"} Support</li>
            </ul>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Please provide your admin ID, app version, and a detailed description of the issue when contacting support.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}