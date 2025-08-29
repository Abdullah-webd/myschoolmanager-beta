import { Monitor, Smartphone, Tablet } from 'lucide-react';
import React from 'react';
const ProductShowcase = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            See MySchoolManager in Action
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Intuitive interfaces designed for administrators, teachers, and students. 
            Experience the power of unified school management.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Admin Dashboard */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
            <div className="flex items-center mb-6">
              <div className="bg-blue-500 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                <Monitor className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Admin Dashboard</h3>
                <p className="text-sm text-gray-600">Complete school oversight</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700">School Overview</span>
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Live</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Students</span>
                  <span className="font-semibold">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Teachers</span>
                  <span className="font-semibold">78</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Attendance Rate</span>
                  <span className="font-semibold text-green-600">94.2%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Teacher Panel */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
            <div className="flex items-center mb-6">
              <div className="bg-purple-500 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                <Tablet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Teacher Portal</h3>
                <p className="text-sm text-gray-600">Classroom management tools</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700">Today's Classes</span>
                <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">5 of 6</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Math - Grade 10A</span>
                  <span className="text-green-600 font-medium">✓ Done</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Science - Grade 9B</span>
                  <span className="text-blue-600 font-medium">→ Next</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">History - Grade 11</span>
                  <span className="text-gray-400">14:30</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Student View */}
          <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 border border-green-100">
            <div className="flex items-center mb-6">
              <div className="bg-green-500 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Student Portal</h3>
                <p className="text-sm text-gray-600">Personalized learning hub</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700">My Grades</span>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">A- Avg</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mathematics</span>
                  <span className="font-semibold text-green-600">A</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Science</span>
                  <span className="font-semibold text-blue-600">B+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">History</span>
                  <span className="font-semibold text-green-600">A-</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200">
            Try Interactive Demo
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;