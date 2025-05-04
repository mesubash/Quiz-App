"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { quizService } from "@/app/services/api";
import { ArrowLeft, ArrowRight, Clock, AlertCircle } from "lucide-react";

interface Question {
  id: number;
  text: string;
  questionType: "MULTIPLE_CHOICE" | "TRUE_FALSE";
  correctOptionIds: number[]; // Added correctOptionIds
  options: {
    id: number;
    text: string;
  }[];
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  timeLimitMinutes: number;
  questions: Question[];
}

interface QuizAttempt {
  id: number;
  quizId: number;
  userId: number;
  startedAt: string;
  completedAt: string | null;
  score: number;
  timeTakenSeconds: number | null;
  status: string;
}

export default function QuizAttemptPage() {
  const router = useRouter();
  const params = useParams();
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Unified start/resume logic
  useEffect(() => {
    const startOrResumeAttempt = async () => {
      setLoading(true);
      setError(null);
      try {
        let response;
        try {
          response = await quizService.startQuizAttempt(params.id as string);
        } catch (err: any) {
          if (
            err.response &&
            err.response.status === 400 &&
            err.response.data &&
            typeof err.response.data.message === "string" &&
            err.response.data.message.includes("active attempt")
          ) {
            response = await quizService.resumeQuizAttempt(params.id as string);
          } else {
            throw err;
          }
        }

        console.log("API Response:", response);

        if (!response || !response.attempt || !response.quiz) {
          throw new Error("Invalid response from server");
        }

        setAttempt(response.attempt);
        setQuiz(response.quiz);
        setTimeLeft(response.quiz.timeLimitMinutes * 60);
      } catch (err) {
        console.error(err);
        setError("Failed to start or resume quiz. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    startOrResumeAttempt();
  }, [params.id]);

  // Timer countdown
  useEffect(() => {
    if (!timeLeft) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          handleSubmit();
          clearInterval(timer);
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const handleAnswer = (questionId: number, optionId: number, multiple: boolean, maxSelections: number) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      if (multiple) {
        if (current.includes(optionId)) {
          // Deselect the option
          return {
            ...prev,
            [questionId]: current.filter((id) => id !== optionId),
          };
        } else if (current.length < maxSelections) {
          // Select the option if within the limit
          return {
            ...prev,
            [questionId]: [...current, optionId],
          };
        }
        // Do nothing if the limit is reached
        return prev;
      }
      // Single selection
      return { ...prev, [questionId]: [optionId] };
    });
  };

  const handleNext = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!attempt) return;
    try {
      const result = await quizService.submitQuizAttempt(
        attempt.id,
        Object.entries(answers).map(([questionId, selectedOptionIds]) => ({
          questionId: questionId,
          selectedOptionIds: selectedOptionIds.map(String),
        }))
      );
      // Redirect to the correct results page
      router.push(`/quizzes/${quiz?.id}/result/${result.attemptId}`);
    } catch (err: any) {
      if (err.response && err.response.status === 400) {
        setError(err.response.data.message || "Failed to submit quiz. Please try again.");
      } else {
        setError("Failed to submit quiz. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !attempt || !quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">{error || "Quiz not found"}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const maxSelections = question.correctOptionIds.length; // Restrict based on correctOptionIds length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {quiz.title}
            </h1>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <Clock className="h-5 w-5 mr-2" />
              <span>
                {Math.floor(timeLeft! / 60)}:
                {String(timeLeft! % 60).padStart(2, "0")}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </div>
            <div className="h-2 flex-1 mx-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-300"
                style={{
                  width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl text-gray-900 dark:text-white mb-6">
            {question.text}
          </h2>

          <div className="space-y-3">
            {question.options.map((option) => (
              <button
                key={option.id}
                onClick={() =>
                  handleAnswer(
                    question.id,
                    option.id,
                    question.questionType === "MULTIPLE_CHOICE",
                    maxSelections
                  )
                }
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 
                  ${answers[question.id]?.includes(option.id)
                    ? "border-purple-600 bg-purple-50 dark:bg-purple-900/30"
                    : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700"
                  }`}
                disabled={
                  !answers[question.id]?.includes(option.id) &&
                  answers[question.id]?.length >= maxSelections
                } // Disable if max selections reached
              >
                <span className="text-gray-900 dark:text-white">{option.text}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            You can select up to {maxSelections} option{maxSelections > 1 ? "s" : ""}.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200
              ${currentQuestion === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Previous
          </button>

          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200"
            >
              Next
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}