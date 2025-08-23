"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import {
  BarChart3,
  Users,
  FileText,
  TrendingUp,
  Award,
  BookOpen,
  Target,
  Calendar,
} from "lucide-react";

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalExams: 0,
    totalAssignments: 0,
    topStudents: [],
    topTeachers: [],
    subjectPerformance: [],
    recentActivity: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch users
      const usersResponse = await fetch("http://localhost:3001/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (usersResponse.ok) {
        const users = await usersResponse.json();
        const students = users.filter((u) => u.role === "student");
        const teachers = users.filter((u) => u.role === "teacher");

        setAnalytics((prev) => ({
          ...prev,
          totalUsers: users.length,
          totalStudents: students.length,
          totalTeachers: teachers.length,
        }));
      }

      // Fetch exams
      const examsResponse = await fetch("http://localhost:3001/api/exams", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (examsResponse.ok) {
        const exams = await examsResponse.json();
        setAnalytics((prev) => ({
          ...prev,
          totalExams: exams.length,
        }));
      }

      // Fetch assignments
      const assignmentsResponse = await fetch(
        "http://localhost:3001/api/assignments",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (assignmentsResponse.ok) {
        const assignments = await assignmentsResponse.json();
        setAnalytics((prev) => ({
          ...prev,
          totalAssignments: assignments.length,
        }));
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Students",
      value: analytics.totalStudents,
      icon: Users,
      color: "bg-blue-500",
      change: "+12%",
      changeType: "positive",
    },
    {
      title: "Total Teachers",
      value: analytics.totalTeachers,
      icon: Users,
      color: "bg-green-500",
      change: "+8%",
      changeType: "positive",
    },
    {
      title: "Total Exams",
      value: analytics.totalExams,
      icon: FileText,
      color: "bg-purple-500",
      change: "+25%",
      changeType: "positive",
    },
    {
      title: "Total Assignments",
      value: analytics.totalAssignments,
      icon: BookOpen,
      color: "bg-orange-500",
      change: "+15%",
      changeType: "positive",
    },
  ];

  const mockTopStudents = [
    { name: "Alice Johnson", grade: "A+", average: 95.5, exams: 12 },
    { name: "Bob Smith", grade: "A", average: 92.3, exams: 10 },
    { name: "Carol Davis", grade: "A", average: 90.8, exams: 11 },
    { name: "David Wilson", grade: "A-", average: 88.7, exams: 9 },
    { name: "Eva Brown", grade: "B+", average: 87.2, exams: 8 },
  ];

  const mockTopTeachers = [
    {
      name: "Dr. Sarah Miller",
      subject: "Mathematics",
      avgScore: 89.5,
      students: 45,
    },
    {
      name: "Prof. John Anderson",
      subject: "Science",
      avgScore: 87.3,
      students: 38,
    },
    {
      name: "Ms. Emily Taylor",
      subject: "English",
      avgScore: 85.9,
      students: 42,
    },
    {
      name: "Mr. Michael Lee",
      subject: "History",
      avgScore: 84.2,
      students: 35,
    },
    {
      name: "Dr. Lisa Garcia",
      subject: "Physics",
      avgScore: 83.7,
      students: 29,
    },
  ];

  const mockSubjectPerformance = [
    { subject: "Mathematics", average: 89.5, exams: 25, color: "bg-blue-500" },
    { subject: "Science", average: 87.3, exams: 22, color: "bg-green-500" },
    { subject: "English", average: 85.9, exams: 28, color: "bg-purple-500" },
    { subject: "History", average: 84.2, exams: 18, color: "bg-orange-500" },
    { subject: "Physics", average: 83.7, exams: 15, color: "bg-red-500" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  return (
    <SubscriptionGuard>
      <ProtectedRoute allowedRoles={["admin"]}>
        {(user) => (
          <div className="min-h-screen bg-gray-50 flex">
            <Sidebar user={user} />

            <div className="flex-1 flex flex-col lg:ml-0">
              <main className="flex-1 p-6 lg:p-8">
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="w-8 h-8 text-red-600" />
                    <h1 className="text-3xl font-bold text-gray-900">
                      Analytics Dashboard
                    </h1>
                  </div>
                  <p className="text-gray-600">
                    Comprehensive insights and performance metrics for your
                    school
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {statCards.map((stat, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            {stat.title}
                          </p>
                          <p className="text-3xl font-bold text-gray-900 mt-1">
                            {stat.value}
                          </p>
                          <p
                            className={`text-sm mt-1 ${
                              stat.changeType === "positive"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {stat.change} from last month
                          </p>
                        </div>
                        <div
                          className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
                        >
                          <stat.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Charts and Tables Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Top Performing Students */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <Award className="w-6 h-6 text-yellow-500" />
                        <h2 className="text-lg font-semibold text-gray-900">
                          Top Performing Students
                        </h2>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {mockTopStudents.map((student, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-yellow-600">
                                  #{index + 1}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {student.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {student.exams} exams taken
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">
                                {student.average}%
                              </p>
                              <p className="text-sm text-gray-500">
                                {student.grade}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Top Teachers by Performance */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-green-500" />
                        <h2 className="text-lg font-semibold text-gray-900">
                          Best Performing Teachers
                        </h2>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {mockTopTeachers.map((teacher, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-green-600">
                                  #{index + 1}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {teacher.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {teacher.subject} • {teacher.students}{" "}
                                  students
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-blue-600">
                                {teacher.avgScore}%
                              </p>
                              <p className="text-sm text-gray-500">Avg Score</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subject Performance */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <Target className="w-6 h-6 text-purple-500" />
                      <h2 className="text-lg font-semibold text-gray-900">
                        Subject Performance Overview
                      </h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      {mockSubjectPerformance.map((subject, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-4 h-4 ${subject.color} rounded-full`}
                              ></div>
                              <span className="font-medium text-gray-900">
                                {subject.subject}
                              </span>
                              <span className="text-sm text-gray-500">
                                ({subject.exams} exams)
                              </span>
                            </div>
                            <span className="font-bold text-gray-900">
                              {subject.average}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${subject.color}`}
                              style={{ width: `${subject.average}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-blue-500" />
                      <h2 className="text-lg font-semibold text-gray-900">
                        Recent Platform Activity
                      </h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            New exam created by Dr. Sarah Miller
                          </p>
                          <p className="text-xs text-gray-500">
                            Mathematics - Algebra Fundamentals • 2 hours ago
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            25 students completed Science Quiz #3
                          </p>
                          <p className="text-xs text-gray-500">
                            Average score: 87.3% • 4 hours ago
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            New assignment posted by Ms. Emily Taylor
                          </p>
                          <p className="text-xs text-gray-500">
                            English Literature Essay • 6 hours ago
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-3 bg-orange-50 rounded-lg">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            3 new students enrolled
                          </p>
                          <p className="text-xs text-gray-500">
                            Added to Grade 10 classes • 8 hours ago
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-3 bg-red-50 rounded-lg">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Exam portal temporarily disabled
                          </p>
                          <p className="text-xs text-gray-500">
                            System maintenance completed • 12 hours ago
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
        )}
      </ProtectedRoute>
    </SubscriptionGuard>
  );
}
