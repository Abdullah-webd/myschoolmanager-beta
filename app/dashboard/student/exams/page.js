"use client";

import { useState, useEffect, useRef } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import SchoolSubscriptionGuard from "@/components/SchoolSubscriptionGuard";
import {
  FileText,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Timer,
  Send,
  AlertTriangle,
} from "lucide-react";

export default function StudentExams() {
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExam, setSelectedExam] = useState(null);
  const [examAnswers, setExamAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [submissions, setSubmissions] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [examStartTime, setExamStartTime] = useState(null);
  const timerRef = useRef(null);
  const [isExamActive, setIsExamActive] = useState(false);

  // Call setIsExamActive(true) when exam starts (like when student clicks 'Start Exam')
  // Call setIsExamActive(false) when exam ends or student submits

  const autoSaveRef = useRef(null);

  useEffect(() => {
    fetchExams();

    const handleContextMenu = (e) => {
      if (isFullscreen) e.preventDefault();
    };

    const handleKeyDown = (e) => {
      if (isFullscreen) {
        if (
          e.key === "F11" ||
          (e.altKey && e.key === "Tab") ||
          (e.ctrlKey && e.shiftKey && e.key === "I") ||
          (e.ctrlKey && e.shiftKey && e.key === "J") ||
          (e.ctrlKey && e.key === "u") ||
          e.key === "Escape"
        ) {
          e.preventDefault();
        }
      }
    };

    const handleVisibilityChange = () => {
      if (isFullscreen && document.hidden) {
        console.warn("Student attempted to switch tabs during exam");
      }
    };

    // New handler for fullscreen exit
    const handleFullscreenChange = async () => {
      if (!document.fullscreenElement && isExamActive) {
        alert("You exited full-screen! Exam will end or be paused.");
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isFullscreen, isExamActive]);

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/exams", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched exams:", data);
        setExams(data);

        // Check submission status for each exam
        const submissionStatuses = {};
        for (const exam of data) {
          try {
            const submissionResponse = await fetch(
              `http://localhost:3001/api/exams/${exam._id}/submissions`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            if (submissionResponse.ok) {
              const submissionData = await submissionResponse.json();
              console.log("Fetched submissions for exam:", exam._id, submissionData);
              const userSubmission = submissionData.find(
                (sub) =>
                  sub.student._id ===
                  JSON.parse(localStorage.getItem("user")).id
              );
              if (userSubmission) {
                submissionStatuses[exam._id] = userSubmission;
              }
            }
          } catch (error) {
            console.error("Error checking submission status:", error);
          }
        }
        setSubmissions(submissionStatuses);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      setMessage({ type: "error", content: "Failed to fetch exams" });
    } finally {
      setIsLoading(false);
    }
  };

  const startExam = async (exam) => {
    try {
      // Enter fullscreen mode
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsExamActive(true);
        setIsFullscreen(true);
      }

      setSelectedExam(exam);
      setExamStartTime(Date.now());
      setTimeRemaining(exam.duration * 60); // Convert minutes to seconds
      setExamAnswers({});

      // Start timer
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Auto-save every 30 seconds
      autoSaveRef.current = setInterval(() => {
        autoSaveProgress();
      }, 30000);
    } catch (error) {
      console.error("Error starting exam:", error);
      setMessage({
        type: "error",
        content: "Failed to start exam in fullscreen mode",
      });
    }
  };

  const autoSaveProgress = async () => {
    if (!selectedExam) return;

    try {
      const token = localStorage.getItem("token");
      const timeSpent = Math.floor((Date.now() - examStartTime) / 1000 / 60); // Convert to minutes

      const answers = Object.keys(examAnswers).map((questionId) => ({
        questionId,
        answer: examAnswers[questionId] || "",
      }));

      await fetch(
        `http://localhost:3001/api/exams/${selectedExam._id}/auto-save`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ answers, timeSpent }),
        }
      );
    } catch (error) {
      console.error("Auto-save error:", error);
    }
  };

  const handleAutoSubmit = async () => {
    if (!selectedExam) return;
    setIsExamActive(true);

    clearInterval(timerRef.current);
    clearInterval(autoSaveRef.current);

    await submitExam(true);
  };

  const submitExam = async (isAutoSubmit = false) => {
    if (!selectedExam) return;
    setIsExamActive(true);

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const timeSpent = Math.floor((Date.now() - examStartTime) / 1000 / 60); // Convert to minutes

      const answers = selectedExam.questions.map((question) => ({
        questionId: question._id,
        answer: examAnswers[question._id] || "",
      }));

      const response = await fetch(
        `http://localhost:3001/api/exams/${selectedExam._id}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ answers, timeSpent }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("Exam submitted successfully:", data, answers, timeSpent);
        setMessage({
          type: "success",
          content: isAutoSubmit
            ? "Exam auto-submitted due to time limit"
            : "Exam submitted successfully!",
        });

        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);

        setSelectedExam(null);
        setExamAnswers({});
        clearInterval(timerRef.current);
        clearInterval(autoSaveRef.current);

        fetchExams(); // Refresh to update submission status
      } else {
        setMessage({
          type: "error",
          content: data.message || "Failed to submit exam",
        });
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      setMessage({
        type: "error",
        content: "Network error. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setExamAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const isExamAvailable = (exam) => {
    const now = new Date();
    const startDate = new Date(exam.startDate);
    const endDate = new Date(exam.endDate);
    return now >= startDate && now <= endDate;
  };

  const getExamStatus = (exam) => {
    const submission = submissions[exam._id];
    if (submission) {
      if (submission.status === "graded") {
        return {
          status: "graded",
          color: "bg-green-100 text-green-800",
          text: "Completed",
        };
      }
      return {
        status: "submitted",
        color: "bg-blue-100 text-blue-800",
        text: "Submitted",
      };
    }

    if (!isExamAvailable(exam)) {
      const now = new Date();
      const startDate = new Date(exam.startDate);
      if (now < startDate) {
        return {
          status: "upcoming",
          color: "bg-yellow-100 text-yellow-800",
          text: "Upcoming",
        };
      }
      return {
        status: "expired",
        color: "bg-red-100 text-red-800",
        text: "Expired",
      };
    }

    return {
      status: "available",
      color: "bg-green-100 text-green-800",
      text: "Available",
    };
  };

  const filteredExams = exams.filter(
    (exam) =>
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Fullscreen exam view
  if (selectedExam && isFullscreen) {
    return (
      <div className="min-h-screen bg-white p-8">
        {/* Exam Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedExam.title}
            </h1>
            <p className="text-gray-600">
              {selectedExam.subject} • {selectedExam.totalMarks} marks
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                timeRemaining < 300
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              <Timer className="w-5 h-5" />
              <span className="font-mono text-lg">
                {formatTime(timeRemaining)}
              </span>
            </div>
            <button
              onClick={() => submitExam(false)}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? "Submitting..." : "Submit Exam"}
            </button>
          </div>
        </div>

        {/* Instructions */}
        {selectedExam.instructions && (
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
            <p className="text-blue-800">{selectedExam.instructions}</p>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-8">
          {selectedExam.questions.map((question, index) => (
            <div key={question._id} className="bg-gray-50 p-6 rounded-lg">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Question {index + 1} ({question.points} mark
                  {question.points > 1 ? "s" : ""})
                </h3>
                <p className="text-gray-700">{question.question}</p>
              </div>

              {question.type === "multiple-choice" ? (
                <div className="space-y-3">
                  {question.options.map((option, optIndex) => (
                    <label
                      key={optIndex}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`question-${question._id}`}
                        value={option}
                        checked={examAnswers[question._id] === option}
                        onChange={(e) =>
                          handleAnswerChange(question._id, e.target.value)
                        }
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">
                        {String.fromCharCode(65 + optIndex)}. {option}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  value={examAnswers[question._id] || ""}
                  onChange={(e) =>
                    handleAnswerChange(question._id, e.target.value)
                  }
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Type your answer here..."
                />
              )}
            </div>
          ))}
        </div>

        {/* Warning message */}
        <div className="fixed bottom-4 left-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">
              Do not switch tabs or exit fullscreen during the exam
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SchoolSubscriptionGuard>
      <ProtectedRoute allowedRoles={["student"]}>
        {(user) => (
          <div className="min-h-screen bg-gray-50 flex h-screen">
            <Sidebar user={user} />

            <div className="flex-1 flex flex-col lg:ml-0 overflow-y-auto">
              <main className="flex-1 p-6 lg:p-8">
                {/* Header */}
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    My Exams
                  </h1>
                  <p className="text-gray-600">
                    Take exams assigned by your teachers
                  </p>
                </div>

                {/* Message */}
                {message.content && (
                  <div
                    className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                      message.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {message.type === "success" ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    <p className="text-sm">{message.content}</p>
                    <button
                      onClick={() => setMessage({ type: "", content: "" })}
                      className="ml-auto text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                  <div className="relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search exams..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Exams Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredExams.map((exam) => {
                    const status = getExamStatus(exam);
                    const submission = submissions[exam._id];

                    return (
                      <div
                        key={exam._id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {exam.title}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {exam.subject}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}
                          >
                            {status.text}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(exam.startDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{exam.duration} min</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              <span>{exam.totalMarks} marks</span>
                            </div>
                          </div>

                          <div className="text-sm text-gray-600">
                            <span>{exam.questions.length} questions</span>
                          </div>

                          {submission && submission.status === "graded" && (
                            <div className="bg-green-50 p-3 rounded-lg">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-green-800">
                                  Your Score:
                                </span>
                                <span className="text-lg font-bold text-green-600">
                                  {submission.totalScore}/{exam.totalMarks} (
                                  {submission.percentage.toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                          )}

                          {status.status === "available" && (
                            <button
                              onClick={() => startExam(exam)}
                              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                              Start Exam
                            </button>
                          )}

                          {status.status === "upcoming" && (
                            <div className="text-center py-2">
                              <Clock className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                              <p className="text-sm text-yellow-600">
                                Available from
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(exam.startDate).toLocaleString()}
                              </p>
                            </div>
                          )}

                          {status.status === "submitted" && (
                            <div className="text-center py-2">
                              <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
                              <p className="text-sm text-green-600">
                                Exam completed
                              </p>
                              <p className="text-xs text-gray-500">
                                Submitted on{" "}
                                {new Date(
                                  submission.submittedAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          )}

                          {status.status === "expired" && (
                            <div className="text-center py-2">
                              <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-1" />
                              <p className="text-sm text-red-600">
                                Exam expired
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredExams.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No exams found
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm
                        ? "No exams match your search criteria"
                        : "No exams have been assigned to you yet"}
                    </p>
                  </div>
                )}
              </main>
            </div>
          </div>
        )}
      </ProtectedRoute>
    </SchoolSubscriptionGuard>
  );
}
