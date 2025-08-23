'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { 
  FileText, 
  ClipboardList, 
  BookOpen,
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Award,
  BarChart3,
  Target,
  Calendar
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Cell } from 'recharts';

export default function StudentDashboard() {
  const [stats, setStats] = useState({
    totalExamsTaken: 0,
    totalCoursesEnrolled: 0,
    totalAssignments: 0,
    avgScore: 0,
    studyTimeHours: 0,
    completionRate: 0
  });
  const [chartData, setChartData] = useState({
    examScores: [],
    subjectProgress: [],
    weeklyStudyTime: []
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
          totalExamsTaken: exams.length
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
          totalCoursesEnrolled: courses.length
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
        examScores: [
          { name: 'Math Quiz', score: 85, date: '2024-01-15' },
          { name: 'Science Test', score: 92, date: '2024-01-20' },
          { name: 'History Exam', score: 78, date: '2024-01-25' },
          { name: 'English Essay', score: 88, date: '2024-02-01' },
          { name: 'Physics Lab', score: 94, date: '2024-02-05' }
        ],
        subjectProgress: [
          { subject: 'Mathematics', progress: 85, color: '#3b82f6' },
          { subject: 'Science', progress: 92, color: '#10b981' },
          { subject: 'English', progress: 78, color: '#f59e0b' },
          { subject: 'History', progress: 88, color: '#ef4444' }
        ],
        weeklyStudyTime: [
          { week: 'Week 1', hours: 12 },
          { week: 'Week 2', hours: 15 },
          { week: 'Week 3', hours: 18 },
          { week: 'Week 4', hours: 14 },
          { week: 'Week 5', hours: 20 }
        ]
      });

      setStats(prev => ({
        ...prev,
        avgScore: 87.4,
        studyTimeHours: 79,
        completionRate: 94
      }));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Exams Taken',
      value: stats.totalExamsTaken,
      icon: FileText,
      color: 'bg-blue-500',
      change: '+2 this week',
      changeType: 'positive'
    },
    {
      title: 'Courses Enrolled',
      value: stats.totalCoursesEnrolled,
      icon: BookOpen,
      color: 'bg-green-500',
      change: 'All current',
      changeType: 'neutral'
    },
    {
      title: 'Assignments',
      value: stats.totalAssignments,
      icon: ClipboardList,
      color: 'bg-purple-500',
      change: '3 pending',
      changeType: 'neutral'
    },
    {
      title: 'Average Score',
      value: `${stats.avgScore}%`,
      icon: Award,
      color: 'bg-yellow-500',
      change: '+5.2% improvement',
      changeType: 'positive'
    },
    {
      title: 'Study Time',
      value: `${stats.studyTimeHours}h`,
      icon: Clock,
      color: 'bg-indigo-500',
      change: '+8h this week',
      changeType: 'positive'
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: Target,
      color: 'bg-pink-500',
      change: '+2% this month',
      changeType: 'positive'
    }
  ];

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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {user.firstName}!
                </h1>
                <p className="text-gray-600">
                  Track your academic progress and stay on top of your studies.
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
                          stat.changeType === 'positive' ? 'text-green-600' :
                          stat.changeType === 'negative' ? 'text-red-600' : 
                          'text-gray-500'
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
                {/* Exam Scores Trend */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <BarChart3 className="w-6 h-6 text-blue-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Exam Scores Trend</h2>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.examScores}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Subject Progress */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Target className="w-6 h-6 text-green-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Subject Progress</h2>
                  </div>
                  <div className="space-y-4">
                    {chartData.subjectProgress.map((subject, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{subject.subject}</span>
                          <span className="font-bold text-gray-900">{subject.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="h-3 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${subject.progress}%`,
                              backgroundColor: subject.color
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Weekly Study Time */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="w-6 h-6 text-purple-500" />
                  <h2 className="text-lg font-semibold text-gray-900">Weekly Study Time</h2>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData.weeklyStudyTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="hours" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </main>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}