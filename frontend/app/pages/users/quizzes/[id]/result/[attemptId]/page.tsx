"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { quizService } from "@/app/services/api";
import { Trophy, CheckCircle, XCircle, ArrowLeft, Clock } from "lucide-react";

interface Option {
  id: number;
  text: string;
  isCorrect: boolean;
}

interface QuestionResult {
  questionId: number;
  questionText: string;
  correct: boolean;
  pointsAwarded: number;
  correctOptionIds: number[];
  selectedOptionIds: number[];
  options: Option[];
  explanation?: string;
}

interface QuizResult {
  attemptId: number;
  quizId: number;
  quizTitle: string;
  score: number;
  maxPossibleScore: number;
  percentage: number;
  completedAt: string;
  timeTakenSeconds: number;
  questionResults: QuestionResult[];
}

export default function QuizResultPage() {
  const router = useRouter();
  const params = useParams();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        if (!params.attemptId) {
          throw new Error("Attempt ID is missing");
        }
        const data = await quizService.getQuizAttempt(params.attemptId as string);
        
        setResult(data);
      } catch (error) {
        console.error("Error fetching result:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [params.attemptId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-500 font-medium">Result not found</p>
          <Link
            href="/quizzes"
            className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/quizzes"
          className="inline-flex items-center px-4 py-2 mb-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Quizzes
        </Link>

        {/* Summary Card */}
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8 ${result.percentage === 100 ? 'animate-pulse' : ''}`}>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {result.percentage === 100 ? "Perfect Score! 🎉" : "Quiz Complete!"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">{result.quizTitle}</p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-8 mb-6">
              {/* Progress Ring */}
              <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-gray-200 dark:text-gray-700 stroke-current"
                    strokeWidth="10"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                  ></circle>
                  <circle
                    className="text-purple-600 stroke-current"
                    strokeWidth="10"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 * (1 - result.percentage / 100)}
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{result.percentage}%</span>
                </div>
              </div>
              <div className="text-left">
                <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {result.score}/{result.maxPossibleScore}
                </p>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time Taken: {formatTime(result.timeTakenSeconds)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Question Review */}
        <div className="space-y-8">
          {result.questionResults.map((question, index) => (
            <div
              key={question.questionId}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Question {index + 1}
                </h3>
                {question.correct ? (
                  <CheckCircle className="h-6 w-6 text-green-500" aria-label="Correct answer" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500" aria-label="Incorrect answer" />
                )}
              </div>
              <p className="text-gray-900 dark:text-white mb-6 text-lg font-medium">{question.questionText}</p>
              
              {/* Options */}
              <div className="mb-6">
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-3">Options:</p>
                <div className="space-y-3">
                  {question.options.map((option) => (
                    <div
                      key={option.id}
                      className={`p-3 rounded-lg border-2 flex items-center justify-between ${
                        option.isCorrect
                          ? "border-green-500 bg-green-50 dark:bg-green-900/30"
                          : question.selectedOptionIds.includes(option.id)
                          ? "border-red-500 bg-red-50 dark:bg-red-900/30"
                          : "border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                      }`}
                    >
                      <span className="text-gray-900 dark:text-white">{option.text}</span>
                      {question.selectedOptionIds.includes(option.id) && (
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          (Your Answer)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Explanation:</p>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <p className="text-gray-900 dark:text-white">{question.explanation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}