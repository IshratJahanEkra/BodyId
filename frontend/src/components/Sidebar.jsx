import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
  Settings,
  LogOut,
  User,
  Stethoscope,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + '/')
    );
  };

  if (!user) return null;

  const doctorMenuItems = [
    {
      path: '/doctor/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
  ];

  const patientMenuItems = [
    {
      path: '/patient/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      path: '/patient/doctors',
      label: 'Find Doctors',
      icon: Users,
    },
    {
      path: '/patient/records',
      label: 'Medical Records',
      icon: FileText,
    },
    {
      path: '/patient/ai-doctor',
      label: 'AI Doctor',
      icon: Stethoscope,
    },
  ];

  const menuItems = user.role === 'doctor' ? doctorMenuItems : patientMenuItems;

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 min-h-screen fixed left-0 top-0 pt-16">
      <div className="flex flex-col h-full">
        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Settings & Logout */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 w-full transition-colors">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
