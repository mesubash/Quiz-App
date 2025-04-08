"use client"

import Link from "next/link"
import { Brain, Shield } from "lucide-react"
import { ThemeToggle } from "@/app/components/theme-toggle"

export default function Privacy() {
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
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              We care about your privacy and are committed to protecting your personal data.
            </p>
          </div>

          <div className="prose prose-purple dark:prose-invert max-w-none">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
              <h2>1. Introduction</h2>
              <p>
                Welcome to QuizMaster's Privacy Policy. This policy explains how we collect, use, disclose, and safeguard your information when you use our service.
              </p>

              <h2>2. Information We Collect</h2>
              <h3>2.1 Personal Information</h3>
              <p>We may collect personal information that you provide to us, including but not limited to:</p>
              <ul>
                <li>Name and email address when you create an account</li>
                <li>Profile information you provide</li>
                <li>Quiz responses and scores</li>
                <li>Communications with us</li>
              </ul>

              <h3>2.2 Usage Information</h3>
              <p>We automatically collect certain information when you use our service, including:</p>
              <ul>
                <li>Device and browser information</li>
                <li>IP address and location data</li>
                <li>Usage patterns and preferences</li>
                <li>Performance and error data</li>
              </ul>

              <h2>3. How We Use Your Information</h2>
              <p>We use the collected information for various purposes:</p>
              <ul>
                <li>To provide and maintain our service</li>
                <li>To notify you about changes to our service</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information to improve our service</li>
                <li>To monitor the usage of our service</li>
                <li>To detect, prevent and address technical issues</li>
              </ul>

              <h2>4. Data Security</h2>
              <p>
                We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.
              </p>

              <h2>5. Third-Party Services</h2>
              <p>
                We may employ third-party companies and individuals to facilitate our service, provide service-related services, or assist us in analyzing how our service is used.
              </p>

              <h2>6. Children's Privacy</h2>
              <p>
                Our service is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13.
              </p>

              <h2>7. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>

              <h2>8. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please{" "}
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
