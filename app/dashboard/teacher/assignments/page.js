"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import SchoolSubscriptionGuard from "@/components/SchoolSubscriptionGuard";
import {
  ClipboardList,
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
} from "lucide-react";

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [imgSrc, setImgSrc] = useState(
    `http://localhost:3001/uploads/assignments/image-1754929081341-290355440.png`
  );

  const [assignmentData, setAssignmentData] = useState({
    title: "",
    description: "",
    subject: "",
    class: "",
    dueDate: "",
    maxMarks: 100,
    instructions:
      "Please complete this assignment and submit before the deadline.",
  });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/assignments", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setMessage({ type: "error", content: "Failed to fetch assignments" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/assignments/${assignmentId}/submissions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
        console.log("Submissions:", data);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const url = editingAssignment
        ? `http://localhost:3001/api/assignments/${editingAssignment._id}`
        : "http://localhost:3001/api/assignments";

      const method = editingAssignment ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(assignmentData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          content: `Assignment ${
            editingAssignment ? "updated" : "created"
          } successfully!`,
        });
        setShowCreateModal(false);
        setEditingAssignment(null);
        resetForm();
        fetchAssignments();
      } else {
        setMessage({
          type: "error",
          content: data.message || "Failed to save assignment",
        });
      }
    } catch (error) {
      console.error("Error saving assignment:", error);
      setMessage({
        type: "error",
        content: "Network error. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setAssignmentData({
      title: assignment.title,
      description: assignment.description,
      subject: assignment.subject,
      class: assignment.class,
      dueDate: new Date(assignment.dueDate).toISOString().slice(0, 16),
      maxMarks: assignment.maxMarks,
      instructions: assignment.instructions,
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (assignmentId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this assignment? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/assignments/${assignmentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setMessage({
          type: "success",
          content: "Assignment deleted successfully",
        });
        console.log(response);
        fetchAssignments();
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
      setMessage({ type: "error", content: "Failed to delete assignment" });
    }
  };

  const handleViewSubmissions = (assignment) => {
    setSelectedAssignment(assignment);
    fetchSubmissions(assignment._id);
  };

  const gradeSubmission = async (submissionId, score, feedback) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/assignments/submissions/${submissionId}/grade`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ score, feedback }),
        }
      );

      if (response.ok) {
        setMessage({
          type: "success",
          content: "Assignment graded successfully",
        });
        fetchSubmissions(selectedAssignment._id);
      }
    } catch (error) {
      console.error("Error grading assignment:", error);
      setMessage({ type: "error", content: "Failed to grade assignment" });
    }
  };

  const resetForm = () => {
    setAssignmentData({
      title: "",
      description: "",
      subject: "",
      class: "",
      dueDate: "",
      maxMarks: 100,
      instructions:
        "Please complete this assignment and submit before the deadline.",
    });
  };

  const filteredAssignments = assignments.filter(
    (assignment) =>
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.class.toLowerCase().includes(searchTerm.toLowerCase())
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
    <SchoolSubscriptionGuard>
      <ProtectedRoute allowedRoles={["teacher"]}>
        {(user) => (
          <div className="min-h-screen bg-gray-50 flex h-screen">
            <Sidebar user={user} />

            <div className="flex-1 flex flex-col lg:ml-0 overflow-y-auto  ">
              <main className="flex-1 p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Assignments
                    </h1>
                    <p className="text-gray-600">
                      Create and manage assignments for your students
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingAssignment(null);
                      resetForm();
                      setShowCreateModal(true);
                    }}
                    className="mt-4 sm:mt-0 inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Create Assignment
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
                      placeholder="Search assignments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                {/* Assignments Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredAssignments.map((assignment) => (
                    <div
                      key={assignment._id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <ClipboardList className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {assignment.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {assignment.subject} • {assignment.class}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewSubmissions(assignment)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View submissions"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(assignment)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit assignment"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(assignment._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete assignment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {assignment.description}
                      </p>

                      <div className="space-y-3">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Due:{" "}
                              {new Date(
                                assignment.dueDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{assignment.maxMarks} marks</span>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600">
                          <span>
                            Created:{" "}
                            {new Date(
                              assignment.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredAssignments.length === 0 && (
                  <div className="text-center py-12">
                    <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No assignments found
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm
                        ? "Try adjusting your search criteria"
                        : "Create your first assignment to get started"}
                    </p>
                  </div>
                )}
              </main>
            </div>

            {/* Create/Edit Assignment Modal */}
            {showCreateModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {editingAssignment
                          ? "Edit Assignment"
                          : "Create New Assignment"}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Assignment Title
                        </label>
                        <input
                          type="text"
                          value={assignmentData.title}
                          onChange={(e) =>
                            setAssignmentData({
                              ...assignmentData,
                              title: e.target.value,
                            })
                          }
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Enter assignment title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subject
                        </label>
                        <input
                          type="text"
                          value={assignmentData.subject}
                          onChange={(e) =>
                            setAssignmentData({
                              ...assignmentData,
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
                          value={assignmentData.class}
                          onChange={(e) =>
                            setAssignmentData({
                              ...assignmentData,
                              class: e.target.value,
                            })
                          }
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="e.g., Grade 10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Due Date
                        </label>
                        <input
                          type="datetime-local"
                          value={assignmentData.dueDate}
                          onChange={(e) =>
                            setAssignmentData({
                              ...assignmentData,
                              dueDate: e.target.value,
                            })
                          }
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Marks
                        </label>
                        <input
                          type="number"
                          value={assignmentData.maxMarks}
                          onChange={(e) =>
                            setAssignmentData({
                              ...assignmentData,
                              maxMarks: parseInt(e.target.value),
                            })
                          }
                          required
                          min="1"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={assignmentData.description}
                          onChange={(e) =>
                            setAssignmentData({
                              ...assignmentData,
                              description: e.target.value,
                            })
                          }
                          required
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                          placeholder="Describe the assignment..."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Instructions
                        </label>
                        <textarea
                          value={assignmentData.instructions}
                          onChange={(e) =>
                            setAssignmentData({
                              ...assignmentData,
                              instructions: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                          placeholder="Enter assignment instructions..."
                        />
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
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSubmitting
                          ? "Saving..."
                          : editingAssignment
                          ? "Update Assignment"
                          : "Create Assignment"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Submissions Modal */}
            {selectedAssignment && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Submissions: {selectedAssignment.title}
                      </h2>
                      <button
                        onClick={() => setSelectedAssignment(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    {submissions.length > 0 ? (
                      <div className="space-y-4">
                        {submissions.map((submission) => (
                          <div
                            key={submission._id}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {submission.student.firstName}{" "}
                                  {submission.student.lastName}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Submitted:{" "}
                                  {new Date(
                                    submission.submittedAt
                                  ).toLocaleString()}
                                  {submission.isLate && (
                                    <span className="text-red-500 ml-2">
                                      (Late)
                                    </span>
                                  )}
                                </p>
                                <img
                                  src={`http://localhost:3001${submission.imageUrl}`}
                                  alt="Assignment submission"
                                  className="mt-2 h-100 w-100 rounded-lg object-cover"
                                />
                              </div>
                              <div className="text-right">
                                {submission.status === "graded" ? (
                                  <div>
                                    <span className="text-lg font-semibold text-green-600">
                                      {submission.score}/
                                      {selectedAssignment.maxMarks}
                                    </span>
                                    <p className="text-xs text-gray-500">
                                      Graded
                                    </p>
                                  </div>
                                ) : (
                                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                    Pending
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="mb-3">
                              <h4 className="font-medium text-gray-700 mb-2">
                                Submission:
                              </h4>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-gray-700">
                                  {submission.content}
                                </p>
                              </div>
                            </div>

                            {submission.status === "graded" &&
                              submission.feedback && (
                                <div className="mb-3">
                                  <h4 className="font-medium text-gray-700 mb-2">
                                    Feedback:
                                  </h4>
                                  <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-blue-800">
                                      {submission.feedback}
                                    </p>
                                  </div>
                                </div>
                              )}

                            {submission.status !== "graded" && (
                              <div className="flex gap-3">
                                <input
                                  type="number"
                                  placeholder="Score"
                                  max={selectedAssignment.maxMarks}
                                  min="0"
                                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                  id={`score-${submission._id}`}
                                />
                                <input
                                  type="text"
                                  placeholder="Feedback (optional)"
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                  id={`feedback-${submission._id}`}
                                />
                                <button
                                  onClick={() => {
                                    const score = document.getElementById(
                                      `score-${submission._id}`
                                    ).value;
                                    const feedback = document.getElementById(
                                      `feedback-${submission._id}`
                                    ).value;
                                    if (score) {
                                      gradeSubmission(
                                        submission._id,
                                        parseInt(score),
                                        feedback
                                      );
                                    }
                                  }}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  Grade
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No submissions yet
                        </h3>
                        <p className="text-gray-600">
                          Students haven't submitted this assignment yet.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ProtectedRoute>
    </SchoolSubscriptionGuard>
  );
}
