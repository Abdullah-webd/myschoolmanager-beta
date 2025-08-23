"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import {
  Users,
  FileText,
  ClipboardList,
  Settings,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import SubscriptionGuard from "@/components/SubscriptionGuard";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalExams: 0,
    totalAssignments: 0,
    totalStudents: 0,
    totalTeachers: 0,
    activeExams: 0,
    pendingGrading: 0,
    systemHealth: "good",
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch users
      const usersResponse = await fetch("http://localhost:3001/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (usersResponse.ok) {
        const users = await usersResponse.json();
        const totalStudents = users.filter((u) => u.role === "student").length;
        const totalTeachers = users.filter((u) => u.role === "teacher").length;

        setStats((prev) => ({
          ...prev,
          totalUsers: users.length,
          totalStudents,
          totalTeachers,
        }));
      }

      // Fetch exams
      const examsResponse = await fetch("http://localhost:3001/api/exams", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (examsResponse.ok) {
        const exams = await examsResponse.json();
        const now = new Date();
        const activeExams = exams.filter(
          (exam) =>
            new Date(exam.startDate) <= now && new Date(exam.endDate) >= now
        ).length;

        setStats((prev) => ({
          ...prev,
          totalExams: exams.length,
          activeExams,
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
        setStats((prev) => ({
          ...prev,
          totalAssignments: assignments.length,
        }));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-blue-500",
      change: "+12%",
      changeType: "positive",
    },
    {
      title: "Students",
      value: stats.totalStudents,
      icon: Users,
      color: "bg-green-500",
      change: "+8%",
      changeType: "positive",
    },
    {
      title: "Teachers",
      value: stats.totalTeachers,
      icon: Users,
      color: "bg-purple-500",
      change: "+3%",
      changeType: "positive",
    },
    {
      title: "Total Exams",
      value: stats.totalExams,
      icon: FileText,
      color: "bg-orange-500",
      change: "+15%",
      changeType: "positive",
    },
    {
      title: "Active Exams",
      value: stats.activeExams,
      icon: Clock,
      color: "bg-red-500",
      change: "2 today",
      changeType: "neutral",
    },
    {
      title: "Assignments",
      value: stats.totalAssignments,
      icon: ClipboardList,
      color: "bg-indigo-500",
      change: "+10%",
      changeType: "positive",
    },
  ];

  const quickActions = [
    {
      title: "Manage Users",
      description: "Add, edit, or remove teachers and students",
      href: "/dashboard/admin/users",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "System Settings",
      description: "Configure portal settings and preferences",
      href: "/dashboard/admin/settings",
      icon: Settings,
      color: "bg-gray-500",
    },
    {
      title: "View Analytics",
      description: "Monitor system performance and usage",
      href: "/dashboard/admin/analytics",
      icon: TrendingUp,
      color: "bg-green-500",
    },
  ];

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
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {user.firstName}!
                  </h1>
                  <p className="text-gray-600">
                    Here's what's happening in your school management system
                    today.
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                                : stat.changeType === "negative"
                                ? "text-red-600"
                                : "text-gray-500"
                            }`}
                          >
                            {stat.change}
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

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                      Quick Actions
                    </h2>
                    <div className="space-y-4">
                      {quickActions.map((action, index) => (
                        <a
                          key={index}
                          href={action.href}
                          className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center`}
                            >
                              <action.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {action.title}
                              </h3>
                              <p className="text-gray-600 text-sm">
                                {action.description}
                              </p>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* System Status */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                      System Status
                    </h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-sm font-medium text-gray-900">
                              Database
                            </span>
                          </div>
                          <span className="text-sm text-green-600">
                            Operational
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-sm font-medium text-gray-900">
                              API Server
                            </span>
                          </div>
                          <span className="text-sm text-green-600">
                            Operational
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            <span className="text-sm font-medium text-gray-900">
                              Email Service
                            </span>
                          </div>
                          <span className="text-sm text-yellow-600">
                            Limited
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-sm font-medium text-gray-900">
                              AI Service
                            </span>
                          </div>
                          <span className="text-sm text-green-600">
                            Operational
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            Overall Status
                          </span>
                          <span className="inline-flex items-center gap-1 text-sm text-green-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Healthy
                          </span>
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
