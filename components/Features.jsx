import React from 'react';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  Shield,
  Clock,
  Award
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Users,
      title: "Admin Dashboard",
      description: "Complete school oversight with real-time analytics, student management, and comprehensive reporting tools.",
      color: "bg-blue-500"
    },
    {
      icon: BookOpen,
      title: "Student & Teacher Portals",
      description: "Dedicated dashboards for students and teachers with personalized content and easy navigation.",
      color: "bg-purple-500"
    },
    {
      icon: Clock,
      title: "Attendance Tracking",
      description: "Automated attendance system with real-time notifications and detailed attendance reports.",
      color: "bg-green-500"
    },
    {
      icon: Award,
      title: "Grade Management",
      description: "Streamlined grading system with gradebook, report cards, and parent communication tools.",
      color: "bg-yellow-500"
    },
    {
      icon: MessageSquare,
      title: "Communication Tools",
      description: "Built-in messaging, announcements, and notification system for seamless school communication.",
      color: "bg-red-500"
    },
    {
      icon: Calendar,
      title: "Timetable Management",
      description: "Intelligent scheduling system with conflict detection and automated timetable generation.",
      color: "bg-indigo-500"
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Comprehensive reporting suite with customizable dashboards and data visualization.",
      color: "bg-teal-500"
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      description: "Enterprise-grade security with role-based access control and data encryption.",
      color: "bg-orange-500"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything Your School Needs
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful features designed to streamline operations, enhance learning, 
            and improve communication across your entire school community.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-200 border border-gray-100"
            >
              <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;