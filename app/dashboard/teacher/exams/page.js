"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  Users,
  Brain,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Calendar,
  Timer,
} from "lucide-react";

export default function TeacherExams() {
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });

  const [examData, setExamData] = useState({
    title: "",
    description: "",
    subject: "",
    class: "",
    duration: 60,
    instructions: "Please read all questions carefully before answering.",
    startDate: "",
    endDate: "",
    questions: [],
  });

  const [aiQuestionData, setAiQuestionData] = useState({
    subject: "",
    topic: "",
    difficulty: "medium",
    numQuestions: 5,
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/exams", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setExams(data);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      setMessage({ type: "error", content: "Failed to fetch exams" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const url = editingExam
        ? `http://localhost:3001/api/exams/${editingExam._id}`
        : "http://localhost:3001/api/exams";

      const method = editingExam ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(examData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          content: `Exam ${editingExam ? "updated" : "created"} successfully!`,
        });
        console.log("Exam saved:", data);
        setShowCreateModal(false);
        setEditingExam(null);
        resetForm();
        fetchExams();
      } else {
        setMessage({
          type: "error",
          content: data.message || "Failed to save exam",
        });
      }
    } catch (error) {
      console.error("Error saving exam:", error);
      setMessage({
        type: "error",
        content: "Network error. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateAIQuestions = async () => {
    setIsGeneratingQuestions(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3001/api/exams/generate-questions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(aiQuestionData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setExamData({
          ...examData,
          questions: [...examData.questions, ...data.questions],
        });
        setMessage({
          type: "success",
          content: data.isFallback
            ? "Generated fallback questions (AI service unavailable)"
            : "AI questions generated successfully!",
        });
      } else {
        setMessage({
          type: "error",
          content: data.message || "Failed to generate questions",
        });
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      setMessage({
        type: "error",
        content: "Network error. Please try again.",
      });
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const addManualQuestion = () => {
    setExamData({
      ...examData,
      questions: [
        ...examData.questions,
        {
          type: "multiple-choice",
          question: "",
          options: ["", "", "", ""],
          correctAnswer: "",
          points: 1,
        },
      ],
    });
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...examData.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setExamData({ ...examData, questions: updatedQuestions });
  };

  const removeQuestion = (index) => {
    const updatedQuestions = examData.questions.filter((_, i) => i !== index);
    setExamData({ ...examData, questions: updatedQuestions });
  };

  const handleEdit = (exam) => {
  console.log("Editing exam:", {
    startDate: toLocalDatetimeString(exam.startDate),
    endDate: toLocalDatetimeString(exam.endDate),
  });

  setEditingExam(exam);
  setExamData({
    title: exam.title,
    description: exam.description || "",
    subject: exam.subject,
    class: exam.class,
    duration: exam.duration,
    instructions: exam.instructions,
    startDate: toLocalDatetimeString(exam.startDate),
    endDate: toLocalDatetimeString(exam.endDate),
    questions: exam.questions,
  });
  setShowCreateModal(true);
};


  function toLocalDatetimeString(date) {
    const d = new Date(date);
    const pad = (num) => num.toString().padStart(2, "0");

    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  const handleDelete = async (examId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this exam? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/exams/${examId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setMessage({ type: "success", content: "Exam deleted successfully" });
        fetchExams();
      }
    } catch (error) {
      console.error("Error deleting exam:", error);
      setMessage({ type: "error", content: "Failed to delete exam" });
    }
  };

  const resetForm = () => {
    setExamData({
      title: "",
      description: "",
      subject: "",
      class: "",
      duration: 60,
      instructions: "Please read all questions carefully before answering.",
      startDate: "",
      endDate: "",
      questions: [],
    });
    setAiQuestionData({
      subject: "",
      topic: "",
      difficulty: "medium",
      numQuestions: 5,
    });
  };

  const filteredExams = exams.filter(
    (exam) =>
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      {(user) => (
        <div className="min-h-screen bg-gray-50 flex">
          <Sidebar user={user} />

          <div className="flex-1 flex flex-col lg:ml-0">
            <main className="flex-1 p-6 lg:p-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    My Exams
                  </h1>
                  <p className="text-gray-600">
                    Create and manage exams for your students
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingExam(null);
                    resetForm();
                    setShowCreateModal(true);
                  }}
                  className="mt-4 sm:mt-0 inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Exam
                </button>
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Exams Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredExams.map((exam) => (
                  <div
                    key={exam._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <FileText className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {exam.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {exam.subject} • {exam.class}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(exam)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit exam"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(exam._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete exam"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Timer className="w-4 h-4" />
                          <span>{exam.duration} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{exam.questions.length} questions</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{exam.totalMarks} marks</span>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-1 mb-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Start:{" "}
                            {new Date(exam.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            End: {new Date(exam.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {exam.createdBy === "ai" && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          <Brain className="w-3 h-3" />
                          AI Generated
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredExams.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No exams found
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm
                      ? "Try adjusting your search criteria"
                      : "Create your first exam to get started"}
                  </p>
                </div>
              )}
            </main>
          </div>

          {/* Create/Edit Exam Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingExam ? "Edit Exam" : "Create New Exam"}
                    </h2>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Exam Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Exam Title
                        </label>
                        <input
                          type="text"
                          value={examData.title}
                          onChange={(e) =>
                            setExamData({ ...examData, title: e.target.value })
                          }
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Enter exam title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subject
                        </label>
                        <input
                          type="text"
                          value={examData.subject}
                          onChange={(e) =>
                            setExamData({
                              ...examData,
                              subject: e.target.value,
                            })
                          }
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="e.g., Mathematics"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Class
                        </label>
                        <input
                          type="text"
                          value={examData.class}
                          onChange={(e) =>
                            setExamData({ ...examData, class: e.target.value })
                          }
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="e.g., Grade 10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duration (minutes)
                        </label>
                        <input
                          type="number"
                          value={examData.duration}
                          onChange={(e) =>
                            setExamData({
                              ...examData,
                              duration: parseInt(e.target.value),
                            })
                          }
                          required
                          min="1"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          value={examData.startDate}
                          onChange={(e) =>
                            setExamData({
                              ...examData,
                              startDate: e.target.value,
                            })
                          }
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          value={examData.endDate}
                          onChange={(e) =>
                            setExamData({
                              ...examData,
                              endDate: e.target.value,
                            })
                          }
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Instructions
                        </label>
                        <textarea
                          value={examData.instructions}
                          onChange={(e) =>
                            setExamData({
                              ...examData,
                              instructions: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                          placeholder="Enter exam instructions..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* AI Question Generation */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Generate Questions with AI
                    </h3>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subject
                          </label>
                          <input
                            type="text"
                            value={aiQuestionData.subject}
                            onChange={(e) =>
                              setAiQuestionData({
                                ...aiQuestionData,
                                subject: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Mathematics"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Topic
                          </label>
                          <input
                            type="text"
                            value={aiQuestionData.topic}
                            onChange={(e) =>
                              setAiQuestionData({
                                ...aiQuestionData,
                                topic: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Algebra"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Difficulty
                          </label>
                          <select
                            value={aiQuestionData.difficulty}
                            onChange={(e) =>
                              setAiQuestionData({
                                ...aiQuestionData,
                                difficulty: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Questions
                          </label>
                          <input
                            type="number"
                            value={aiQuestionData.numQuestions}
                            onChange={(e) =>
                              setAiQuestionData({
                                ...aiQuestionData,
                                numQuestions: parseInt(e.target.value),
                              })
                            }
                            min="1"
                            max="20"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={generateAIQuestions}
                        disabled={
                          isGeneratingQuestions ||
                          !aiQuestionData.subject ||
                          !aiQuestionData.topic
                        }
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Brain className="w-4 h-4" />
                        {isGeneratingQuestions
                          ? "Generating..."
                          : "Generate Questions"}
                      </button>
                    </div>
                  </div>

                  {/* Manual Question Addition */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Questions ({examData.questions.length})
                      </h3>
                      <button
                        type="button"
                        onClick={addManualQuestion}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Question
                      </button>
                    </div>

                    <div className="space-y-6">
                      {examData.questions.map((question, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-gray-900">
                              Question {index + 1}
                            </h4>
                            <button
                              type="button"
                              onClick={() => removeQuestion(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Question Text
                              </label>
                              <textarea
                                value={question.question}
                                onChange={(e) =>
                                  updateQuestion(
                                    index,
                                    "question",
                                    e.target.value
                                  )
                                }
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                                placeholder="Enter your question..."
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Question Type
                                </label>
                                <select
                                  value={question.type}
                                  onChange={(e) =>
                                    updateQuestion(
                                      index,
                                      "type",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                >
                                  <option value="multiple-choice">
                                    Multiple Choice
                                  </option>
                                  <option value="written">
                                    Written Answer
                                  </option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Points
                                </label>
                                <input
                                  type="number"
                                  value={question.points}
                                  onChange={(e) =>
                                    updateQuestion(
                                      index,
                                      "points",
                                      parseInt(e.target.value)
                                    )
                                  }
                                  min="1"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                              </div>
                            </div>

                            {question.type === "multiple-choice" && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Options
                                </label>
                                <div className="space-y-2">
                                  {question.options.map((option, optIndex) => (
                                    <div
                                      key={optIndex}
                                      className="flex items-center gap-2"
                                    >
                                      <span className="text-sm font-medium text-gray-500 w-6">
                                        {String.fromCharCode(65 + optIndex)}.
                                      </span>
                                      <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => {
                                          const newOptions = [
                                            ...question.options,
                                          ];
                                          newOptions[optIndex] = e.target.value;
                                          updateQuestion(
                                            index,
                                            "options",
                                            newOptions
                                          );
                                        }}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        placeholder={`Option ${String.fromCharCode(
                                          65 + optIndex
                                        )}`}
                                      />
                                      <input
                                        type="radio"
                                        name={`correct-${index}`}
                                        checked={
                                          question.correctAnswer === option
                                        }
                                        onChange={() =>
                                          updateQuestion(
                                            index,
                                            "correctAnswer",
                                            option
                                          )
                                        }
                                        className="text-green-600"
                                        title="Mark as correct answer"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || examData.questions.length === 0}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting
                        ? "Saving..."
                        : editingExam
                        ? "Update Exam"
                        : "Create Exam"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </ProtectedRoute>
  );
}
