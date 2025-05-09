"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { userService, quizService } from "@/app/services/api";
import { BookOpen, Trophy, Clock, CheckCircle, BarChart3, Award, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [recentQuizzes, setRecentQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [profileData, historyData, quizzesData] = await Promise.all([
          userService.getProfile(),
          userService.getQuizHistory(),
          quizService.getAllQuizzes(),
        ]);

        setProfile(profileData);
        setQuizHistory(historyData);
        setRecentQuizzes(quizzesData.slice(0, 3)); // Get the latest 3 quizzes
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
        router.push("/login"); // Redirect to login if there's an error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Please try again later or contact support if the issue persists.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {profile?.name || "User"}!
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          You've taken {profile?.quizzesTaken || 0} quizzes with an average score of{" "}
          {profile?.averageScore || 0}%.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
          title="Quizzes Taken"
          value={profile?.quizzesTaken || 0}
        />
        <StatCard
          icon={<BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />}
          title="Average Score"
          value={`${profile?.averageScore || 0}%`}
        />
        <StatCard
          icon={<Trophy className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
          title="Ranking"
          value="#42"
        />
      </div>

      {/* Recent Activity and Available Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <ActivityCard
          title="Recent Activity"
          icon={<Award className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />}
          data={quizHistory}
          fallbackMessage="No activity yet"
          fallbackLink="/quizzes"
          fallbackLinkText="Take your first quiz"
        />

        {/* Available Quizzes */}
        <QuizCard
          title="Available Quizzes"
          icon={<BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />}
          data={recentQuizzes}
        />
      </div>
    </div>
  );
}

function StatCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string | number }) {
  return (
    <div className="card p-6">
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-4">{icon}</div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ActivityCard({
  title,
  icon,
  data,
  fallbackMessage,
  fallbackLink,
  fallbackLinkText,
}: {
  title: string;
  icon: React.ReactNode;
  data: any[];
  fallbackMessage: string;
  fallbackLink: string;
  fallbackLinkText: string;
}) {
  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          {icon}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        </div>
        <Link href="/profile" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center">
          View all
          <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </div>

      {data.length > 0 ? (
        <div className="space-y-4">
          {data.map((item, index) => (
            <div
              key={item.id || index}
              className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{item.quizName}</h3>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-3 w-3 mr-1" />
                  {item.date}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full flex items-center ${
                      Math.round((item.score / item.total) * 100) >= 80
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                        : Math.round((item.score / item.total) * 100) >= 60
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                        : Math.round((item.score / item.total) * 100) >= 40
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                    }`}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {Math.round((item.score / item.total) * 100)}%
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {item.score}/{item.total} correct
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">{fallbackMessage}</p>
          <Link href={fallbackLink} className="mt-2 inline-block text-blue-600 dark:text-blue-400 hover:underline">
            {fallbackLinkText}
          </Link>
        </div>
      )}
    </div>
  );
}

function QuizCard({ title, icon, data }: { title: string; icon: React.ReactNode; data: any[] }) {
  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          {icon}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        </div>
        <Link href="/quizzes" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center">
          View all
          <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </div>

      <div className="space-y-4">
        {data.map((quiz) => (
          <div
            key={quiz.id}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium text-gray-900 dark:text-white">{quiz.title}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{quiz.description}</p>
            <div className="mt-3 flex justify-between items-center">
              <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {quiz.timeLimit} min
                </span>
                <span className="flex items-center">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {quiz.questions.length} questions
                </span>
              </div>
              <Link
                href={`/quizzes/${quiz.id}/attempt`}
                className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 shadow-sm"
              >
                Start Quiz
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}