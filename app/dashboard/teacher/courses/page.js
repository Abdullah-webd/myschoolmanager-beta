'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import FileUploader from '@/components/FileUploader';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  Play,
  FileText,
  Image,
  Video,
  ExternalLink,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    subject: '',
    class: ''
  });

  const [uploadData, setUploadData] = useState({
    files: [],
    youtubeLinks: []
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setMessage({ type: 'error', content: 'Failed to fetch courses' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      // Add course data
      Object.keys(courseData).forEach(key => {
        formData.append(key, courseData[key]);
      });

      // Add files
      uploadData.files.forEach(file => {
        formData.append('files', file);
      });

      // Add YouTube links
      uploadData.youtubeLinks.forEach(link => {
        formData.append('youtubeLinks', link);
      });

      const url = editingCourse 
        ? `http://localhost:3001/api/courses/${editingCourse._id}`
        : 'http://localhost:3001/api/courses';
      
      const method = editingCourse ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          content: `Course ${editingCourse ? 'updated' : 'created'} successfully!` 
        });
        setShowCreateModal(false);
        setEditingCourse(null);
        resetForm();
        fetchCourses();
      } else {
        setMessage({ type: 'error', content: data.message || 'Failed to save course' });
      }
    } catch (error) {
      console.error('Error saving course:', error);
      setMessage({ type: 'error', content: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setCourseData({
      title: course.title,
      description: course.description,
      subject: course.subject,
      class: course.class
    });
    setUploadData({ files: [], youtubeLinks: [] });
    setShowCreateModal(true);
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This will also delete all uploaded files.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setMessage({ type: 'success', content: 'Course deleted successfully' });
        fetchCourses();
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      setMessage({ type: 'error', content: 'Failed to delete course' });
    }
  };

  const resetForm = () => {
    setCourseData({
      title: '',
      description: '',
      subject: '',
      class: ''
    });
    setUploadData({ files: [], youtubeLinks: [] });
  };

  const getMaterialIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5 text-purple-500" />;
      case 'image': return <Image className="w-5 h-5 text-blue-500" />;
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'youtube': return <Play className="w-5 h-5 text-red-600" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      {(user) => (
        <div className="min-h-screen bg-gray-50 flex">
          <Sidebar user={user} />
          
          <div className="flex-1 flex flex-col lg:ml-0">
            <main className="flex-1 p-6 lg:p-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Materials</h1>
                  <p className="text-gray-600">Upload and manage course content for your students</p>
                </div>
                <button
                  onClick={() => {
                    setEditingCourse(null);
                    resetForm();
                    setShowCreateModal(true);
                  }}
                  className="mt-4 sm:mt-0 inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Course
                </button>
              </div>

              {/* Message */}
              {message.content && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                  message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                  'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message.type === 'success' ? 
                    <CheckCircle className="w-5 h-5" /> : 
                    <AlertCircle className="w-5 h-5" />
                  }
                  <p className="text-sm">{message.content}</p>
                  <button
                    onClick={() => setMessage({ type: '', content: '' })}
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
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Courses Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <div key={course._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                          <p className="text-sm text-gray-500">{course.subject} • {course.class}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(course)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit course"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(course._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>

                    {/* Materials */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">
                        Materials ({course.materials.length})
                      </h4>
                      {course.materials.slice(0, 3).map((material, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          {getMaterialIcon(material.type)}
                          <span className="truncate">{material.title}</span>
                        </div>
                      ))}
                      {course.materials.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{course.materials.length - 3} more materials
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Created {new Date(course.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {filteredCourses.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'Try adjusting your search criteria' : 'Create your first course to get started'}
                  </p>
                </div>
              )}
            </main>
          </div>

          {/* Create/Edit Course Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingCourse ? 'Edit Course' : 'Create New Course'}
                    </h2>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Course Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
                        <input
                          type="text"
                          value={courseData.title}
                          onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Enter course title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                        <input
                          type="text"
                          value={courseData.subject}
                          onChange={(e) => setCourseData({ ...courseData, subject: e.target.value })}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="e.g., Mathematics"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                        <input
                          type="text"
                          value={courseData.class}
                          onChange={(e) => setCourseData({ ...courseData, class: e.target.value })}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="e.g., Grade 10"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={courseData.description}
                          onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                          required
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                          placeholder="Describe what this course covers..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Materials</h3>
                    <FileUploader
                      onFilesChange={setUploadData}
                      acceptedTypes="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx"
                      maxFiles={20}
                      maxSize={100}
                    />
                  </div>

                  <div className="flex justify-end gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? 'Saving...' : (editingCourse ? 'Update Course' : 'Create Course')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </ProtectedRoute>
  );
}