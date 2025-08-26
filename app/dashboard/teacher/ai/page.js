"use client";

import { useState, useEffect, useRef } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import SchoolSubscriptionGuard from "@/components/SchoolSubscriptionGuard";
import {
  Bot,
  Send,
  Plus,
  MessageSquare,
  Trash2,
  Edit3,
  User,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Menu, // <-- add Menu icon for hamburger
} from "lucide-react";

export default function TeacherAI() {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // NEW STATE
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/ai/sessions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setMessage({ type: "error", content: "Failed to fetch chat sessions" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSession = async (sessionId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/ai/sessions/${sessionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCurrentSession(data);
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Error loading session:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsSending(true);

    // Add user message to UI immediately
    const newUserMessage = {
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId: currentSession?.sessionId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Add AI response to messages
        const aiMessage = {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);

        // Update current session
        if (!currentSession) {
          setCurrentSession({
            sessionId: data.sessionId,
            title: userMessage.substring(0, 50),
          });
          fetchSessions(); // Refresh sessions list
        }
      } else {
        setMessage({
          type: "error",
          content: data.message || "Failed to send message",
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessage({
        type: "error",
        content: "Network error. Please try again.",
      });
    } finally {
      setIsSending(false);
    }
  };

  const createNewSession = () => {
    setCurrentSession(null);
    setMessages([]);
  };

  const deleteSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to delete this chat session?"))
      return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/ai/sessions/${sessionId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setMessage({
          type: "success",
          content: "Chat session deleted successfully",
        });
        if (currentSession?.sessionId === sessionId) {
          setCurrentSession(null);
          setMessages([]);
        }
        fetchSessions();
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      setMessage({ type: "error", content: "Failed to delete session" });
    }
  };

  return (
    <SchoolSubscriptionGuard>
      <ProtectedRoute allowedRoles={["teacher"]}>
        {(user) => (
          <div className="min-h-screen bg-gray-50 flex">
            <Sidebar user={user} />

            <div className="flex-1 flex">
              {/* Chat Sessions Sidebar */}

              {isSidebarOpen && (
                <div className="fixed inset-0 z-50 flex">
                  {/* Overlay */}
                  <div
                    className="fixed inset-0 bg-black bg-opacity-40"
                    onClick={() => setIsSidebarOpen(false)}
                  />
                  {/* Drawer */}
                  <div className="relative w-72 bg-white shadow-lg flex flex-col z-50">
                    <div className="p-4 border-b flex justify-between items-center">
                      <h2 className="text-lg font-semibold">History</h2>
                      <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-2 rounded-lg hover:bg-gray-100"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    {/* Sidebar content (reuse your existing sidebar session list) */}
                    {sessions.map((session) => (
                      <div
                        key={session.sessionId}
                        onClick={() => loadSession(session.sessionId)}
                        className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                          currentSession?.sessionId === session.sessionId
                            ? "bg-green-50 border-l-4 border-l-green-500"
                            : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {session.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {session.messageCount} messages
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(session.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSession(session.sessionId);
                            }}
                            className="text-gray-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {sessions.length === 0 && !isLoading && (
                      <div className="text-center py-8">
                        <Bot className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 text-sm">
                          No chat sessions yet
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {!isSidebarOpen && (
                <div className="hidden lg:flex w-80 bg-white border-r border-gray-200 flex-col">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">
                        AI Assistant
                      </h2>
                      <button
                        onClick={createNewSession}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        title="New chat"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">
                      Ask questions about teaching, curriculum, or get help with
                      exam creation.
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {sessions.map((session) => (
                      <div
                        key={session.sessionId}
                        onClick={() => loadSession(session.sessionId)}
                        className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                          currentSession?.sessionId === session.sessionId
                            ? "bg-green-50 border-l-4 border-l-green-500"
                            : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {session.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {session.messageCount} messages
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(session.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSession(session.sessionId);
                            }}
                            className="text-gray-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {sessions.length === 0 && !isLoading && (
                      <div className="text-center py-8">
                        <Bot className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 text-sm">
                          No chat sessions yet
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Chat Area */}
              <div className="flex-1 flex flex-col h-screen">
                {/* Message */}
                {message.content && (
                  <div
                    className={`m-6 mb-0 p-4 rounded-lg flex items-center gap-3 ${
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

                {/* Chat Header */}
                <div className="p-6 border-b border-gray-200 bg-white">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsSidebarOpen(true)}
                      className="
    block lg:hidden           
    fixed left-2 top-1/2 -translate-y-1/2  /* left side, vertically centered */
    bg-gray-800 text-white p-3 rounded-r-lg shadow-md
    focus:outline-none
  "
                    >
                      ☰
                    </button>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Bot className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {currentSession?.title || "AI Teaching Assistant"}
                      </h2>
                      <p className="text-sm text-gray-600">
                        Ask me anything about teaching, curriculum, or exam
                        creation
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Start a conversation
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Ask me about teaching strategies, curriculum planning,
                        or exam creation.
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {[
                          "What is photosynthesis?",
                          "What are effective assessment strategies?",
                          "Help me design a math quiz",
                          "Tips for classroom management",
                        ].map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => setInputMessage(suggestion)}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {messages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex gap-4 ${
                            msg.role === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          {msg.role === "assistant" && (
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Bot className="w-5 h-5 text-green-600" />
                            </div>
                          )}
                          <div
                            className={`max-w-3xl ${
                              msg.role === "user" ? "order-1" : ""
                            }`}
                          >
                            <div
                              className={`p-4 rounded-2xl ${
                                msg.role === "user"
                                  ? "bg-green-600 text-white"
                                  : "bg-white border border-gray-200"
                              }`}
                            >
                              <p className="whitespace-pre-wrap">
                                {msg.content}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 px-2">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                          {msg.role === "user" && (
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white border-t border-gray-200">
                  <form onSubmit={sendMessage} className="flex gap-4">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Ask me anything about teaching..."
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        disabled={isSending}
                      />
                      <button
                        type="submit"
                        disabled={!inputMessage.trim() || isSending}
                        className="absolute right-2 top-2 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                  {isSending && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                      <div className="animate-spin w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
                      AI is thinking...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </ProtectedRoute>
    </SchoolSubscriptionGuard>
  );
}
