import { GraduationCap, Play, ArrowRight } from 'lucide-react';

function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAtMjBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAtMjBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] repeat"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="space-y-8">
            <div className="flex items-center space-x-2 text-blue-200">
              <GraduationCap className="w-6 h-6" />
              <span className="text-sm font-medium">Trusted by 500+ Schools</span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Transform How Your
                <span className="block text-yellow-300">School Operates</span>
              </h1>
              
              <p className="text-lg md:text-xl text-blue-100 max-w-xl">
                MySchoolManager is the all-in-one platform that streamlines school operations, 
                empowers teachers, and engages students through intuitive dashboards and powerful tools.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold px-8 py-4 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2">
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button className="border-2 border-white hover:bg-white hover:text-blue-900 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-8 text-sm text-blue-200">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>No Setup Fee</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>30-Day Free Trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="relative">
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-1 transition-transform duration-300">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-4">Admin Dashboard</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Students</span>
                    <span className="font-bold">1,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Teachers</span>
                    <span className="font-bold">78</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Attendance Today</span>
                    <span className="font-bold">94.2%</span>
                  </div>
                  <div className="mt-4 bg-white/20 rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{width: '94.2%'}}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute -top-4 -right-4 bg-yellow-400 text-blue-900 px-4 py-2 rounded-full text-sm font-semibold transform rotate-12">
              Real-time Data
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero