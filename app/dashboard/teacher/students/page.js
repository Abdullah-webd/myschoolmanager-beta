'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { 
  Users, 
  Plus, 
  Search, 
  UserMinus,
  User,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

export default function TeacherStudents() {
  const [myStudents, setMyStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch my students
      const myStudentsResponse = await fetch('http://localhost:3001/api/users/my-students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (myStudentsResponse.ok) {
        const myStudentsData = await myStudentsResponse.json();
        setMyStudents(myStudentsData);
      }

      // Fetch available students
      const availableResponse = await fetch('http://localhost:3001/api/users/available-students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (availableResponse.ok) {
        const availableData = await availableResponse.json();
        setAvailableStudents(availableData);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setMessage({ type: 'error', content: 'Failed to fetch students' });
    } finally {
      setIsLoading(false);
    }
  };

  const assignStudent = async (studentId) => {
    setIsAssigning(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/users/assign-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ studentId })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', content: 'Student added to your class successfully!' });
        setShowAddModal(false);
        fetchStudents();
      } else {
        setMessage({ type: 'error', content: data.message || 'Failed to assign student' });
      }
    } catch (error) {
      setMessage({ type: 'error', content: 'Network error. Please try again.' });
    } finally {
      setIsAssigning(false);
    }
  };

  const removeStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student from your class?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/users/remove-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ studentId })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', content: 'Student removed from your class successfully!' });
        fetchStudents();
      } else {
        setMessage({ type: 'error', content: data.message || 'Failed to remove student' });
      }
    } catch (error) {
      setMessage({ type: 'error', content: 'Network error. Please try again.' });
    }
  };

  const filteredMyStudents = myStudents.filter(student =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAvailableStudents = availableStudents.filter(student =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
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
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">My Students</h1>
                  <p className="text-gray-600">Manage students in your class</p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 sm:mt-0 inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Student
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
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Students Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMyStudents.map((student) => (
                  <div key={student._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {student.firstName} {student.lastName}
                          </h3>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            Student
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeStudent(student._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove from class"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{student.email}</span>
                      </div>
                      {student.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{student.phone}</span>
                        </div>
                      )}
                      {student.studentId && (
                        <div className="text-sm">
                          <span className="font-medium">Student ID:</span> {student.studentId}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredMyStudents.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No students in your class</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'No students match your search criteria' : 'Add students to start teaching'}
                  </p>
                </div>
              )}
            </main>
          </div>

          {/* Add Student Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Add Student to Class</h2>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Search available students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredAvailableStudents.map((student) => (
                      <div key={student._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </h3>
                            <p className="text-sm text-gray-500">{student.email}</p>
                            {student.studentId && (
                              <p className="text-xs text-gray-400">ID: {student.studentId}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => assignStudent(student._id)}
                          disabled={isAssigning}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isAssigning ? 'Adding...' : 'Add'}
                        </button>
                      </div>
                    ))}
                  </div>

                  {filteredAvailableStudents.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No available students</h3>
                      <p className="text-gray-600 text-sm">
                        {searchTerm 
                          ? 'No students match your search criteria' 
                          : 'All students are already assigned to classes'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </ProtectedRoute>
  );
}