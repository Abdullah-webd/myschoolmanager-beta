"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import {
  Bell,
  Search,
  Filter,
  Mail,
  AlertCircle,
  CheckCircle,
  Info,
  Clock,
  Trash2,
  BookMarked as MarkAsRead,
} from "lucide-react";
import SchoolSubscriptionGuard from "@/components/SchoolSubscriptionGuard";

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(
        `http://localhost:3001/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:3001/api/notifications/read-all", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:3001/api/notifications/${notificationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "exam":
        return <Bell className="w-5 h-5 text-blue-500" />;
      case "assignment":
        return <Bell className="w-5 h-5 text-purple-500" />;
      case "message":
        return <Mail className="w-5 h-5 text-indigo-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === "all" ||
      (filterType === "unread" && !notification.isRead) ||
      (filterType === "read" && notification.isRead) ||
      notification.type === filterType;

    return matchesSearch && matchesFilter;
  });

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
          <div className="min-h-screen bg-gray-50 flex">
            <Sidebar user={user} />

            <div className="flex-1 flex flex-col lg:ml-0">
              <main className="flex-1 p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Notifications
                    </h1>
                    <p className="text-gray-600">
                      Stay updated with important messages and alerts
                    </p>
                  </div>
                  <button
                    onClick={markAllAsRead}
                    className="mt-4 sm:mt-0 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Mark All Read
                  </button>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Search notifications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Notifications</option>
                      <option value="unread">Unread</option>
                      <option value="read">Read</option>
                      <option value="exam">Exams</option>
                      <option value="assignment">Assignments</option>
                      <option value="message">Messages</option>
                    </select>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  {filteredNotifications.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {filteredNotifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`p-6 hover:bg-gray-50 transition-colors ${
                            !notification.isRead
                              ? "bg-blue-50 border-l-4 border-l-blue-500"
                              : ""
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="mt-1">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3
                                    className={`text-lg font-semibold ${
                                      !notification.isRead
                                        ? "text-gray-900"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {notification.title}
                                  </h3>
                                  {!notification.isRead && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                                <p className="text-gray-600 mb-3">
                                  {notification.message}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>
                                      {new Date(
                                        notification.createdAt
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  {notification.sender && (
                                    <span>
                                      From: {notification.sender.firstName}{" "}
                                      {notification.sender.lastName}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              {!notification.isRead && (
                                <button
                                  onClick={() => markAsRead(notification._id)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Mark as read"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() =>
                                  deleteNotification(notification._id)
                                }
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete notification"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No notifications found
                      </h3>
                      <p className="text-gray-600">
                        {searchTerm || filterType !== "all"
                          ? "Try adjusting your search or filter criteria"
                          : "You're all caught up! No new notifications."}
                      </p>
                    </div>
                  )}
                </div>
              </main>
            </div>
          </div>
        )}
      </ProtectedRoute>
    </SchoolSubscriptionGuard>
  );
}
