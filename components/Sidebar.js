"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  BookOpen, 
  FileText, 
  ClipboardList, 
  Award, 
  StickyNote, 
  Bot, 
  Bell, 
  Settings, 
  Users, 
  BarChart, 
  Printer, 
  MessageSquare,
  GraduationCap,
  User,
  LogOut,
  Menu,
  X
} from "lucide-react";


const Sidebar = ({ user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetchUnreadNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3001/api/notifications?unreadOnly=true",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.pagination.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const getMenuItems = () => {
    const roleSpecificItems = {
      admin: [
        { href: `/dashboard/${user.role}`, icon: Home, label: "Dashboard" },
        {
          href: `/dashboard/${user.role}/users`,
          icon: Users,
          label: "Manage Users",
        },
        {
          href: `/dashboard/${user.role}/bulk-messaging`,
          icon: MessageSquare,
          label: "Send Messages",
        },
        {
          href: `/dashboard/${user.role}/analytics`,
          icon: BarChart,
          label: "Analytics",
        },
        {
          href: `/dashboard/${user.role}/notifications`,
          icon: Bell,
          label: "Notifications",
          badge: unreadCount > 0 ? unreadCount : null,
        },
        {
          href: `/dashboard/${user.role}/settings`,
          icon: Settings,
          label: "Settings",
        },
      ],

      teacher: [
        { href: `/dashboard/${user.role}`, icon: Home, label: "Dashboard" },
        {
          href: `/dashboard/${user.role}/students`,
          icon: Users,
          label: "My Students",
        },
        {
          href: `/dashboard/${user.role}/courses`,
          icon: BookOpen,
          label: "Courses",
        },
        {
          href: `/dashboard/${user.role}/exams`,
          icon: FileText,
          label: "My Exams",
        },
        {
          href: `/dashboard/${user.role}/assignments`,
          icon: ClipboardList,
          label: "Assignments",
        },
        {
          href: `/dashboard/${user.role}/reports`,
          icon: BarChart,
          label: "Reports",
        },
        {
          href: `/dashboard/${user.role}/print-exams`,
          icon: Printer,
          label: "Print Exams",
        },
        {
          href: `/dashboard/${user.role}/notes`,
          icon: StickyNote,
          label: "Notes",
        },
        {
          href: `/dashboard/${user.role}/ai`,
          icon: Bot,
          label: "AI Assistant",
        },
        {
          href: `/dashboard/${user.role}/notifications`,
          icon: Bell,
          label: "Notifications",
          badge: unreadCount > 0 ? unreadCount : null,
        },
        {
          href: `/dashboard/${user.role}/settings`,
          icon: Settings,
          label: "Settings",
        },
      ],
      student: [
        { href: `/dashboard/${user.role}`, icon: Home, label: "Dashboard" },
        {
          href: `/dashboard/${user.role}/courses`,
          icon: BookOpen,
          label: "Courses",
        },
        {
          href: `/dashboard/${user.role}/exams`,
          icon: FileText,
          label: "My Exams",
        },
        {
          href: `/dashboard/${user.role}/assignments`,
          icon: ClipboardList,
          label: "Assignments",
        },
        {
          href: `/dashboard/${user.role}/grades`,
          icon: Award,
          label: "Grades",
        },
        {
          href: `/dashboard/${user.role}/notes`,
          icon: StickyNote,
          label: "Notes",
        },
        {
          href: `/dashboard/${user.role}/ai`,
          icon: Bot,
          label: "AI Assistant",
        },
        {
          href: `/dashboard/${user.role}/notifications`,
          icon: Bell,
          label: "Notifications",
          badge: unreadCount > 0 ? unreadCount : null,
        },
        {
          href: `/dashboard/${user.role}/settings`,
          icon: Settings,
          label: "Settings",
        },
      ],
    };

    return [...roleSpecificItems[user.role]];
  };

  const menuItems = getMenuItems();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const getRoleColor = () => {
    const colors = {
      admin: "bg-red-600",
      teacher: "bg-green-600",
      student: "bg-blue-600",
    };
    return colors[user.role] || "bg-gray-600";
  };

  const sidebarContent = (
    <>
      {/* Logo and Brand */}
      <div className="flex items-center gap-3 p-6 border-b border-gray-200">
        <div
          className={`w-10 h-10 ${getRoleColor()} rounded-lg flex items-center justify-center`}
        >
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">MySchoolManager</h1>
          <p className="text-xs text-gray-500 capitalize">
            {user.role} Dashboard
          </p>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 ${getRoleColor()} rounded-full flex items-center justify-center`}
          >
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
            {user.role === "student" && user.class && (
              <p className="text-xs text-gray-500">Class: {user.class}</p>
            )}
            {user.role === "teacher" && user.subject && (
              <p className="text-xs text-gray-500">{user.subject}</p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? `${getRoleColor()} text-white`
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        <Menu className="w-6 h-6 text-gray-600" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-80 bg-white shadow-xl">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-80 lg:bg-white lg:border-r lg:border-gray-200">
        {sidebarContent}
      </div>
    </>
  );
};

export default Sidebar;
