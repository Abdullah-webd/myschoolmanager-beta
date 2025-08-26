"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import NotionEditor from "@/components/NotionEditor";
import SchoolSubscriptionGuard from "@/components/SchoolSubscriptionGuard";
import {
  StickyNote,
  Plus,
  Search,
  Pin,
  PinOff,
  Tag,
  CheckCircle,
  AlertCircle,
  X,
  Menu,
} from "lucide-react";

export default function TeacherNotes() {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [allTags, setAllTags] = useState([]);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // mobile drawer

  useEffect(() => {
    fetchNotes();
    fetchTags();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [notes, searchTerm, tagFilter]);

  // Close on ESC + lock body scroll while drawer open
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsSidebarOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/notes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      setMessage({ type: "error", content: "Failed to fetch notes" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3001/api/notes/tags/list",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setAllTags(data);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const filterNotes = () => {
    let filtered = notes;
    if (searchTerm) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (tagFilter) {
      filtered = filtered.filter((note) => note.tags.includes(tagFilter));
    }
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    setFilteredNotes(filtered);
  };

  const handleSaveNote = async (noteData) => {
    try {
      const token = localStorage.getItem("token");
      const url =
        selectedNote && selectedNote._id
          ? `http://localhost:3001/api/notes/${selectedNote._id}`
          : "http://localhost:3001/api/notes";
      const method = selectedNote && selectedNote._id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(noteData),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({
          type: "success",
          content: `Note ${selectedNote ? "updated" : "created"} successfully!`,
        });
        fetchNotes();
        fetchTags();
        if (!selectedNote) setSelectedNote(data.note);
      } else {
        setMessage({
          type: "error",
          content: data.message || "Failed to save note",
        });
      }
    } catch (error) {
      console.error("Error saving note:", error);
      setMessage({
        type: "error",
        content: "Network error. Please try again.",
      });
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedNote) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/notes/${selectedNote._id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) {
        setMessage({ type: "success", content: "Note deleted successfully!" });
        setSelectedNote(null);
        fetchNotes();
        fetchTags();
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      setMessage({ type: "error", content: "Failed to delete note" });
    }
  };

  const togglePin = async (noteId, currentPinStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/notes/${noteId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isPinned: !currentPinStatus }),
        }
      );
      if (response.ok) fetchNotes();
    } catch (error) {
      console.error("Error toggling pin:", error);
    }
  };

  const createNewNote = () => {
    setSelectedNote({
      _id: null,
      title: "",
      content: "",
      tags: [],
      isPinned: false,
    });
  };

  // Reusable: the actual "Notes" sidebar content
  const NotesPanel = ({ onSelectNote }) => (
    <>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Notes</h2>
          <button
            onClick={createNewNote}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="New note"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Tag Filter */}
        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All tags</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotes.map((note) => (
          <div
            key={note._id}
            onClick={() => onSelectNote(note)}
            className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
              selectedNote?._id === note._id
                ? "bg-blue-50 border-l-4 border-l-blue-500"
                : ""
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-gray-900 truncate flex-1">
                {note.title || "Untitled"}
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePin(note._id, note.isPinned);
                }}
                className="text-gray-400 hover:text-yellow-500"
              >
                {note.isPinned ? (
                  <Pin className="w-4 h-4 text-yellow-500" />
                ) : (
                  <PinOff className="w-4 h-4" />
                )}
              </button>
            </div>

            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {note.content.replace(/<[^>]*>/g, "").substring(0, 100)}...
            </p>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
              {note.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span>{note.tags.length}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredNotes.length === 0 && (
          <div className="text-center py-8">
            <StickyNote className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 text-sm">
              {searchTerm || tagFilter
                ? "No notes match your criteria"
                : "No notes yet"}
            </p>
          </div>
        )}
      </div>
    </>
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
          <div className="min-h-screen bg-gray-50 flex relative">
            {/* App-wide sidebar (your own component) */}
            <Sidebar user={user} />

            {/* Mobile hamburger */}
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

            {/* Mobile overlay */}
            <div
              onClick={() => setIsSidebarOpen(false)}
              className={`fixed inset-0 bg-black/40 z-[60] lg:hidden transition-opacity duration-300 ${
                isSidebarOpen
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
            />

            {/* Mobile drawer */}
            <aside
              className={`fixed top-0 left-0 bottom-0 w-80 bg-white border-r border-gray-200 z-[70] transform transition-transform duration-300 ease-out lg:hidden flex flex-col ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
              role="dialog"
              aria-modal="true"
            >
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">History</h2>
                <button
                  aria-label="Close notes"
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <NotesPanel
                onSelectNote={(note) => {
                  setSelectedNote(note);
                  setIsSidebarOpen(false);
                }}
              />
            </aside>

            {/* Desktop persistent notes sidebar */}
            <div className="hidden lg:flex w-80 bg-white border-r border-gray-200 flex-col shrink-0">
              <NotesPanel onSelectNote={(note) => setSelectedNote(note)} />
            </div>

            {/* Editor area (no rogue widths here) */}
            <div className="flex-1 flex flex-col">
              {message.content && (
                <div
                  className={`m-6 mb-0 p-4 rounded-lg flex items-center gap-3 ${
                    message.type === "success"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
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

              {selectedNote !== null ? (
                <div className="flex-1 p-6">
                  <NotionEditor
                    note={selectedNote}
                    onSave={handleSaveNote}
                    onDelete={handleDeleteNote}
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <StickyNote className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      Create Your First Note
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Start writing and organizing your thoughts
                    </p>
                    <button
                      onClick={createNewNote}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      New Note
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </ProtectedRoute>
    </SchoolSubscriptionGuard>
  );
}
