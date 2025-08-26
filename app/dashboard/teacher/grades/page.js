"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import SchoolSubscriptionGuard from "@/components/SchoolSubscriptionGuard";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";

export default function TeacherGradesPage() {
  const [form, setForm] = useState({
    studentEmail: "",
    examName: "",
    class: "",
    score: "",
    grade: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");


  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
      const token = localStorage.getItem("token");
      console.log("Using token:", token);
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://localhost:3001/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        Authorization: `Bearer ${token}`,
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) setMessage("Grade submitted successfully!");
      else setMessage(data.message || "Error submitting grade");
    } catch (err) {
      setMessage("Server error");
    }
    setLoading(false);
  };

  return (
    <SchoolSubscriptionGuard>
      <ProtectedRoute allowedRoles={["teacher"]}>
        {(user) => (
          <div className="min-h-screen bg-gray-50 flex h-screen">
            <Sidebar user={user} />
            <div className="p-6 max-w-lg mx-auto overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Submit Grade</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  name="studentEmail"
                  value={form.studentEmail}
                  onChange={handleChange}
                  placeholder="Student Email"
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  name="examName"
                  value={form.examName}
                  onChange={handleChange}
                  placeholder="Exam/Test Name"
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  name="class"
                  value={form.class}
                  onChange={handleChange}
                  placeholder="Class"
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  name="score"
                  value={form.score}
                  onChange={handleChange}
                  placeholder="Score"
                  type="number"
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  name="grade"
                  value={form.grade}
                  onChange={handleChange}
                  placeholder="Grade"
                  className="w-full p-2 border rounded"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  {loading ? "Sending..." : "Send"}
                </button>
              </form>
              {message && <div className="mt-4 text-red-600">{message}</div>}
            </div>
          </div>
        )}
      </ProtectedRoute>
    </SchoolSubscriptionGuard>
  );
}
