"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { userService } from "@/app/services/api";
import {
  Search,
  Filter,
  Clock,
  Target,
  Award,
  ChevronDown,
  Trash2,
} from "lucide-react";
import DashboardLayout from "../dashboard/layout";

type QuizAttempt = {
  id: string;
  quizId: string;
  quizTitle: string;
  score: number;
  completedAt: string;
  timeSpent: number;
  totalQuestions: number;
  correctAnswers: number;
  category: string;
  status: string;
};

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-sm w-full p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};


export default function MyQuizzesPage() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [filteredAttempts, setFilteredAttempts] = useState<QuizAttempt[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [visibleAttempts, setVisibleAttempts] = useState(6);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedAttempts, setSelectedAttempts] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<() => void>(() => {});
  const [modalMessage, setModalMessage] = useState<string>("");

  useEffect(() => {
    const fetchQuizAttempts = async () => {
      try {
        const data = await userService.getQuizHistory();
        const transformedData = data.map((attempt: any) => ({
          id: attempt.attemptId,
          quizId: attempt.quizId,
          quizTitle: attempt.quizTitle || "Untitled Quiz",
          score: attempt.score || 0,
          maxPossibleScore: attempt.maxPossibleScore || 0,
          percentage: attempt.percentage || 0,
          completedAt: attempt.completedAt
            ? new Date(attempt.completedAt).toISOString()
            : null,
          timeSpent: attempt.timeTakenSeconds || 0,
          totalQuestions: attempt.questionResults?.length || 0,
          correctAnswers: attempt.questionResults?.filter((q: any) => q.correct).length || 0,
          category: attempt.category || "Uncategorized",
          status: attempt.status?.toString() || "Unknown" // Convert enum to string
        }));
    
        setAttempts(transformedData);
        setFilteredAttempts(transformedData);
    
        const uniqueCategories = Array.from(
          new Set(transformedData.map((attempt: { category: any }) => attempt.category || "Uncategorized"))
        ).map((category) => ({
          id: (category as string).toLowerCase().replace(/\s+/g, "-"),
          name: category as string,
        }));
    
        setCategories([{ id: "all", name: "All Categories" }, ...uniqueCategories]);
      } catch (error) {
        console.error("Error fetching quiz attempts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizAttempts();
  }, []);

  const openModal = (action: () => void, message: string) => {
    setModalAction(() => action);
    setModalMessage(message);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const filtered = attempts.filter((attempt) => {
      const matchesCategory =
        selectedCategory === "All Categories" || attempt.category === selectedCategory;
      const matchesSearch = attempt.quizTitle
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    setFilteredAttempts(filtered);
    setVisibleAttempts(6);
  }, [selectedCategory, searchTerm, attempts]);

  const loadMoreAttempts = () => {
    setVisibleAttempts((prev) => prev + 6);
  };

  const toggleSelection = (id: string) => {
    setSelectedAttempts((prev) =>
      prev.includes(id) ? prev.filter((attemptId) => attemptId !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedAttempts.length === filteredAttempts.length) {
      setSelectedAttempts([]);
    } else {
      setSelectedAttempts(filteredAttempts.map((attempt) => attempt.id));
    }
  };

  const deleteSingleAttempt = async (id: string) => {
    openModal(async () => {
      try {
        await userService.deleteQuizAttempt(id);
        setAttempts((prev) => prev.filter((attempt) => attempt.id !== id));
        setFilteredAttempts((prev) => prev.filter((attempt) => attempt.id !== id));
        setSelectedAttempts((prev) => prev.filter((attemptId) => attemptId !== id));
      } catch (error) {
        console.error("Failed to delete quiz attempt:", error);
      }
    }, "Are you sure you want to delete this quiz attempt?");
  };

  const deleteSelectedAttempts = async () => {
    openModal(async () => {
      try {
        await userService.deleteMultipleQuizAttempts(selectedAttempts);
        setAttempts((prev) => prev.filter((attempt) => !selectedAttempts.includes(attempt.id)));
        setFilteredAttempts((prev) => prev.filter((attempt) => !selectedAttempts.includes(attempt.id)));
        setSelectedAttempts([]);
      } catch (error) {
        console.error("Failed to delete selected quiz attempts:", error);
      }
    }, "Are you sure you want to delete the selected quiz attempts?");
  };

  const deleteAllAttempts = async () => {
    openModal(async () => {
      try {
        await userService.deleteAllQuizAttempts();
        setAttempts([]);
        setFilteredAttempts([]);
        setSelectedAttempts([]);
      } catch (error) {
        console.error("Failed to delete all quiz attempts:", error);
      }
    }, "Are you sure you want to delete all quiz attempts?");
  };


  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[70vh] bg-gray-100 dark:bg-gray-900">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading quiz history...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const displayedAttempts = filteredAttempts.slice(0, visibleAttempts);
  const hasMoreAttempts = filteredAttempts.length > visibleAttempts;

  return (
    <DashboardLayout>
            {/* Confirmation Modal */}
        <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          modalAction();
          setIsModalOpen(false);
        }}
        title="Confirm Deletion"
        message={modalMessage}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
            My Quiz History
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Review your past quiz attempts and track your progress
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                id="search"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                placeholder="Search quizzes by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search quiz history"
              />
            </div>

            {/* Category Filter */}
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="w-5 h-5 text-gray-400" aria-hidden="true" />
              </div>
              <select
                id="category"
                className="w-full pl-10 pr-8 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none transition-all"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by category"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={deleteSelectedAttempts}
            className={`flex items-center px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 shadow-sm ${
              selectedAttempts.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            }`}
            disabled={selectedAttempts.length === 0}
            aria-label="Delete selected quiz attempts"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected
          </button>
          <button
            onClick={deleteAllAttempts}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
            aria-label="Delete all quiz attempts"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete All
          </button>
          <div className="flex items-center ml-auto">
            <input
              type="checkbox"
              id="select-all"
              checked={selectedAttempts.length === filteredAttempts.length}
              onChange={selectAll}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
              aria-label="Select all quiz attempts"
            />
            <label htmlFor="select-all" className="ml-2 text-gray-600 dark:text-gray-400">
              Select All
            </label>
          </div>
        </div>

        {/* Quiz Attempts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedAttempts.length > 0 ? (
            <>
              {displayedAttempts.map((attempt, index) => (
                <div
                  key={`${attempt.id}-${index}`}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transform transition-all hover:shadow-lg animate-fade-in relative"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Delete Icon */}
                  <button
                    onClick={() => deleteSingleAttempt(attempt.id)}
                    className="absolute top-4 right-4 text-red-600 hover:text-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-full p-1 transition-all duration-200"
                    aria-label={`Delete quiz attempt: ${attempt.quizTitle}`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`attempt-${attempt.id}`}
                          checked={selectedAttempts.includes(attempt.id)}
                          onChange={() => toggleSelection(attempt.id)}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                          aria-label={`Select quiz attempt: ${attempt.quizTitle}`}
                        />
                        <h2 className="ml-3 text-xl font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {attempt.quizTitle}
                        </h2>
                      </div>
                        <span
                        className="px-3 py-1 rounded-full text-sm font-medium bg-green-600 text-white dark:bg-green-700"
                        >
                        <span>
                          {attempt.status.toLowerCase() === "abandoned" ? "0.00" : ((attempt.correctAnswers / attempt.totalQuestions) * 100).toFixed(2)}
                        </span>%
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                          className={`h-2.5 rounded-full ${
                          (attempt.correctAnswers / attempt.totalQuestions) * 100 >= 80
                            ? "bg-green-600"
                            : (attempt.correctAnswers / attempt.totalQuestions) * 100 >= 60
                            ? "bg-yellow-600"
                            : "bg-red-600"
                          }`}
                          style={{
                          width: `${(attempt.correctAnswers / attempt.totalQuestions) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Target className="w-4 h-4 mr-1" />
                          Correct Answers:
                        </span>
                        <span>{attempt.correctAnswers}/{attempt.totalQuestions}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Time Spent:
                        </span>
                        <span>{Math.round(attempt.timeSpent / 60)} minutes</span>
                      </div>
                        <div className="flex flex-col space-y-1">
                        <span className="flex items-center">
                          <Award className="w-4 h-4 mr-1" />
                          Status:
                        </span>
                        <span>
                            <span
                            className={`${
                              attempt.status.toLowerCase() === "completed"
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                            }`}
                            >
                            {attempt.status.toLowerCase() === "completed"
                              ? `Completed on ${new Date(attempt.completedAt).toLocaleDateString()} at ${new Date(attempt.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                              : `${attempt.status} on ${new Date(attempt.completedAt).toLocaleDateString()} at ${new Date(attempt.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                            </span>
                        </span>
                        </div>
                      
                    </div>
                  </div>

                  {attempt.status.toLowerCase() === "completed" && (
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                    <Link
                      href={`/pages/users/quizzes/${attempt.id}/history`}
                      className="block text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
                      aria-label={`View details for ${attempt.quizTitle}`}
                    >
                      View Details
                    </Link>
                  </div>
)}
                </div>
              ))}

              {/* Load More Button */}
              {hasMoreAttempts && (
                <div className="col-span-full flex justify-center mt-6">
                  <button
                    onClick={loadMoreAttempts}
                    className="flex items-center px-6 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 dark:text-purple-200 rounded-lg transition-all duration-200 shadow-sm focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    aria-label="Load more quiz attempts"
                  >
                    <span>Load More</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No quiz attempts found
              </p>
              <Link
                href="/quizzes"
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
                aria-label="Take your first quiz"
              >
                Take Your First Quiz
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Custom CSS for Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </DashboardLayout>
  );
}