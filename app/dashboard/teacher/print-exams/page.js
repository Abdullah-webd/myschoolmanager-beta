'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import RichTextEditor from '@/components/RichTextEditor';
import { 
  FileText, 
  Search, 
  Edit, 
  Printer, 
  Save,
  Eye,
  X,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

export default function PrintExams() {
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState(null);
  const [editableContent, setEditableContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

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

  const generatePrintContent = (exam) => {
    let content = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px; color: #333;">${exam.title}</h1>
          <p style="margin: 10px 0; color: #666;">Subject: ${exam.subject} | Class: ${exam.class}</p>
          <p style="margin: 5px 0; color: #666;">Duration: ${exam.duration} minutes | Total Marks: ${exam.totalMarks}</p>
          <p style="margin: 5px 0; color: #666;">Date: ${new Date(exam.startDate).toLocaleDateString()}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; margin-bottom: 10px;">Instructions:</h3>
          <p style="color: #666; line-height: 1.6;">${exam.instructions}</p>
        </div>
    `;

    exam.questions.forEach((question, index) => {
      content += `
        <div style="margin-bottom: 25px; page-break-inside: avoid;">
          <div style="margin-bottom: 15px;">
            <strong style="color: #333;">Question ${index + 1}:</strong> (${question.points} mark${question.points > 1 ? 's' : ''})
          </div>
          <div style="margin-bottom: 15px; line-height: 1.6;">
            ${question.question}
          </div>
      `;

      if (question.type === 'multiple-choice' && question.options) {
        content += `<div style="margin-left: 20px;">`;
        question.options.forEach((option, optIndex) => {
          const letter = String.fromCharCode(65 + optIndex);
          const isCorrect = option === question.correctAnswer;
          content += `
            <div style="margin-bottom: 8px;">
              <strong>${letter})</strong> ${option} ${isCorrect ? '<span style="color: #22c55e; font-weight: bold;">(Correct Answer)</span>' : ''}
            </div>
          `;
        });
        content += `</div>`;
      } else {
        content += `
          <div style="margin-top: 15px; border: 1px solid #ddd; min-height: 100px; padding: 10px;">
            <em style="color: #999;">Answer space for written response</em>
          </div>
        `;
      }

      content += `</div>`;
    });

    content += `
        <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px;">
          Generated on ${new Date().toLocaleDateString()} | School Management System
        </div>
      </div>
    `;

    return content;
  };

  const handleExamClick = (exam) => {
    setSelectedExam(exam);
    const content = generatePrintContent(exam);
    setEditableContent(content);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!selectedExam) return;

    setIsSaving(true);
    try {
      // Here you would typically save the edited content to the backend
      // For now, we'll just show a success message
      setMessage({ type: 'success', content: 'Exam content saved successfully!' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', content: 'Failed to save exam content' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Exam - ${selectedExam?.title}</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
            @page { margin: 1in; }
          </style>
        </head>
        <body>
          ${editableContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const filteredExams = exams.filter(exam =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.class.toLowerCase().includes(searchTerm.toLowerCase())
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
            {!selectedExam ? (
              <main className="flex-1 p-6 lg:p-8">
                {/* Header */}
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Print Exams</h1>
                  <p className="text-gray-600">Select an exam to view and print in document format</p>
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
                      <div
                        key={exam._id}
                        onClick={() => handleExamClick(exam)}
                        className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <FileText className="w-6 h-6 text-green-600" />
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
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">
                                  {exam.duration} minutes
                                </span>
                                <span className="text-sm text-gray-500">
                                  • Created {new Date(exam.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredExams.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
                      <p className="text-gray-600">
                        {searchTerm ? 'Try adjusting your search criteria' : 'Create your first exam to get started'}
                      </p>
                    </div>
                  )}
                </div>
              </main>
            ) : (
              /* Print View */
              <div className="flex-1 flex flex-col">
                {/* Print Header */}
                <div className="bg-white border-b border-gray-200 p-4 no-print">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setSelectedExam(null)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <X className="w-6 h-6" />
                      </button>
                      <h1 className="text-xl font-semibold text-gray-900">
                        {selectedExam.title}
                      </h1>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          isEditing 
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        <Edit className="w-4 h-4" />
                        {isEditing ? 'View Mode' : 'Edit Mode'}
                      </button>
                      {isEditing && (
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>
                      )}
                      <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                        Print
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-8 bg-white overflow-auto">
                  {isEditing ? (
                    <RichTextEditor
                      value={editableContent}
                      onChange={setEditableContent}
                      className="min-h-[600px]"
                      placeholder="Edit your exam content..."
                    />
                  ) : (
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: editableContent }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}