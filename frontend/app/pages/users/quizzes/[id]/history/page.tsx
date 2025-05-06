"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // Use useParams instead of useRouter
import { userService } from "@/app/services/api";
import { Clock, Award, ChevronLeft } from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/app/pages/users/dashboard/layout";

type QuestionResult = {
  questionText: string;
  correct: boolean;
  pointsAwarded: number;
  correctOptionIds: number[];
  selectedOptionIds: number[];
};

type QuizAttemptDetails = {
  quizTitle: string;
  score: number;
  maxPossibleScore: number;
  percentage: number;
  completedAt: string | null;
  timeTakenSeconds: number | null;
  questionResults: QuestionResult[];
};

export default function QuizAttemptHistoryPage() {
  const { id } = useParams(); // Get the quiz attempt ID from the URL
  const [attemptDetails, setAttemptDetails] = useState<QuizAttemptDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchAttemptDetails = async () => {
      try {
        const data = await userService.getQuizAttemptDetails(id as string);
        setAttemptDetails(data);
      } catch (error) {
        console.error("Error fetching quiz attempt details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttemptDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!attemptDetails) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <p className="text-gray-600 dark:text-gray-400">No details found for this attempt.</p>
      </div>
    );
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const formatTimeSpent = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link href="/users/quizzes" className="flex items-center text-blue-600 hover:underline mb-6">
          <ChevronLeft className="h-5 w-5 mr-2" />
          Back to My Quizzes
        </Link>

        {/* Quiz Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {attemptDetails.quizTitle}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <Award className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-gray-600 dark:text-gray-400">
                Score: {attemptDetails.score}/{attemptDetails.maxPossibleScore} (
                {Math.round(attemptDetails.percentage)}%)
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-gray-600 dark:text-gray-400">
                Time Spent: {formatTimeSpent(attemptDetails.timeTakenSeconds)}
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-gray-600 dark:text-gray-400">
                Completed: {formatDateTime(attemptDetails.completedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Question Results */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Question Results</h2>
          <div className="space-y-4">
            {attemptDetails.questionResults.map((question, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  question.correct
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-red-100 dark:bg-red-900/30"
                }`}
              >
                <p className="text-gray-900 dark:text-white font-medium mb-2">
                  {index + 1}. {question.questionText}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <strong>Correct:</strong> {question.correct ? "Yes" : "No"}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <strong>Points Awarded:</strong> {question.pointsAwarded}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <strong>Selected Options:</strong> {question.selectedOptionIds.join(", ") || "None"}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <strong>Correct Options:</strong> {question.correctOptionIds.join(", ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}