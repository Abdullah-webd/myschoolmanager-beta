'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  GraduationCap, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X,
  Home,
  Users,
  BookOpen,
  FileText,
  MessageSquare,
  Settings,
  Brain,
  StickyNote,
  Calendar,
  BarChart
} from 'lucide-react';

const navigationConfig = {
  admin: [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Bulk Messaging', href: '/admin/bulk-messaging', icon: MessageSquare },
    { name: 'Exams', href: '/admin/exams', icon: BookOpen },
    { name: 'Assignments', href: '/admin/assignments', icon: FileText },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ],
  teacher: [
    { name: 'Dashboard', href: '/teacher/dashboard', icon: Home },
    { name: 'My Students', href: '/teacher/students', icon: Users },
    { name: 'Exams', href: '/teacher/exams', icon: BookOpen },
    { name: 'Assignments', href: '/teacher/assignments', icon: FileText },
    { name: 'Courses', href: '/teacher/courses', icon: BookOpen },
    { name: 'AI Assistant', href: '/teacher/ai', icon: Brain },
    { name: 'Notes', href: '/teacher/notes', icon: StickyNote },
    { name: 'Notifications', href: '/teacher/notifications', icon: Bell },
  ],
  student: [
    { name: 'Dashboard', href: '/student/dashboard', icon: Home },
    { name: 'Exams', href: '/student/exams', icon: BookOpen },
    { name: 'Assignments', href: '/student/assignments', icon: FileText },
    { name: 'Courses', href: '/student/courses', icon: BookOpen },
    { name: 'AI Assistant', href: '/student/ai', icon: Brain },
    { name: 'Notes', href: '/student/notes', icon: StickyNote },
    { name: 'Notifications', href: '/student/notifications', icon: Bell },
  ]
};

const roleColors = {
  admin: 'from-red-500 to-pink-600',
  teacher: 'from-blue-500 to-indigo-600',
  student: 'from-green-500 to-teal-600'
};

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchNotifications();
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notifications/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const navigation = navigationConfig[user.role] || [];
  const roleColor = roleColors[user.role];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className={`bg-gradient-to-r ${roleColor} p-2 rounded-lg`}>
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">EduPortal</h2>
                <p className="text-xs text-gray-500 capitalize">{user.role} Portal</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="mt-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? `bg-gradient-to-r ${roleColor} text-white`
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                  {item.name === 'Notifications' && unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white shadow-lg">
          <div className="flex items-center px-6 py-6 border-b">
            <div className={`bg-gradient-to-r ${roleColor} p-2 rounded-lg mr-3`}>
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">EduPortal</h2>
              <p className="text-sm text-gray-500 capitalize">{user.role} Portal</p>
            </div>
          </div>
          <nav className="mt-6 flex-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? `bg-gradient-to-r ${roleColor} text-white shadow-md`
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                  {item.name === 'Notifications' && unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`bg-gradient-to-r ${roleColor} p-2 rounded-full`}>
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white shadow-sm border-b">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className={`bg-gradient-to-r ${roleColor} p-2 rounded-lg`}>
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">EduPortal</h2>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}