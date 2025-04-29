"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Plus, X, Save, ArrowLeft, ChevronDown } from "lucide-react"
import { quizService } from "@/app/services/api"
import axios from "axios"
import { QuestionType, type QuizData } from "@/app/types/quiz"

interface Option {
  id: string
  text: string
}

interface Question {
  id: string
  text: string
  type: QuestionType
  isMultipleCorrect: boolean
  options: Option[]
  correctOptionIds: string[]
  difficulty: string
  explanation: string
}

interface Toast {
  id: string
  message: string
  type: "success" | "error"
}

export default function EditQuizPage() {
  const router = useRouter()
  const params = useParams()
  const quizId = params.id as string

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [timeLimit, setTimeLimit] = useState(10)
  const [questions, setQuestions] = useState<Question[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toasts, setToasts] = useState<Toast[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quiz = await quizService.getQuizById(Number(quizId))
        setTitle(quiz.title || "")
        setDescription(quiz.description || "")
        setCategory(quiz.category || "")
        setTimeLimit(quiz.timeLimitMinutes || 10)
        setQuestions(
          quiz.questions.map((q: any, index: number) => ({
            id: `q${index + 1}`,
            text: q.text || "",
            type: q.questionType || QuestionType.MULTIPLE_CHOICE,
            isMultipleCorrect: q.isMultipleCorrect || false,
            options: q.options.map((o: any, oIndex: number) => ({
              id: `q${index + 1}_o${oIndex + 1}`,
              text: o.text || "",
            })),
            correctOptionIds: q.options
              .filter((o: any) => o.isCorrect)
              .map((_: any, oIndex: number) => `q${index + 1}_o${oIndex + 1}`),
            difficulty: q.difficulty || "EASY",
            explanation: q.explanation || "",
          }))
        )
      } catch (error) {
        console.error("Error fetching quiz:", error)
        addToast("Failed to load quiz. Please try again.", "error")
      } finally {
        setLoading(false)
      }
    }

    if (quizId) {
      fetchQuiz()
    } else {
      addToast("Invalid quiz ID.", "error")
      setLoading(false)
    }
  }, [quizId])

  // Rest of your component code remains the same...
  // [Previous implementation continues with all the functions and JSX]

  // Auto-remove toast after 5 seconds
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((prev) => prev.slice(1))
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [toasts])

  const addToast = (message: string, type: "success" | "error") => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const getDifficultyBadgeColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
    }
  }

  const addQuestion = () => {
    const newQuestionId = `q${questions.length + 1}`
    setQuestions([
      ...questions,
      {
        id: newQuestionId,
        text: "",
        type: QuestionType.MULTIPLE_CHOICE,
        isMultipleCorrect: false,
        options: [
          { id: `${newQuestionId}_o1`, text: "" },
          { id: `${newQuestionId}_o2`, text: "" },
          { id: `${newQuestionId}_o3`, text: "" },
          { id: `${newQuestionId}_o4`, text: "" },
        ],
        correctOptionIds: [],
        difficulty: "EASY",
        explanation: "",
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

  const updateQuestionType = (questionId: string, type: QuestionType) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              type,
              isMultipleCorrect: type === QuestionType.TRUE_FALSE ? false : q.isMultipleCorrect,
              options:
                type === QuestionType.TRUE_FALSE
                  ? [
                      { id: `${q.id}_o1`, text: "True" },
                      { id: `${q.id}_o2`, text: "False" },
                    ]
                  : [
                      { id: `${q.id}_o1`, text: "" },
                      { id: `${q.id}_o2`, text: "" },
                      { id: `${q.id}_o3`, text: "" },
                      { id: `${q.id}_o4`, text: "" },
                    ],
              correctOptionIds: [],
            }
          : q
      )
    )
  }

  const updateQuestionMultipleCorrect = (questionId: string, isMultipleCorrect: boolean) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              isMultipleCorrect,
              correctOptionIds: isMultipleCorrect ? q.correctOptionIds : q.correctOptionIds.slice(0, 1),
            }
          : q
      )
    )
  }

  const updateQuestionDifficulty = (questionId: string, difficulty: string) => {
    setQuestions(questions.map((q) => (q.id === questionId ? { ...q, difficulty } : q)))
  }

  const updateQuestionExplanation = (questionId: string, explanation: string) => {
    setQuestions(questions.map((q) => (q.id === questionId ? { ...q, explanation } : q)))
  }

  const updateOptionText = (questionId: string, optionId: string, text: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((o) => (o.id === optionId ? { ...o, text } : o)),
            }
          : q
      )
    )
  }

  const toggleCorrectOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id !== questionId) return q
        const isTrueFalse = q.type === QuestionType.TRUE_FALSE
        const isMultipleCorrect = q.isMultipleCorrect
        const currentCorrect = q.correctOptionIds
        let newCorrect: string[]

        if (isTrueFalse || !isMultipleCorrect) {
          newCorrect = [optionId]
        } else {
          if (currentCorrect.includes(optionId)) {
            newCorrect = currentCorrect.filter((id) => id !== optionId)
          } else if (currentCorrect.length < 3) {
            newCorrect = [...currentCorrect, optionId]
          } else {
            return q
          }
        }

        return { ...q, correctOptionIds: newCorrect }
      })
    )
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) newErrors.title = "Title is required"
    if (!description.trim()) newErrors.description = "Description is required"
    if (!category.trim()) newErrors.category = "Category is required"
    if (timeLimit <= 0) newErrors.timeLimit = "Time limit must be greater than 0"

    let hasQuestionErrors = false
    questions.forEach((question) => {
      if (!question.text.trim()) {
        newErrors[`q_${question.id}`] = "Question text is required"
        hasQuestionErrors = true
      }
      if (!question.difficulty) {
        newErrors[`d_${question.id}`] = "Difficulty is required"
        hasQuestionErrors = true
      }
      if (!question.explanation.trim()) {
        newErrors[`e_${question.id}`] = "Explanation is required"
        hasQuestionErrors = true
      }
      if (question.correctOptionIds.length === 0) {
        newErrors[`c_${question.id}`] = "At least one correct answer is required"
        hasQuestionErrors = true
      }

      if (question.type === QuestionType.MULTIPLE_CHOICE) {
        let hasEmptyOption = false
        question.options.forEach((option) => {
          if (!option.text.trim()) {
            newErrors[`o_${question.id}_${option.id}`] = "Option text is required"
            hasEmptyOption = true
          }
        })
        if (hasEmptyOption) {
          hasQuestionErrors = true
        }
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

    const saveBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement
    if (saveBtn) {
      saveBtn.disabled = true
      saveBtn.innerHTML = '<span class="inline-block animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></span> Saving...'
    }

    try {
      const quizData: QuizData = {
        title,
        description,
        category,
        timeLimitMinutes: timeLimit,
        isPublished: false,
        questions: questions.map((q) => ({
          text: q.text,
          questionType: q.type,
          isMultipleCorrect: q.isMultipleCorrect,
          difficulty: q.difficulty as "EASY" | "MEDIUM" | "HARD",
          explanation: q.explanation,
          options: q.options.map((o) => ({
            text: o.text,
            isCorrect: q.correctOptionIds.includes(o.id),
          })),
        })),
      }

      await quizService.updateQuiz(Number(quizId), quizData)
      addToast("Quiz updated successfully!", "success")
      setTimeout(() => router.push("/admin/quizzes"), 1000)
    } catch (error) {
      console.error("Error updating quiz:", error)

      let errorMessage = "Failed to update quiz. Please try again."
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          errorMessage = "Your session has expired. Please log in again."
        } else {
          errorMessage = error.response?.data?.message || error.message
        }
      }
      addToast(errorMessage, "error")

      if (saveBtn) {
        saveBtn.disabled = false
        saveBtn.innerHTML =
          '<svg class="h-5 w-5 mr-2" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg> Save Changes'
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading quiz data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center p-4 rounded-lg shadow-lg transform transition-all duration-300 animate-slide-in ${
              toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-4 text-white hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Quiz</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Modify your quiz details and questions</p>
        </div>
        <button
          onClick={() => router.push("/admin/quizzes")}
          className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Quizzes
        </button>
      </div>

      <form className="space-y-8" aria-label="Edit quiz form">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-200 hover:shadow-xl">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Quiz Details</h2>
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`mt-1 block w-full rounded-md border ${
                  errors.title ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
                placeholder="Enter quiz title"
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? "title-error" : undefined}
              />
              {errors.title && (
                <p id="title-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={`mt-1 block w-full rounded-md border ${
                  errors.description ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
                placeholder="Enter quiz description"
                aria-invalid={!!errors.description}
                aria-describedby={errors.description ? "description-error" : undefined}
              />
              {errors.description && (
                <p id="description-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.category ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  } px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
                  placeholder="e.g. Science, History"
                  aria-invalid={!!errors.category}
                  aria-describedby={errors.category ? "category-error" : undefined}
                />
                {errors.category && (
                  <p id="category-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.category}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="timeLimit"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  id="timeLimit"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number.parseInt(e.target.value) || 0)}
                  min="1"
                  className={`mt-1 block w-full rounded-md border ${
                    errors.timeLimit ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  } px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
                  aria-invalid={!!errors.timeLimit}
                  aria-describedby={errors.timeLimit ? "timeLimit-error" : undefined}
                />
                {errors.timeLimit && (
                  <p id="timeLimit-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.timeLimit}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-200 hover:shadow-xl">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Questions</h2>

          {errors.questions && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
              {errors.questions}
            </div>
          )}

          <div className="space-y-6">
            {questions.map((question, qIndex) => (
              <div
                key={question.id}
                className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600 relative"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Question {qIndex + 1}
                  </h3>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(question.id)}
                      className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200 absolute top-4 right-4"
                      aria-label="Remove question"
                    >
                      <X className="h-5 w-5" />
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
                      className={`mt-1 block w-full rounded-md border ${
                        errors[`q_${question.id}`] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                      } px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
                      placeholder="Enter question text"
                      aria-invalid={!!errors[`q_${question.id}`]}
                      aria-describedby={errors[`q_${question.id}`] ? `question-error-${question.id}` : undefined}
                    />
                    {errors[`q_${question.id}`] && (
                      <p
                        id={`question-error-${question.id}`}
                        className="mt-1 text-sm text-red-600 dark:text-red-400"
                      >
                        {errors[`q_${question.id}`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor={`type-${question.id}`}
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Question Type
                    </label>
                    <div className="mt-1 relative">
                      <select
                        id={`type-${question.id}`}
                        value={question.type === QuestionType.MULTIPLE_CHOICE ? "MCQ" : "TRUE_FALSE"}
                        onChange={(e) =>
                          updateQuestionType(
                            question.id,
                            e.target.value === "MCQ" ? QuestionType.MULTIPLE_CHOICE : QuestionType.TRUE_FALSE
                          )
                        }
                        className={`block w-full rounded-md border ${
                          errors[`t_${question.id}`] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                        } px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none transition-all duration-200`}
                        aria-invalid={!!errors[`t_${question.id}`]}
                        aria-describedby={errors[`t_${question.id}`] ? `type-error-${question.id}` : undefined}
                      >
                        <option value="MCQ">Multiple Choice</option>
                        <option value="TRUE_FALSE">True/False</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                    {errors[`t_${question.id}`] && (
                      <p id={`type-error-${question.id}`} className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors[`t_${question.id}`]}
                      </p>
                    )}
                  </div>

                  {question.type === QuestionType.MULTIPLE_CHOICE && (
                    <div>
                      <label
                        htmlFor={`multiple-correct-${question.id}`}
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Correct Answer Type
                      </label>
                      <div className="mt-1 relative">
                        <select
                          id={`multiple-correct-${question.id}`}
                          value={question.isMultipleCorrect ? "MULTIPLE" : "SINGLE"}
                          onChange={(e) =>
                            updateQuestionMultipleCorrect(question.id, e.target.value === "MULTIPLE")
                          }
                          className="block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none transition-all duration-200"
                        >
                          <option value="SINGLE">Single Correct Answer</option>
                          <option value="MULTIPLE">Multiple Correct Answers</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor={`difficulty-${question.id}`}
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Difficulty
                    </label>
                    <div className="mt-1 relative">
                      <select
                        id={`difficulty-${question.id}`}
                        value={question.difficulty}
                        onChange={(e) => updateQuestionDifficulty(question.id, e.target.value)}
                        className={`block w-full rounded-md border ${
                          errors[`d_${question.id}`] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                        } px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none transition-all duration-200`}
                        aria-invalid={!!errors[`d_${question.id}`]}
                        aria-describedby={errors[`d_${question.id}`] ? `difficulty-error-${question.id}` : undefined}
                      >
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                    {errors[`d_${question.id}`] && (
                      <p
                        id={`difficulty-error-${question.id}`}
                        className="mt-1 text-sm text-red-600 dark:text-red-400"
                      >
                        {errors[`d_${question.id}`]}
                      </p>
                    )}
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getDifficultyBadgeColor(
                          question.difficulty
                        )}`}
                      >
                        {question.difficulty.charAt(0) + question.difficulty.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor={`explanation-${question.id}`}
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Explanation
                    </label>
                    <textarea
                      id={`explanation-${question.id}`}
                      value={question.explanation}
                      onChange={(e) => updateQuestionExplanation(question.id, e.target.value)}
                      rows={3}
                      className={`mt-1 block w-full rounded-md border ${
                        errors[`e_${question.id}`] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                      } px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
                      placeholder="Enter explanation for the correct answer"
                      aria-invalid={!!errors[`e_${question.id}`]}
                      aria-describedby={errors[`e_${question.id}`] ? `explanation-error-${question.id}` : undefined}
                    />
                    {errors[`e_${question.id}`] && (
                      <p
                        id={`explanation-error-${question.id}`}
                        className="mt-1 text-sm text-red-600 dark:text-red-400"
                      >
                        {errors[`e_${question.id}`]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {question.type === QuestionType.MULTIPLE_CHOICE
                        ? question.isMultipleCorrect
                          ? "Options (Select up to 3 correct answers)"
                          : "Options (Select one correct answer)"
                        : "Options (Select one correct answer)"}
                    </label>
                    {question.options.map((option, oIndex) => (
                      <div key={option.id} className="flex items-center space-x-3">
                        {question.type === QuestionType.MULTIPLE_CHOICE && !question.isMultipleCorrect ? (
                          <input
                            type="radio"
                            id={`option-${option.id}`}
                            name={`correct-${question.id}`}
                            checked={question.correctOptionIds.includes(option.id)}
                            onChange={() => toggleCorrectOption(question.id, option.id)}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                            aria-label={`Option ${oIndex + 1} for question ${qIndex + 1}`}
                          />
                        ) : (
                          <input
                            type="checkbox"
                            id={`option-${option.id}`}
                            checked={question.correctOptionIds.includes(option.id)}
                            onChange={() => toggleCorrectOption(question.id, option.id)}
                            disabled={
                              question.type === QuestionType.MULTIPLE_CHOICE &&
                              question.isMultipleCorrect &&
                              question.correctOptionIds.length >= 3 &&
                              !question.correctOptionIds.includes(option.id)
                            }
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 disabled:opacity-50"
                            aria-label={`Option ${oIndex + 1} for question ${qIndex + 1}`}
                          />
                        )}
                        {question.type === QuestionType.TRUE_FALSE ? (
                          <span className="flex-1 text-gray-900 dark:text-white">{option.text}</span>
                        ) : (
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => updateOptionText(question.id, option.id, e.target.value)}
                            className={`flex-1 rounded-md border ${
                              errors[`o_${question.id}_${option.id}`]
                                ? "border-red-500"
                                : "border-gray-300 dark:border-gray-600"
                            } px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
                            placeholder={`Option ${oIndex + 1}`}
                            aria-invalid={!!errors[`o_${question.id}_${option.id}`]}
                            aria-describedby={
                              errors[`o_${question.id}_${option.id}`]
                                ? `option-error-${option.id}`
                                : undefined
                            }
                          />
                        )}
                      </div>
                    ))}
                    {errors[`c_${question.id}`] && (
                      <p id={`correct-error-${question.id}`} className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors[`c_${question.id}`]}
                      </p>
                    )}
                    {question.type === QuestionType.MULTIPLE_CHOICE &&
                      question.options.map((option) => (
                        errors[`o_${question.id}_${option.id}`] && (
                          <p
                            key={option.id}
                            id={`option-error-${option.id}`}
                            className="mt-1 text-sm text-red-600 dark:text-red-400"
                          >
                            {errors[`o_${question.id}_${option.id}`]}
                          </p>
                        )
                      ))}
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {question.type === QuestionType.MULTIPLE_CHOICE
                        ? question.isMultipleCorrect
                          ? "Check the boxes for all correct answers (up to 3)"
                          : "Select the radio button for the correct answer"
                        : "Check the box for the correct answer"}
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another Question
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            <Save className="h-5 w-5 mr-2" />
            Save Changes
          </button>
        </div>
      </form>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}