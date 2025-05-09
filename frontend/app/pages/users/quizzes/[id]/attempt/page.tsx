"use client";

import { useState, useEffect, useCallback, useRef } from "react";

declare global {
  interface Window {
    __NEXT_RELOAD__?: boolean;
  }
}
import { useRouter, useParams } from "next/navigation";
import { quizService } from "@/app/services/api";
import { ArrowLeft, ArrowRight, Clock, AlertCircle, X, CheckCircle } from "lucide-react";

interface Question {
  id: number;
  text: string;
  questionType: "MULTIPLE_CHOICE" | "TRUE_FALSE";
  correctOptionIds: number[];
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
  status: "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
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
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  const hasAbandoned = useRef(false);
  const isProcessing = useRef(false);
  const hasInteracted = useRef(false); // Track user interaction
  const isMounted = useRef(true); // Track mount state for Fast Refresh

  // Check if all questions have at least one selected option
  const hasAllAnswers = quiz
    ? quiz.questions.every((question) => answers[question.id]?.length > 0)
    : false;

  // Start or resume quiz
  useEffect(() => {
    isMounted.current = true; // Set mounted on mount
    const startOrResumeAttempt = async () => {
      setLoading(true);
      setError(null);

      // Validate quizId
      const quizId = params.id as string;
      if (!quizId || isNaN(Number(quizId))) {
        setError("Invalid quiz ID. Please select a valid quiz.");
        setLoading(false);
        return;
      }

      try {
        console.log("Calling startOrResumeQuizAttempt for quizId:", quizId);
        const response = await quizService.startOrResumeQuizAttempt(quizId);

        console.log("API Response:", response);

        if (!response?.attempt || !response.quiz) {
          throw new Error("Invalid response from server");
        }

        // Log attempt status
        console.log("Attempt status received:", response.attempt.status);

        // Handle attempt status
        if (response.attempt.status === "COMPLETED") {
          console.log("Attempt already completed, redirecting to results:", response.attempt.id);
          setIsSubmitted(true);
          router.push(`/quizzes/${response.quiz.id}/result/${response.attempt.id}`);
          return;
        } else if (response.attempt.status === "ABANDONED") {
          console.log("Attempt is abandoned, redirecting to quizzes");
          setError("This quiz attempt was abandoned. Please start a new attempt.");
          router.push("/quizzes");
          return;
        }

        setAttempt(response.attempt);
        setQuiz(response.quiz);

        // Calculate remaining time based on startedAt
        const startedAt = new Date(response.attempt.startedAt);
        const elapsedSeconds = Math.floor((Date.now() - startedAt.getTime()) / 1000);
        const totalTime = response.quiz.timeLimitMinutes * 60;
        const remainingTime = Math.max(0, totalTime - elapsedSeconds);
        console.log("Timer setup:", { startedAt, elapsedSeconds, totalTime, remainingTime });
        setTimeLeft(remainingTime);

        // Load existing answers
        if (response.attempt.answers) {
          const loadedAnswers = response.attempt.answers.reduce(
            (acc: Record<number, number[]>, answer: any) => {
              acc[answer.questionId] = answer.selectedOptionIds.map(Number);
              return acc;
            },
            {}
          );
          console.log("Loaded existing answers:", loadedAnswers);
          setAnswers(loadedAnswers);
        }
      } catch (err: any) {
        console.error("Quiz load error:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to start or resume quiz. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    startOrResumeAttempt();

    return () => {
      isMounted.current = false; // Set unmounted on cleanup
    };
  }, [params.id, router]);

  // Browser navigation prompt
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (attempt && !isSubmitted && attempt.status === "IN_PROGRESS" && !submitting) {
        e.preventDefault();
        e.returnValue = "You have unsaved quiz progress. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [attempt, isSubmitted, submitting]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Skip cleanup during hot reload or Fast Refresh
      if (process.env.NODE_ENV === "development" && typeof window !== "undefined" && window.__NEXT_RELOAD__) {
        console.log("Cleanup: Skipped due to hot reload");
        return;
      }

      // Skip cleanup if no user interaction occurred
      if (!hasInteracted.current) {
        console.log("Cleanup: Skipped due to no user interaction");
        return;
      }

      if (
        attempt &&
        !isSubmitted &&
        !submitting &&
        attempt.status === "IN_PROGRESS" &&
        !hasAbandoned.current &&
        !isProcessing.current
      ) {
        hasAbandoned.current = true;
        console.log("Cleanup: Attempting to abandon attempt:", attempt.id);

        // Delay cleanup to allow Fast Refresh remount
        setTimeout(() => {
          // Skip if component has remounted
          if (isMounted.current) {
            console.log("Cleanup: Skipped due to component remount during Fast Refresh");
            return;
          }

          quizService.abandonQuizAttempt(attempt.id, "AUTO")
            .then(() => {
              setAttempt((prev) => (prev ? { ...prev, status: "ABANDONED" } : null));
              console.log("Cleanup: Attempt abandoned successfully:", attempt.id);
            })
            .catch((err) => {
              if (err.message !== "Only in-progress attempts can be abandoned") {
                console.error("Cleanup: Failed to abandon quiz:", err);
              } else {
                console.log("Cleanup: Skipped abandonment as attempt is not in progress");
              }
            });
        }, 1000); // Increased to 1000ms
      } else if (submitting || isSubmitted) {
        console.log("Cleanup: Skipped due to submission in progress or completed", { submitting, isSubmitted });
      }
    };
  }, [attempt, isSubmitted, submitting]);

  // Timer logic
  useEffect(() => {
    if (!timeLeft) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          handleTimeExpired();
          clearInterval(timer);
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleTimeExpired = async () => {
    if (isProcessing.current) return;

    isProcessing.current = true;
    try {
      if (hasAllAnswers) {
        console.log("Time expired: Attempting to submit attempt:", attempt?.id);
        await handleSubmit();
      } else {
        setError("Time expired! Your attempt has been marked as abandoned.");
        console.log("Time expired: Attempting to abandon attempt:", attempt?.id);
        await handleAbandon("TIME_EXPIRED");
      }
    } finally {
      isProcessing.current = false;
    }
  };

  const handleAbandon = async (reason: "USER" | "AUTO" | "TIME_EXPIRED") => {
    if (!attempt || submitting || hasAbandoned.current || isProcessing.current || attempt.status !== "IN_PROGRESS") {
      console.log("Abandon skipped:", {
        attemptId: attempt?.id,
        submitting,
        hasAbandoned: hasAbandoned.current,
        isProcessing: isProcessing.current,
        status: attempt?.status,
        reason,
      });
      return;
    }

    isProcessing.current = true;
    try {
      hasAbandoned.current = true;
      console.log("Abandoning attempt:", attempt.id, "Reason:", reason);
      await quizService.abandonQuizAttempt(attempt.id, reason);
      setAttempt((prev) => (prev ? { ...prev, status: "ABANDONED" } : null));
      console.log("Attempt abandoned successfully:", attempt.id);
    } catch (err: any) {
      console.error("Failed to abandon quiz:", err);
      if (err.message !== "Only in-progress attempts can be abandoned") {
        setError("Failed to abandon quiz. Please try again.");
      }
    } finally {
      isProcessing.current = false;
    }
  };

  const handleAnswer = useCallback(
    (questionId: number, optionId: number, multiple: boolean, maxSelections: number) => {
      if (attempt?.status !== "IN_PROGRESS") {
        console.log("Answer selection skipped: Attempt not in progress:", attempt?.status);
        return;
      }

      hasInteracted.current = true; // Mark interaction
      setAnswers((prev) => {
        const current = prev[questionId] || [];
        if (multiple) {
          if (current.includes(optionId)) {
            return {
              ...prev,
              [questionId]: current.filter((id) => id !== optionId),
            };
          } else if (current.length < maxSelections) {
            return {
              ...prev,
              [questionId]: [...current, optionId],
            };
          }
          return prev;
        }
        return { ...prev, [questionId]: [optionId] };
      });
    },
    [attempt?.status]
  );

  const handleNext = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      hasInteracted.current = true; // Mark interaction
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      hasInteracted.current = true; // Mark interaction
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!attempt || submitting || isProcessing.current || attempt.status !== "IN_PROGRESS") {
      setError(
        attempt?.status === "COMPLETED"
          ? "This quiz has already been submitted."
          : attempt?.status === "ABANDONED"
          ? "This quiz attempt has been abandoned and cannot be submitted."
          : "Submission in progress or invalid quiz attempt state."
      );
      console.log("Submission skipped:", {
        attemptId: attempt?.id,
        submitting,
        isProcessing: isProcessing.current,
        status: attempt?.status,
      });
      return;
    }

    if (!hasAllAnswers) {
      setError("Please answer all questions before submitting.");
      console.log("Submission skipped: Not all questions answered");
      return;
    }

    isProcessing.current = true;
    setSubmitting(true);
    setError(null);

    try {
      console.log("Submitting attempt:", attempt.id, "Status:", attempt.status);
      const result = await quizService.submitQuizAttempt(
        attempt.id,
        Object.entries(answers).map(([questionId, selectedOptionIds]) => ({
          questionId: questionId,
          selectedOptionIds: selectedOptionIds.map(String),
        }))
      );
      setAttempt((prev) => (prev ? { ...prev, status: "COMPLETED" } : null));
      setIsSubmitted(true);
      console.log("Attempt submitted successfully:", attempt.id);
      router.push(`/quizzes/${quiz?.id}/result/${result.attemptId}`);
    } catch (err: any) {
      console.error("Submission failed:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to submit quiz. The attempt may have been abandoned or completed.";
      setError(errorMessage);
      if (errorMessage.includes("Only in-progress attempts can be submitted")) {
        setAttempt((prev) => (prev ? { ...prev, status: "ABANDONED" } : null));
        console.log("Updated attempt status to ABANDONED due to submission failure:", attempt.id);
      }
    } finally {
      setSubmitting(false);
      isProcessing.current = false;
    }
  };

  const handleBack = () => {
    if (attempt && !isSubmitted && attempt.status === "IN_PROGRESS") {
      hasInteracted.current = true; // Mark interaction
      setShowConfirmLeave(true);
    } else {
      console.log("Navigating to /quizzes: Attempt not in progress or already submitted");
      router.push("/quizzes");
    }
  };

  const confirmLeave = async () => {
    if (attempt && !isSubmitted && attempt.status === "IN_PROGRESS") {
      console.log("Confirming leave: Attempting to abandon attempt:", attempt.id);
      await handleAbandon("USER");
    }
    setShowConfirmLeave(false);
    router.push("/quizzes");
  };

  const cancelLeave = () => {
    setShowConfirmLeave(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Preparing your quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !attempt || !quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Quiz Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error || "Unable to load quiz"}</p>
          <button
            onClick={() => router.push("/quizzes")}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
          >
            Return to Quizzes
          </button>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const maxSelections = question.correctOptionIds.length;
  const progressPercentage = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const minutesLeft = timeLeft ? Math.floor(timeLeft / 60) : 0;
  const secondsLeft = timeLeft ? timeLeft % 60 : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center justify-between animate-fade-in">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
              aria-label="Dismiss error"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 transition-all duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{quiz.title}</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{quiz.description}</p>
            </div>
            <div className="flex items-center bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-300 mr-2" />
              <span className="font-medium text-purple-800 dark:text-purple-200">
                {String(minutesLeft).padStart(2, "0")}:{String(secondsLeft).padStart(2, "0")}
              </span>
            </div>
          </div>

          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-3">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            <div className="flex-1 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 transition-all duration-300">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{question.text}</h2>

          <div className="space-y-3">
            {question.options.map((option) => {
              const isSelected = answers[question.id]?.includes(option.id);
              const isDisabled = !isSelected && answers[question.id]?.length >= maxSelections;

              return (
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
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 flex items-center
                    ${isSelected
                      ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700"}
                    ${isDisabled || attempt?.status !== "IN_PROGRESS" ? "opacity-60 cursor-not-allowed" : ""}`}
                  disabled={isDisabled}
                >
                  {isSelected ? (
                    <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3 flex-shrink-0" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600 mr-3 flex-shrink-0" />
                  )}
                  <span className="text-gray-800 dark:text-gray-200">{option.text}</span>
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            {maxSelections > 1 ? `Select up to ${maxSelections} options` : "Select one option"}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-col-reverse sm:flex-row justify-between gap-4">
          <button
            onClick={handleBack}
            className="flex items-center justify-center px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Exit Quiz
          </button>

          <div className="flex gap-3 justify-end">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`flex items-center justify-center px-6 py-3 rounded-lg transition-colors shadow-sm
                ${currentQuestion === 0
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"}`}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Previous
            </button>

            {currentQuestion === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting || !hasAllAnswers || attempt?.status !== "IN_PROGRESS"}
                className={`px-6 py-3 rounded-lg transition-colors shadow-sm flex items-center justify-center
                  ${submitting || !hasAllAnswers || attempt?.status !== "IN_PROGRESS"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"}`}
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  "Submit Quiz"
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-sm"
              >
                Next
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Leave Confirmation Modal */}
      {showConfirmLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl animate-fade-in">
            <div className="flex items-start mb-4">
              <AlertCircle className="h-6 w-6 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Leave Quiz?</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Are you sure you want to leave? Your quiz progress will be lost.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={cancelLeave}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLeave}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Leave Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}