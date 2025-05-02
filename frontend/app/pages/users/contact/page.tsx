"use client"

import type React from "react"

import { useState } from "react"
import { Send, Mail, Phone, MapPin, CheckCircle } from "lucide-react"
import Dashboard from "../dashboard/page"
import DashboardLayout from "../dashboard/layout"

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Basic validation
    if (!name || !email || !subject || !message) {
      setError("All fields are required")
      return
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    // Simulate API call
    setTimeout(() => {
      setSubmitted(true)
      setName("")
      setEmail("")
      setSubject("")
      setMessage("")
    }, 1000)
  }
  const content = (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Contact Us</h1>
        <p className="text-gray-600 dark:text-gray-400">Have a question or feedback? We'd love to hear from you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="card p-6">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3 mb-4">
                  <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Message Sent!</h2>
                <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                  Thank you for reaching out. We've received your message and will get back to you as soon as possible.
                </p>
                <button className="mt-6 btn-primary" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Send a Message</h2>

                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 rounded-md">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Your Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        className="input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Subject
                    </label>
                    <input
                      id="subject"
                      type="text"
                      className="input"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="input"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" className="btn-primary flex items-center">
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>

            <div className="space-y-4">
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Email</p>
                  <a href="mailto:support@quizmaster.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                    support@quizmaster.com
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Phone</p>
                  <a href="tel:+1234567890" className="text-gray-600 dark:text-gray-400">
                    +1 (234) 567-890
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Address</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    123 Quiz Street
                    <br />
                    Knowledge City, QZ 12345
                    <br />
                    United States
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Office Hours</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Monday - Friday: 9:00 AM - 5:00 PM
                <br />
                Saturday: 10:00 AM - 2:00 PM
                <br />
                Sunday: Closed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return <DashboardLayout>{content}</DashboardLayout>
    
}

