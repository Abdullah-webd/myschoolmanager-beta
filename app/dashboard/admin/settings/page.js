"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import Sidebar from "@/components/Sidebar";
import {
  Settings,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    exam_portal_enabled: true,
    notification_email_enabled: true,
    notification_whatsapp_enabled: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    fetchSettings();
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3001/api/payments/subscription",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const settingsMap = {};
        data.forEach((setting) => {
          settingsMap[setting.key] = setting.value;
        });
        setSettings({ ...settings, ...settingsMap });
      } else {
        // Initialize default settings if none exist
        await initializeSettings();
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      setMessage({ type: "error", content: "Failed to fetch settings" });
    } finally {
      setIsLoading(false);
    }
  };

  const initializeSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:3001/api/settings/init", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSettings();
    } catch (error) {
      console.error("Error initializing settings:", error);
    }
  };

  const updateSetting = async (key, value) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/settings/${key}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            value,
            description: getSettingDescription(key),
          }),
        }
      );

      if (response.ok) {
        console.log(`Setting ${key} updated to ${value}`);
        setSettings({ ...settings, [key]: value });
        setMessage({
          type: "success",
          content: `${getSettingLabel(key)} ${
            value ? "enabled" : "disabled"
          } successfully`,
        });
      } else {
        setMessage({ type: "error", content: "Failed to update setting" });
      }
    } catch (error) {
      console.error("Error updating setting:", error);
      setMessage({
        type: "error",
        content: "Network error. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getSettingLabel = (key) => {
    const labels = {
      exam_portal_enabled: "Exam Portal",
      notification_email_enabled: "Email Notifications",
      notification_whatsapp_enabled: "WhatsApp Notifications",
    };
    return labels[key] || key;
  };

  const getSettingDescription = (key) => {
    const descriptions = {
      exam_portal_enabled:
        "Controls whether students can access the exam portal",
      notification_email_enabled: "Enable email notifications system-wide",
      notification_whatsapp_enabled:
        "Enable WhatsApp notifications (requires Twilio configuration)",
    };
    return descriptions[key] || "";
  };

  const settingItems = [
    {
      key: "exam_portal_enabled",
      title: "Exam Portal Access",
      description:
        'When disabled, students will not be able to access or take exams. They will see a "Portal is closed" message.',
      icon: "📝",
      category: "Exam Management",
    },
    {
      key: "notification_email_enabled",
      title: "Email Notifications",
      description:
        "Enable or disable email notifications for account creation, password resets, and system announcements.",
      icon: "📧",
      category: "Notifications",
    },
    {
      key: "notification_whatsapp_enabled",
      title: "WhatsApp Notifications",
      description:
        "Send notifications via WhatsApp (requires Twilio configuration in environment variables).",
      icon: "💬",
      category: "Notifications",
    },
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
                    <Settings className="w-8 h-8 text-red-600" />
                    <h1 className="text-3xl font-bold text-gray-900">
                      System Settings
                    </h1>
                  </div>
                  <p className="text-gray-600">
                    Configure system-wide settings and preferences
                  </p>
                </div>

                {/* Subscription Section */}
                {subscription && (
                  <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                      Subscription Plan
                    </h3>
                    <p className="text-gray-800">
                      <span className="font-bold">Current Plan:</span>{" "}
                      {subscription.planType
                        ? subscription.planType.charAt(0).toUpperCase() +
                          subscription.planType.slice(1)
                        : "No active plan"}
                    </p>
                    {subscription.expiryDate && (
                      <p className="text-gray-800">
                        <span className="font-bold">Days Left:</span>{" "}
                        {Math.max(
                          0,
                          Math.ceil(
                            (new Date(subscription.expiryDate) - new Date()) /
                              (1000 * 60 * 60 * 24)
                          )
                        )}
                      </p>
                    )}
                    {!subscription.isActive && (
                      <p className="text-red-600 font-semibold mt-2">
                        Your subscription has expired!
                      </p>
                    )}
                  </div>
                )}

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

                {/* Settings Groups */}
                <div className="space-y-8">
                  {["Exam Management", "Notifications"].map((category) => (
                    <div key={category}>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        {category}
                      </h2>
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        {settingItems
                          .filter((item) => item.category === category)
                          .map((item, index, array) => (
                            <div
                              key={item.key}
                              className={`p-6 ${
                                index < array.length - 1
                                  ? "border-b border-gray-200"
                                  : ""
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl">
                                      {item.icon}
                                    </span>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      {item.title}
                                    </h3>
                                  </div>
                                  <p className="text-gray-600 text-sm max-w-2xl">
                                    {item.description}
                                  </p>
                                  {item.key === "exam_portal_enabled" && (
                                    <div className="mt-3">
                                      <div
                                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                                          settings[item.key]
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                        }`}
                                      >
                                        <div
                                          className={`w-2 h-2 rounded-full ${
                                            settings[item.key]
                                              ? "bg-green-400"
                                              : "bg-red-400"
                                          }`}
                                        ></div>
                                        {settings[item.key]
                                          ? "Portal Open"
                                          : "Portal Closed"}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`text-sm font-medium ${
                                      settings[item.key]
                                        ? "text-green-600"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {settings[item.key]
                                      ? "Enabled"
                                      : "Disabled"}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateSetting(
                                        item.key,
                                        !settings[item.key]
                                      )
                                    }
                                    disabled={isSaving}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                                      settings[item.key]
                                        ? "bg-red-600"
                                        : "bg-gray-200"
                                    } ${
                                      isSaving
                                        ? "opacity-50 cursor-not-allowed"
                                        : "cursor-pointer"
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        settings[item.key]
                                          ? "translate-x-6"
                                          : "translate-x-1"
                                      }`}
                                    />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Additional Information */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">
                    Important Notes
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>
                      • Changes to these settings take effect immediately across
                      the system
                    </li>
                    <li>
                      • When the exam portal is disabled, all students will see
                      a "Portal is closed" message
                    </li>
                    <li>
                      • Email notifications require proper SMTP configuration in
                      environment variables
                    </li>
                    <li>
                      • WhatsApp notifications require valid Twilio credentials
                      and phone number verification
                    </li>
                    <li>• All setting changes are logged for audit purposes</li>
                  </ul>
                </div>
              </main>
            </div>
          </div>
        )}
      </ProtectedRoute>
    </SubscriptionGuard>
  );
}
