'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { 
  Users, 
  FileText, 
  ClipboardList, 
  BookOpen,
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  BarChart3,
  PieChart,
  Pie,
  Award
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Cell } from 'recharts';

export default function TeacherDashboard() {
  const [stats, setStats] = useState({
    totalExams: 0,
    totalStudents: 0,
    totalCourses: 0,
    totalAssignments: 0,
    avgExamScore: 0,
    studyTimeHours: 0
  });
  const [chartData, setChartData] = useState({
    examPerformance: [],
    subjectDistribution: [],
    monthlyActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch exams
      const examsResponse = await fetch('http://localhost:3001/api/exams', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (examsResponse.ok) {
        const exams = await examsResponse.json();
        setStats(prev => ({
          ...prev,
          totalExams: exams.length
        }));
      }

      // Fetch students
      const studentsResponse = await fetch('http://localhost:3001/api/users/my-students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (studentsResponse.ok) {
        const students = await studentsResponse.json();
        setStats(prev => ({
          ...prev,
          totalStudents: students.length
        }));
      }

      // Fetch courses
      const coursesResponse = await fetch('http://localhost:3001/api/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (coursesResponse.ok) {
        const courses = await coursesResponse.json();
        setStats(prev => ({
          ...prev,
          totalCourses: courses.length
        }));
      }

      // Fetch assignments
      const assignmentsResponse = await fetch('http://localhost:3001/api/assignments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (assignmentsResponse.ok) {
        const assignments = await assignmentsResponse.json();
        setStats(prev => ({
          ...prev,
          totalAssignments: assignments.length
        }));
      }

      // Mock chart data (in real app, this would come from analytics API)
      setChartData({
        examPerformance: [
          { name: 'Math Quiz 1', average: 85, students: 25 },
          { name: 'Science Test', average: 78, students: 23 },
          { name: 'History Exam', average: 92, students: 24 },
          { name: 'English Essay', average: 88, students: 22 },
          { name: 'Physics Lab', average: 76, students: 20 }
        ],
        subjectDistribution: [
          { name: 'Mathematics', value: 35, color: '#3b82f6' },
          { name: 'Science', value: 25, color: '#10b981' },
          { name: 'English', value: 20, color: '#f59e0b' },
          { name: 'History', value: 20, color: '#ef4444' }
        ],
        monthlyActivity: [
          { month: 'Jan', exams: 4, assignments: 8 },
          { month: 'Feb', exams: 6, assignments: 12 },
          { month: 'Mar', exams: 8, assignments: 15 },
          { month: 'Apr', exams: 5, assignments: 10 },
          { month: 'May', exams: 7, assignments: 14 }
        ]
      });

      setStats(prev => ({
        ...prev,
        avgExamScore: 84.5,
        studyTimeHours: 156
      }));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-blue-500',
      change: '+3 this month',
      changeType: 'positive'
    },
    {
      title: 'Exams Created',
      value: stats.totalExams,
      icon: FileText,
      color: 'bg-green-500',
      change: '+2 this week',
      changeType: 'positive'
    },
    {
      title: 'Assignments',
      value: stats.totalAssignments,
      icon: ClipboardList,
      color: 'bg-purple-500',
      change: '+5 this month',
      changeType: 'positive'
    },
    {
      title: 'Courses',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'bg-orange-500',
      change: '+1 this month',
      changeType: 'positive'
    },
    {
      title: 'Avg Exam Score',
      value: `${stats.avgExamScore}%`,
      icon: Award,
      color: 'bg-indigo-500',
      change: '+2.3% improvement',
      changeType: 'positive'
    },
    {
      title: 'Study Time',
      value: `${stats.studyTimeHours}h`,
      icon: Clock,
      color: 'bg-pink-500',
      change: '+12h this week',
      changeType: 'positive'
    }
  ];

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
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {user.firstName}!
                </h1>
                <p className="text-gray-600">
                  Here's an overview of your teaching activities and student performance.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {statCards.map((stat, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                        <p className={`text-sm mt-1 ${
                          stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change}
                        </p>
                      </div>
                      <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Exam Performance Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <BarChart3 className="w-6 h-6 text-green-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Exam Performance</h2>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.examPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="average" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Subject Distribution */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <PieChart className="w-6 h-6 text-blue-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Subject Distribution</h2>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <PieChart
                        data={chartData.subjectDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                      >
                        {chartData.subjectDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </PieChart>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {chartData.subjectDistribution.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm text-gray-600">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Monthly Activity Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                  <h2 className="text-lg font-semibold text-gray-900">Monthly Activity</h2>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.monthlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="exams" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="assignments" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Exams</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Assignments</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <a
                  href="/dashboard/teacher/exams"
                  className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Create Exam</h3>
                      <p className="text-gray-600 text-sm">Design new exams for your students</p>
                    </div>
                  </div>
                </a>

                <a
                  href="/dashboard/teacher/assignments"
                  className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                      <ClipboardList className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">New Assignment</h3>
                      <p className="text-gray-600 text-sm">Create assignments for your class</p>
                    </div>
                  </div>
                </a>

                <a
                  href="/dashboard/teacher/students"
                  className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Manage Students</h3>
                      <p className="text-gray-600 text-sm">Add or remove students from your class</p>
                    </div>
                  </div>
                </a>
              </div>
            </main>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}