"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import SchoolSubscriptionGuard from "@/components/SchoolSubscriptionGuard";
import {
  ClipboardList,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
  Send,
} from "lucide-react";

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionContent, setSubmissionContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [submissions, setSubmissions] = useState({});
  const [submissionsData, setSubmissionsData] = useState({});
  const [submissionImage, setSubmissionImage] = useState(null);

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
        console.log("Assignments fetched:", data);

        // Check submission status for each assignment
        const submissionStatuses = {};
        for (const assignment of data) {
          try {
            const submissionResponse = await fetch(
              `http://localhost:3001/api/assignments/${assignment._id}/submissions`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            if (submissionResponse.ok) {
              const submissionData = await submissionResponse.json();
              const userSubmission = submissionData.find(
                (sub) =>
                  sub.student._id ===
                  JSON.parse(localStorage.getItem("user")).id
              );
              if (userSubmission) {
                submissionStatuses[assignment._id] = userSubmission;
              }
            }
          } catch (error) {
            console.error("Error checking submission status:", error);
          }
        }
        setSubmissions(submissionStatuses);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setMessage({ type: "error", content: "Failed to fetch assignments" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!submissionContent.trim()) {
      setMessage({
        type: "error",
        content: "Please provide your answer before submitting",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("content", submissionContent);
      if (submissionImage) {
        formData.append("image", submissionImage);
      }

      const response = await fetch(
        `http://localhost:3001/api/assignments/${selectedAssignment._id}/submit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // DON'T set Content-Type here! Let browser set multipart/form-data boundary
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          content: "Assignment submitted successfully!",
        });
        setSelectedAssignment(null);
        setSubmissionContent("");
        fetchAssignments(); // Refresh to update submission status
      } else {
        setMessage({
          type: "error",
          content: data.message || "Failed to submit assignment",
        });
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
      setMessage({
        type: "error",
        content: "Network error. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAssignmentOverdue = (dueDate) => {
    return new Date() > new Date(dueDate);
  };

  const getAssignmentStatus = (assignment) => {
    const submission = submissions[assignment._id];
    if (submission) {
      if (submission.status === "graded") {
        return {
          status: "graded",
          color: "bg-green-100 text-green-800",
          text: "Graded",
        };
      }
      return {
        status: "submitted",
        color: "bg-blue-100 text-blue-800",
        text: "Submitted",
      };
    }

    if (isAssignmentOverdue(assignment.dueDate)) {
      return {
        status: "overdue",
        color: "bg-red-100 text-red-800",
        text: "Overdue",
      };
    }

    return {
      status: "pending",
      color: "bg-yellow-100 text-yellow-800",
      text: "Pending",
    };
  };

  const filteredAssignments = assignments.filter(
    (assignment) =>
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.subject.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <SchoolSubscriptionGuard>
      <ProtectedRoute allowedRoles={["student"]}>
        {(user) => (
          <div className="min-h-screen bg-gray-50 flex h-screen">
            <Sidebar user={user} />

            <div className="flex-1 flex flex-col lg:ml-0">
              <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                {/* Header */}
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    My Assignments
                  </h1>
                  <p className="text-gray-600">
                    View and submit assignments from your teachers
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
                      placeholder="Search assignments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Assignments Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredAssignments.map((assignment) => {
                    const status = getAssignmentStatus(assignment);
                    const submission = submissions[assignment._id];

                    return (
                      <div
                        key={assignment._id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <ClipboardList className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {assignment.title}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {assignment.subject}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}
                          >
                            {assignment?.submission?.status || status.text}
                          </span>
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
                              <FileText className="w-4 h-4" />
                              <span>{assignment.maxMarks} marks</span>
                            </div>
                          </div>

                          {assignment.submission &&
                            assignment.submission.status === "graded" && (
                              <div className="bg-green-50 p-3 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-green-800">
                                    Your Score:
                                  </span>
                                  <span className="text-lg font-bold text-green-600">
                                    {assignment.submission.score}
                                  </span>
                                </div>
                                {assignment.submission.feedback && (
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-green-800">
                                      Feedback:
                                    </span>
                                    <p className="text-sm text-green-700 mt-1">
                                      {assignment.submission.feedback}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                          {status.status === "pending" &&
                            !isAssignmentOverdue(assignment.dueDate) && (
                              <button
                                onClick={() =>
                                  setSelectedAssignment(assignment)
                                }
                                disabled={assignment.submission}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                              >
                                {assignment.submission
                                  ? "Assignment has been submitted"
                                  : "Submit Assignment"}
                              </button>
                            )}

                          {status.status === "submitted" && (
                            <div className="text-center py-2">
                              <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
                              <p className="text-sm text-green-600">
                                Assignment submitted
                              </p>
                              <p className="text-xs text-gray-500">
                                Submitted on{" "}
                                {new Date(
                                  submission.submittedAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          )}

                          {status.status === "overdue" && (
                            <div className="text-center py-2">
                              <Clock className="w-6 h-6 text-red-500 mx-auto mb-1" />
                              <p className="text-sm text-red-600">
                                Assignment overdue
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredAssignments.length === 0 && (
                  <div className="text-center py-12">
                    <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No assignments found
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm
                        ? "No assignments match your search criteria"
                        : "No assignments have been assigned to you yet"}
                    </p>
                  </div>
                )}
              </main>
            </div>

            {/* Assignment Submission Modal */}
            {selectedAssignment && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedAssignment.title}
                      </h2>
                      <button
                        onClick={() => setSelectedAssignment(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>Subject: {selectedAssignment.subject}</span>
                      <span>•</span>
                      <span>
                        Due:{" "}
                        {new Date(selectedAssignment.dueDate).toLocaleString()}
                      </span>
                      <span>•</span>
                      <span>Max Marks: {selectedAssignment.maxMarks}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Assignment Description
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700">
                          {selectedAssignment.description}
                        </p>
                      </div>
                    </div>

                    {selectedAssignment.instructions && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Instructions
                        </h3>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-blue-800">
                            {selectedAssignment.instructions}
                          </p>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmitAssignment}>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Your Answer
                        </h3>
                        <textarea
                          value={submissionContent}
                          onChange={(e) => setSubmissionContent(e.target.value)}
                          required
                          rows={10}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          placeholder="Type your answer here..."
                        />
                      </div>
                      <div className="mb-6">
                        <label className="block mb-2 text-lg font-semibold text-gray-900">
                          Attach Image (optional)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setSubmissionImage(e.target.files[0])
                          }
                          className="w-full"
                        />
                      </div>

                      <div className="flex justify-end gap-4">
                        <button
                          type="button"
                          onClick={() => setSelectedAssignment(null)}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={
                            isSubmitting ||
                            isAssignmentOverdue(selectedAssignment.dueDate)
                          }
                          className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Send className="w-4 h-4" />
                          {isSubmitting ? "Submitting..." : "Submit Assignment"}
                        </button>
                      </div>
                    </form>
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
