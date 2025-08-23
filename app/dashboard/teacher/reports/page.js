'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { 
  BarChart3, 
  Search, 
  FileText,
  Users,
  TrendingUp,
  Download,
  Eye,
  Calendar,
  Award,
  Target
} from 'lucide-react';

export default function TeacherReports() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/exams', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setExams(data);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExamSubmissions = async (examId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/exams/${examId}/submissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleViewReport = (exam) => {
    setSelectedExam(exam);
    fetchExamSubmissions(exam._id);
  };

  const calculateStats = () => {
    if (!submissions.length) return null;

    const scores = submissions.map(sub => sub.percentage || 0);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const passRate = scores.filter(score => score >= 60).length / scores.length * 100;

    return { average, highest, lowest, passRate, totalSubmissions: submissions.length };
  };

  const printReport = () => {
    if (!selectedExam || !submissions.length) return;

    const stats = calculateStats();
    const printContent = `
      <html>
        <head>
          <title>Exam Report - ${selectedExam.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
            .stat-card { border: 1px solid #ddd; padding: 15px; text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
            .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .grade-a { color: #22c55e; font-weight: bold; }
            .grade-b { color: #3b82f6; font-weight: bold; }
            .grade-c { color: #f59e0b; font-weight: bold; }
            .grade-f { color: #ef4444; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Exam Report</h1>
            <h2>${selectedExam.title}</h2>
            <p>Subject: ${selectedExam.subject} | Class: ${selectedExam.class}</p>
            <p>Date: ${new Date(selectedExam.startDate).toLocaleDateString()} | Total Marks: ${selectedExam.totalMarks}</p>
          </div>
          
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${stats.totalSubmissions}</div>
              <div class="stat-label">Total Submissions</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.average.toFixed(1)}%</div>
              <div class="stat-label">Average Score</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.highest.toFixed(1)}%</div>
              <div class="stat-label">Highest Score</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.passRate.toFixed(1)}%</div>
              <div class="stat-label">Pass Rate</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Student ID</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${submissions.map(submission => {
                const percentage = submission.percentage || 0;
                let grade = 'F';
                let gradeClass = 'grade-f';
                
                if (percentage >= 90) { grade = 'A'; gradeClass = 'grade-a'; }
                else if (percentage >= 80) { grade = 'B'; gradeClass = 'grade-b'; }
                else if (percentage >= 70) { grade = 'C'; gradeClass = 'grade-c'; }
                else if (percentage >= 60) { grade = 'D'; gradeClass = 'grade-c'; }

                return `
                  <tr>
                    <td>${submission.student.firstName} ${submission.student.lastName}</td>
                    <td>${submission.student.studentId || 'N/A'}</td>
                    <td>${submission.totalScore}/${selectedExam.totalMarks}</td>
                    <td>${percentage.toFixed(1)}%</td>
                    <td class="${gradeClass}">${grade}</td>
                    <td>${submission.status}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px;">
            Generated on ${new Date().toLocaleDateString()} | School Management System
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const filteredExams = exams.filter(exam =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.subject.toLowerCase().includes(searchTerm.toLowerCase())
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
              {!selectedExam ? (
                <>
                  {/* Header */}
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Reports</h1>
                    <p className="text-gray-600">View detailed reports and analytics for your exams</p>
                  </div>

                  {/* Search */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="relative">
                      <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Search exams..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  {/* Exams List */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">Your Exams</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {filteredExams.map((exam) => (
                        <div key={exam._id} className="p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-green-600" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                  <span>{exam.subject}</span>
                                  <span>•</span>
                                  <span>{exam.class}</span>
                                  <span>•</span>
                                  <span>{exam.questions.length} questions</span>
                                  <span>•</span>
                                  <span>{exam.totalMarks} marks</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-500">
                                    {new Date(exam.startDate).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleViewReport(exam)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View Report
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {filteredExams.length === 0 && (
                      <div className="text-center py-12">
                        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
                        <p className="text-gray-600">
                          {searchTerm ? 'Try adjusting your search criteria' : 'Create your first exam to see reports'}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Report View */
                <div>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <button
                        onClick={() => setSelectedExam(null)}
                        className="text-green-600 hover:text-green-700 mb-2"
                      >
                        ← Back to Exams
                      </button>
                      <h1 className="text-3xl font-bold text-gray-900">{selectedExam.title}</h1>
                      <p className="text-gray-600">{selectedExam.subject} • {selectedExam.class}</p>
                    </div>
                    <button
                      onClick={printReport}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Print Report
                    </button>
                  </div>

                  {submissions.length > 0 ? (
                    <>
                      {/* Statistics Cards */}
                      {(() => {
                        const stats = calculateStats();
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                  <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
                                  <p className="text-sm text-gray-600">Total Submissions</p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                  <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-2xl font-bold text-gray-900">{stats.average.toFixed(1)}%</p>
                                  <p className="text-sm text-gray-600">Average Score</p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                  <Award className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div>
                                  <p className="text-2xl font-bold text-gray-900">{stats.highest.toFixed(1)}%</p>
                                  <p className="text-sm text-gray-600">Highest Score</p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                  <Target className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                  <p className="text-2xl font-bold text-gray-900">{stats.passRate.toFixed(1)}%</p>
                                  <p className="text-sm text-gray-600">Pass Rate</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Submissions Table */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                          <h2 className="text-lg font-semibold text-gray-900">Student Results</h2>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Student
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Score
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Percentage
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Grade
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Submitted
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {submissions.map((submission) => {
                                const percentage = submission.percentage || 0;
                                let grade = 'F';
                                let gradeColor = 'text-red-600';
                                
                                if (percentage >= 90) { grade = 'A'; gradeColor = 'text-green-600'; }
                                else if (percentage >= 80) { grade = 'B'; gradeColor = 'text-blue-600'; }
                                else if (percentage >= 70) { grade = 'C'; gradeColor = 'text-yellow-600'; }
                                else if (percentage >= 60) { grade = 'D'; gradeColor = 'text-orange-600'; }

                                return (
                                  <tr key={submission._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div>
                                        <div className="text-sm font-medium text-gray-900">
                                          {submission.student.firstName} {submission.student.lastName}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          ID: {submission.student.studentId || 'N/A'}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {submission.totalScore}/{selectedExam.totalMarks}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {percentage.toFixed(1)}%
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`text-sm font-bold ${gradeColor}`}>
                                        {grade}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        submission.status === 'graded' 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {submission.status}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {new Date(submission.submittedAt).toLocaleDateString()}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                      <p className="text-gray-600">Students haven't taken this exam yet.</p>
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}