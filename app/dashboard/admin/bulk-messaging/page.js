"use client";

import { useState } from "react";
import {
  Mail,
  MessageSquare,
  Send,
  Users,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import SubscriptionGuard from "@/components/SubscriptionGuard";

export default function BulkMessaging() {
  const [emailData, setEmailData] = useState({
    subject: "",
    message: "",
    recipients: "",
  });

  const [whatsappData, setWhatsappData] = useState({
    message: "",
    recipients: "",
  });

  const [emailSending, setEmailSending] = useState(false);
  const [whatsappSending, setWhatsappSending] = useState(false);
  const [emailResult, setEmailResult] = useState(null);
  const [whatsappResult, setWhatsappResult] = useState(null);

  const handleEmailSend = async (e) => {
    e.preventDefault();
    setEmailSending(true);
    setEmailResult(null);

    try {
      const token = localStorage.getItem("token");
      const recipients = emailData.recipients
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email);

      if (recipients.length === 0) {
        setEmailResult({
          success: false,
          message: "Please enter at least one email address",
        });
        return;
      }

      const response = await fetch(
        "http://localhost:3001/api/messaging/bulk-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subject: emailData.subject,
            message: emailData.message,
            recipients: recipients,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setEmailResult({
          success: true,
          message: `Email sent successfully to ${recipients.length} recipient(s)`,
        });
        setEmailData({ subject: "", message: "", recipients: "" });
      } else {
        setEmailResult({
          success: false,
          message: data.message || "Failed to send emails",
        });
      }
    } catch (error) {
      setEmailResult({
        success: false,
        message: "Connection error. Please try again.",
      });
    } finally {
      setEmailSending(false);
    }
  };

  const handleWhatsAppSend = async (e) => {
    e.preventDefault();
    setWhatsappSending(true);
    setWhatsappResult(null);

    try {
      const token = localStorage.getItem("token");
      const recipients = whatsappData.recipients
        .split(",")
        .map((phone) => phone.trim())
        .filter((phone) => phone);

      if (recipients.length === 0) {
        setWhatsappResult({
          success: false,
          message: "Please enter at least one phone number",
        });
        return;
      }

      const response = await fetch(
        "http://localhost:3001/api/messaging/bulk-whatsapp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: whatsappData.message,
            recipients: recipients,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setWhatsappResult({
          success: true,
          message: `WhatsApp messages sent successfully to ${recipients.length} recipient(s)`,
        });
        setWhatsappData({ message: "", recipients: "" });
      } else {
        setWhatsappResult({
          success: false,
          message: data.message || "Failed to send WhatsApp messages",
        });
      }
    } catch (error) {
      setWhatsappResult({
        success: false,
        message: "Connection error. Please try again.",
      });
    } finally {
      setWhatsappSending(false);
    }
  };

  const clearEmailResult = () => setEmailResult(null);
  const clearWhatsappResult = () => setWhatsappResult(null);

  return (
    <SubscriptionGuard>
      <ProtectedRoute allowedRoles={["admin"]}>
        {(user) => (
          <div className="min-h-screen bg-gray-50 flex">
            <Sidebar user={user} />
            <div className="p-6">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Bulk Messaging
                </h1>
                <p className="text-gray-600">
                  Send bulk emails and WhatsApp messages to users
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Email Section */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Send Bulk Emails
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Send emails to multiple recipients
                      </p>
                    </div>
                  </div>

                  {emailResult && (
                    <div
                      className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
                        emailResult.success
                          ? "bg-green-50 border border-green-200 text-green-700"
                          : "bg-red-50 border border-red-200 text-red-700"
                      }`}
                    >
                      <div className="flex items-center">
                        {emailResult.success ? (
                          <CheckCircle className="h-5 w-5 mr-2" />
                        ) : (
                          <AlertCircle className="h-5 w-5 mr-2" />
                        )}
                        <span className="text-sm">{emailResult.message}</span>
                      </div>
                      <button
                        onClick={clearEmailResult}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleEmailSend} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        required
                        value={emailData.subject}
                        onChange={(e) =>
                          setEmailData({
                            ...emailData,
                            subject: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter email subject"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message
                      </label>
                      <textarea
                        required
                        value={emailData.message}
                        onChange={(e) =>
                          setEmailData({
                            ...emailData,
                            message: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        rows={8}
                        placeholder="Enter your email message here..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recipients
                      </label>
                      <textarea
                        required
                        value={emailData.recipients}
                        onChange={(e) =>
                          setEmailData({
                            ...emailData,
                            recipients: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        rows={4}
                        placeholder="Enter email addresses separated by commas (e.g., user1@example.com, user2@example.com)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Separate multiple email addresses with commas
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">
                        💡 Email Tips:
                      </h4>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• Keep subject lines clear and concise</li>
                        <li>• Use professional language in your message</li>
                        <li>• Double-check email addresses before sending</li>
                        <li>• Consider the timing of your message</li>
                      </ul>
                    </div>

                    <button
                      type="submit"
                      disabled={emailSending}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {emailSending ? (
                        <>
                          <Loader className="h-5 w-5 animate-spin" />
                          <span>Sending Emails...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          <span>Send Bulk Emails</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* WhatsApp Section */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                      <MessageSquare className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Send Bulk WhatsApp
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Send WhatsApp messages to multiple recipients
                      </p>
                    </div>
                  </div>

                  {whatsappResult && (
                    <div
                      className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
                        whatsappResult.success
                          ? "bg-green-50 border border-green-200 text-green-700"
                          : "bg-red-50 border border-red-200 text-red-700"
                      }`}
                    >
                      <div className="flex items-center">
                        {whatsappResult.success ? (
                          <CheckCircle className="h-5 w-5 mr-2" />
                        ) : (
                          <AlertCircle className="h-5 w-5 mr-2" />
                        )}
                        <span className="text-sm">
                          {whatsappResult.message}
                        </span>
                      </div>
                      <button
                        onClick={clearWhatsappResult}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleWhatsAppSend} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message
                      </label>
                      <textarea
                        required
                        value={whatsappData.message}
                        onChange={(e) =>
                          setWhatsappData({
                            ...whatsappData,
                            message: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        rows={8}
                        placeholder="Enter your WhatsApp message here..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Keep messages concise for better delivery rates
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recipients
                      </label>
                      <textarea
                        required
                        value={whatsappData.recipients}
                        onChange={(e) =>
                          setWhatsappData({
                            ...whatsappData,
                            recipients: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        rows={4}
                        placeholder="Enter phone numbers separated by commas (e.g., +1234567890, +0987654321)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Include country codes (e.g., +1 for US, +44 for UK)
                      </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-green-800 mb-2">
                        📱 WhatsApp Tips:
                      </h4>
                      <ul className="text-xs text-green-700 space-y-1">
                        <li>• Include country codes for all phone numbers</li>
                        <li>
                          • Keep messages under 160 characters when possible
                        </li>
                        <li>• Avoid spam-like content to prevent blocking</li>
                        <li>• Test with a small group first</li>
                      </ul>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2" />
                        <div>
                          <h4 className="text-sm font-medium text-yellow-800">
                            WhatsApp Configuration Required
                          </h4>
                          <p className="text-xs text-yellow-700 mt-1">
                            WhatsApp messaging requires Twilio configuration.
                            Contact your system administrator if messages fail
                            to send.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={whatsappSending}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {whatsappSending ? (
                        <>
                          <Loader className="h-5 w-5 animate-spin" />
                          <span>Sending Messages...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          <span>Send Bulk WhatsApp</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Usage Statistics */}
              <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg mr-4">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Quick Actions
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Common messaging scenarios
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() =>
                      setEmailData({
                        ...emailData,
                        subject: "Important School Announcement",
                        message:
                          "Dear Students and Parents,\n\nWe have an important announcement to share with you.\n\nBest regards,\nSchool Administration",
                      })
                    }
                    className="p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                  >
                    <h4 className="font-medium text-blue-900 mb-1">
                      School Announcement
                    </h4>
                    <p className="text-sm text-blue-700">
                      Template for general announcements
                    </p>
                  </button>

                  <button
                    onClick={() =>
                      setEmailData({
                        ...emailData,
                        subject: "Exam Schedule Update",
                        message:
                          "Dear Students,\n\nPlease note the updated exam schedule.\n\nBest regards,\nAcademic Team",
                      })
                    }
                    className="p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                  >
                    <h4 className="font-medium text-green-900 mb-1">
                      Exam Notice
                    </h4>
                    <p className="text-sm text-green-700">
                      Template for exam-related updates
                    </p>
                  </button>

                  <button
                    onClick={() =>
                      setWhatsappData({
                        ...whatsappData,
                        message:
                          "Hello! This is a reminder about tomorrow's school event. Please make sure to attend on time. Thank you!",
                      })
                    }
                    className="p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
                  >
                    <h4 className="font-medium text-purple-900 mb-1">
                      Event Reminder
                    </h4>
                    <p className="text-sm text-purple-700">
                      Template for event reminders
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </ProtectedRoute>
    </SubscriptionGuard>
  );
}
