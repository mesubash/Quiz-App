"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Minus, Save, ArrowLeft, ChevronDown } from "lucide-react"
import { quizService } from "@/app/services/api" // Add this import
import axios from "axios" // Add this import
type Question = {
  id: string
  text: string
  options: { id: string; text: string }[]
  correctOptionId: string
}

export default function CreateQuizPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [difficulty, setDifficulty] = useState("EASY") // Added difficulty state
  const [timeLimit, setTimeLimit] = useState(10)
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "q1",
      text: "",
      options: [
        { id: "o1", text: "" },
        { id: "o2", text: "" },
        { id: "o3", text: "" },
        { id: "o4", text: "" },
      ],
      correctOptionId: "o1",
    },
  ])
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Get badge color based on difficulty
  const getDifficultyBadgeColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
    }
  }

  const addQuestion = () => {
    const newQuestionId = `q${questions.length + 1}`
    setQuestions([
      ...questions,
      {
        id: newQuestionId,
        text: "",
        options: [
          { id: `${newQuestionId}_o1`, text: "" },
          { id: `${newQuestionId}_o2`, text: "" },
          { id: `${newQuestionId}_o3`, text: "" },
          { id: `${newQuestionId}_o4`, text: "" },
        ],
        correctOptionId: `${newQuestionId}_o1`,
      },
    ])
  }

  const removeQuestion = (questionId: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== questionId))
    }
  }

  const updateQuestionText = (questionId: string, text: string) => {
    setQuestions(questions.map((q) => (q.id === questionId ? { ...q, text } : q)))
  }

  const updateOptionText = (questionId: string, optionId: string, text: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((o) => (o.id === optionId ? { ...o, text } : o)),
            }
          : q,
      ),
    )
  }

  const updateCorrectOption = (questionId: string, optionId: string) => {
    setQuestions(questions.map((q) => (q.id === questionId ? { ...q, correctOptionId: optionId } : q)))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) newErrors.title = "Title is required"
    if (!description.trim()) newErrors.description = "Description is required"
    if (!category.trim()) newErrors.category = "Category is required"
    if (!difficulty) newErrors.difficulty = "Difficulty is required"
    if (timeLimit <= 0) newErrors.timeLimit = "Time limit must be greater than 0"

    let hasQuestionErrors = false
    questions.forEach((question, qIndex) => {
      if (!question.text.trim()) {
        newErrors[`q_${question.id}`] = "Question text is required"
        hasQuestionErrors = true
      }

      let hasEmptyOption = false
      question.options.forEach((option, oIndex) => {
        if (!option.text.trim()) {
          newErrors[`o_${question.id}_${option.id}`] = "Option text is required"
          hasEmptyOption = true
        }
      })

      if (hasEmptyOption) {
        hasQuestionErrors = true
      }
    })

    if (hasQuestionErrors) {
      newErrors.questions = "Please fix errors in questions"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  
    if (!validateForm()) {
      return
    }
  
    // Show loading state on the button
    const saveBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span class="inline-block animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></span> Saving...';
    }
  
    try {
      // Format the quiz data according to API requirements
      const quizData = {
        title,
        description,
        category,
        difficulty,
        timeLimitMinutes: timeLimit,
        isPublished: false,
        questions: questions.map(q => ({
          text: q.text,
          options: q.options.map(o => ({
            text: o.text,
            isCorrect: o.id === q.correctOptionId
          }))
        }))
      }
      
      console.log("Submitting quiz data:", quizData);
      
      // Call the API service to create the quiz
      const response = await quizService.createQuiz(quizData);
      console.log("Quiz created successfully:", response);
      
      // Show success message
      alert("Quiz created successfully!");
      
      // Navigate back to quizzes list
      router.push("/admin/quizzes");
      
    } catch (error) {
      console.error("Error creating quiz:", error);
      
      // Handle different types of errors
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          alert("Your session has expired. Please log in again.");
          router.push("/login");
          return;
        }
        
        alert(`Failed to save quiz: ${error.response?.data?.message || error.message}`);
      } else {
        alert("Failed to save quiz. Please try again.");
      }
      
      // Restore the button state
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<svg class="h-5 w-5 mr-2" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg> Save Quiz';
      }
    }
  }
  



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create New Quiz</h1>
          <p className="text-gray-600 dark:text-gray-400">Fill in the details to create a new quiz</p>
        </div>
        <button
          onClick={() => router.push("/admin/quizzes")}
          className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-md shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Quizzes
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Quiz Details */}
        <div className="card p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quiz Details</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`mt-1 input ${errors.title ? "border-red-500 dark:border-red-500" : ""}`}
                placeholder="Enter quiz title"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={`mt-1 input ${errors.description ? "border-red-500 dark:border-red-500" : ""}`}
                placeholder="Enter quiz description"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`mt-1 input ${errors.category ? "border-red-500 dark:border-red-500" : ""}`}
                  placeholder="e.g. Science, History, etc."
                />
                {errors.category && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>}
              </div>

              <div>
                <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  id="timeLimit"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number.parseInt(e.target.value) || 0)}
                  min="1"
                  className={`mt-1 input ${errors.timeLimit ? "border-red-500 dark:border-red-500" : ""}`}
                />
                {errors.timeLimit && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.timeLimit}</p>}
              </div>
            </div>

            {/* Add Difficulty Selector */}
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Difficulty
              </label>
              <div className="mt-1 relative">
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className={`input w-full appearance-none pr-10 ${
                    errors.difficulty ? "border-red-500 dark:border-red-500" : ""
                  }`}
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                  <ChevronDown className="h-5 w-5" />
                </div>
              </div>
              {errors.difficulty && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.difficulty}</p>}
              
              {/* Show badge for selected difficulty */}
              <div className="mt-2">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getDifficultyBadgeColor(
                    difficulty
                  )}`}
                >
                  {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Questions</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Question
            </button>
          </div>

          {errors.questions && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
              {errors.questions}
            </div>
          )}

          <div className="space-y-8">
            {questions.map((question, qIndex) => (
              <div
                key={question.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Question {qIndex + 1}</h3>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(question.id)}
                      className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 focus:outline-none"
                      aria-label="Remove question"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor={`question-${question.id}`}
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Question Text
                    </label>
                    <input
                      type="text"
                      id={`question-${question.id}`}
                      value={question.text}
                      onChange={(e) => updateQuestionText(question.id, e.target.value)}
                      className={`mt-1 input ${errors[`q_${question.id}`] ? "border-red-500 dark:border-red-500" : ""}`}
                      placeholder="Enter question text"
                    />
                    {errors[`q_${question.id}`] && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[`q_${question.id}`]}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Options</label>
                    {question.options.map((option, oIndex) => (
                      <div key={option.id} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id={`option-${option.id}`}
                          name={`correct-${question.id}`}
                          checked={question.correctOptionId === option.id}
                          onChange={() => updateCorrectOption(question.id, option.id)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                        />
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => updateOptionText(question.id, option.id, e.target.value)}
                          className={`flex-1 input ${
                            errors[`o_${question.id}_${option.id}`] ? "border-red-500 dark:border-red-500" : ""
                          }`}
                          placeholder={`Option ${oIndex + 1}`}
                        />
                      </div>
                    ))}
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Select the radio button for the correct answer
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            <Save className="h-5 w-5 mr-2" />
            Save Quiz
          </button>
        </div>
      </form>
    </div>
  )
}