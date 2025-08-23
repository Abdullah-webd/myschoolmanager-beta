'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { 
  BookOpen, 
  Search, 
  Play,
  Download,
  Eye,
  FileText,
  Image,
  Video,
  ExternalLink,
  Clock
} from 'lucide-react';

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);

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
    } finally {
      setIsLoading(false);
    }
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

  const handleMaterialClick = (material) => {
  if (material.type === 'youtube') {
    window.open(material.url, '_blank');
  } else if (material.url) {
    const link = document.createElement('a');
    link.href = `http://localhost:3001${material.url}`;
    link.download = '';  // This tells the browser to download the file
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};


  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase())
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
    <ProtectedRoute allowedRoles={['student']}>
      {(user) => (
        <div className="min-h-screen bg-gray-50 flex">
          <Sidebar user={user} />
          
          <div className="flex-1 flex flex-col lg:ml-0">
            <main className="flex-1 p-6 lg:p-8">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Materials</h1>
                <p className="text-gray-600">Access videos, documents, and resources from your teachers</p>
              </div>

              {/* Search */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Courses Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <div key={course._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                          <p className="text-sm text-gray-500">{course.subject}</p>
                          <p className="text-xs text-gray-400">
                            by {course.teacher.firstName} {course.teacher.lastName}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>

                    {/* Materials */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Materials ({course.materials.length})
                      </h4>
                      
                      {course.materials.length > 0 ? (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {course.materials.map((material, index) => (
                            <div
                              key={index}
                              onClick={() => handleMaterialClick(material)}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {getMaterialIcon(material.type)}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {material.title}
                                  </p>
                                  {material.size && (
                                    <p className="text-xs text-gray-500">
                                      {formatFileSize(material.size)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {material.type === 'youtube' ? (
                                  <ExternalLink className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <Eye className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No materials uploaded yet</p>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        Added {new Date(course.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredCourses.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No courses available</h3>
                  <p className="text-gray-600">
                    {searchTerm 
                      ? 'No courses match your search criteria' 
                      : 'Your teachers haven\'t uploaded any course materials yet'
                    }
                  </p>
                </div>
              )}
            </main>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}