"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Search } from "lucide-react"

export default function FaqPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const faqCategories = [
    {
      title: "General",
      faqs: [
        {
          question: "What is QuizMaster?",
          answer:
            "QuizMaster is an online quiz platform that allows users to test their knowledge on various topics. Users can take quizzes, track their progress, and compete with others on the leaderboard.",
        },
        {
          question: "Is QuizMaster free to use?",
          answer:
            "Yes, QuizMaster is completely free to use. We may introduce premium features in the future, but the core functionality will always remain free.",
        },
        {
          question: "Do I need to create an account to use QuizMaster?",
          answer:
            "Yes, you need to create an account to take quizzes, save your progress, and appear on the leaderboard. Registration is quick and only requires a valid email address.",
        },
      ],
    },
    {
      title: "Quizzes",
      faqs: [
        {
          question: "How are quizzes structured?",
          answer:
            "Each quiz consists of multiple-choice questions with a set time limit. The number of questions and time limit vary depending on the quiz.",
        },
        {
          question: "Can I pause a quiz and continue later?",
          answer:
            "No, once you start a quiz, you need to complete it within the allocated time. If you navigate away or close the browser, your progress may be lost.",
        },
        {
          question: "How is my score calculated?",
          answer:
            "Your score is calculated based on the number of correct answers. Each question has equal weight. The percentage score is calculated as (number of correct answers / total number of questions) × 100.",
        },
      ],
    },
    {
      title: "Account",
      faqs: [
        {
          question: "How do I change my password?",
          answer:
            "You can change your password in the Settings section. Go to your profile, click on Settings, and then navigate to the 'Change Password' section.",
        },
        {
          question: "Can I change my username or email?",
          answer:
            "You can change your username in the Profile section, but changing your email address is not currently supported. If you need to use a different email, please contact support.",
        },
        {
          question: "How do I delete my account?",
          answer:
            "To delete your account, please contact our support team. Note that account deletion is permanent and all your data will be removed from our system.",
        },
      ],
    },
  ]

  // Filter FAQs based on search query
  const filteredCategories = searchQuery
    ? faqCategories
        .map((category) => ({
          ...category,
          faqs: category.faqs.filter(
            (faq) =>
              faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
        }))
        .filter((category) => category.faqs.length > 0)
    : faqCategories

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  // Flatten all FAQs for indexing
  const allFaqs = faqCategories.flatMap((category) => category.faqs)

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Frequently Asked Questions</h1>
        <p className="text-gray-600 dark:text-gray-400">Find answers to the most common questions about QuizMaster.</p>
      </div>

      <div className="card p-6">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="input pl-10"
            placeholder="Search for questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredCategories.length > 0 ? (
          <div className="space-y-8">
            {filteredCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{category.title}</h2>
                <div className="space-y-4">
                  {category.faqs.map((faq, faqIndex) => {
                    // Calculate the global index for this FAQ
                    const globalIndex = allFaqs.findIndex((f) => f.question === faq.question)

                    return (
                      <div
                        key={faqIndex}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                      >
                        <button
                          className="flex justify-between items-center w-full p-4 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          onClick={() => toggleFaq(globalIndex)}
                        >
                          <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                          {openFaq === globalIndex ? (
                            <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          )}
                        </button>
                        {openFaq === globalIndex && (
                          <div className="p-4 bg-white dark:bg-gray-800">
                            <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
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

      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Still Have Questions?</h2>
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

