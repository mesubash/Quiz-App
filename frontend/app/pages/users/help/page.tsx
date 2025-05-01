"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Search } from "lucide-react"

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const faqs = [
    {
      question: "How do I start a quiz?",
      answer:
        "To start a quiz, navigate to the Quizzes page from the sidebar, browse the available quizzes, and click on the 'Start Quiz' button for the quiz you want to take.",
    },
    {
      question: "How is my score calculated?",
      answer:
        "Your score is calculated based on the number of correct answers. Each question has equal weight. The percentage score is calculated as (number of correct answers / total number of questions) × 100.",
    },
    {
      question: "Can I retake a quiz?",
      answer:
        "Yes, you can retake any quiz as many times as you want. Your most recent score will be displayed on your profile, but all attempts are recorded in your quiz history.",
    },
    {
      question: "How does the leaderboard work?",
      answer:
        "The leaderboard ranks users based on their average quiz scores or the total number of quizzes taken. You can toggle between these two ranking methods on the leaderboard page.",
    },
    {
      question: "Can I create my own quiz?",
      answer:
        "Currently, only administrators can create quizzes. If you have a quiz idea, please contact our support team.",
    },
    {
      question: "How do I change my password?",
      answer:
        "You can change your password in the Profile section. Click on your profile in the sidebar, then navigate to the Account Settings section where you'll find the option to change your password.",
    },
    {
      question: "Is there a time limit for quizzes?",
      answer:
        "Yes, each quiz has its own time limit, which is displayed before you start the quiz. Once the time runs out, your quiz will be automatically submitted with the answers you've provided so far.",
    },
  ]

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Help Center</h1>
        <p className="text-gray-600 dark:text-gray-400">Find answers to common questions about using QuizMaster.</p>
      </div>

      <div className="card p-6">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="input pl-10"
            placeholder="Search for help topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  className="flex justify-between items-center w-full p-4 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="p-4 bg-white dark:bg-gray-800">
                    <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No results found for "{searchQuery}"</p>
              <button
                className="mt-2 text-blue-600 dark:text-blue-400 hover:underline"
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Still Need Help?</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          If you couldn't find the answer to your question, feel free to contact our support team.
        </p>
        <a href="/dashboard/contact" className="btn-primary inline-block">
          Contact Support
        </a>
      </div>
    </div>
  )
}

