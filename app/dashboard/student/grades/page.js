"use client";

import { User } from "lucide-react";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import SchoolSubscriptionGuard from "@/components/SchoolSubscriptionGuard";

export default function StudentResults({ studentEmail }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      console.log("User from localStorage:", user.email);

      try {
        const res = await fetch(
          `http://localhost:3001/api/grades/${user.email}`
        );
        console.log("Fetching results for:", user.email);
        console.log("Response status:", res);
        if (!res.ok) throw new Error("Failed to load results");
        const data = await res.json();
        setResults(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <SchoolSubscriptionGuard>
      <ProtectedRoute allowedRoles={["student"]}>
        {(user) => (
          <div className="min-h-screen bg-gray-50 flex h-screen">
            <Sidebar user={user} />
            <div className="min-h-screen bg-gray-50 p-6 overflow-y-auto">
              <div className=" mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  My Results
                </h1>

                {results.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                    <p className="text-gray-500">No results found yet 📭</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <table className="w-full border-collapse">
                      <thead className="bg-blue-600 text-white">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-medium">
                            Exam
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-medium">
                            Exam Score
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-medium">
                            CA Score
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-medium">
                            Total Score
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-medium">
                            Grade
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-medium">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((r, idx) => {
                          // grading logic
                          let grade = "F";
                          let gradeColor = "text-red-600";
                          const percentage =
                            r.totalScore > 0
                              ? ((parseInt(r.examScore) + parseInt(r.caScore)) /
                                  r.totalScore) *
                                100
                              : 0;

                          if (percentage >= 90) {
                            grade = "A";
                            gradeColor = "text-green-600";
                          } else if (percentage >= 80) {
                            grade = "B";
                            gradeColor = "text-blue-600";
                          } else if (percentage >= 70) {
                            grade = "C";
                            gradeColor = "text-yellow-600";
                          } else if (percentage >= 60) {
                            grade = "D";
                            gradeColor = "text-orange-600";
                          }

                          return (
                            <tr
                              key={idx}
                              className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition"
                            >
                              <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                                {r.studentName}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {r.examScore}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {r.caScore}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {r.totalScore}
                              </td>
                              <td className="px-6 py-4 text-sm font-bold">
                                <span className={gradeColor}>{grade}</span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {new Date(r.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </ProtectedRoute>
    </SchoolSubscriptionGuard>
  );
}
