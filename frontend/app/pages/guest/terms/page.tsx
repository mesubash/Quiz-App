"use client"

import Link from "next/link"
import { Brain, Scale } from "lucide-react"
import { ThemeToggle } from "@/app/components/theme-toggle"

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-purple-900/30">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 text-white">
                  <Brain className="h-6 w-6" />
                </div>
                <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">QuizMaster</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link
                href="/login"
                className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:opacity-90 px-6 py-2 rounded-full text-sm font-medium transition-opacity"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mb-4">
              <Scale className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Terms of Service</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Please read these terms carefully before using QuizMaster.
            </p>
          </div>

          <div className="prose prose-purple dark:prose-invert max-w-none">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using QuizMaster, you accept and agree to be bound by the terms and provision of this agreement.
              </p>

              <h2>2. Description of Service</h2>
              <p>
                QuizMaster is an online platform that provides interactive quizzes and educational content. We reserve the right to modify or discontinue the service at any time.
              </p>

              <h2>3. User Registration</h2>
              <p>To access certain features of the service, you must register for an account. You agree to:</p>
              <ul>
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Not share your account credentials</li>
              </ul>

              <h2>4. User Conduct</h2>
              <p>You agree not to:</p>
              <ul>
                <li>Use the service for any unlawful purpose</li>
                <li>Share inappropriate or offensive content</li>
                <li>Attempt to gain unauthorized access</li>
                <li>Interfere with the proper working of the service</li>
                <li>Engage in any activity that disrupts or diminishes the quality of our service</li>
              </ul>

              <h2>5. Content</h2>
              <p>
                Users may submit content to the service. You retain ownership of your content, but grant us a license to use, modify, and display it in connection with the service.
              </p>

              <h2>6. Intellectual Property</h2>
              <p>
                The service and its original content, features, and functionality are owned by QuizMaster and are protected by international copyright, trademark, and other intellectual property laws.
              </p>

              <h2>7. Termination</h2>
              <p>
                We may terminate or suspend your account and access to the service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users or us.
              </p>

              <h2>8. Limitation of Liability</h2>
              <p>
                In no event shall QuizMaster be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the service.
              </p>

              <h2>9. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new Terms on this page.
              </p>

              <h2>10. Contact Information</h2>
              <p>
                For any questions about these Terms, please{" "}
                <Link href="/contact" className="text-purple-600 dark:text-purple-400 hover:underline">
                  contact us
                </Link>
                .
              </p>

              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 text-white">
                <Brain className="h-6 w-6" />
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">QuizMaster</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Contact
              </Link>
              <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Terms
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} QuizMaster. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
