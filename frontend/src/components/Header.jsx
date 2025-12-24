import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { LogOut, User, Menu } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (user?.role === 'doctor') return '/doctor/dashboard';
    if (user?.role === 'patient') return '/patient/dashboard';
    return '/';
  };

  return (
    <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={getDashboardPath()} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-800">BodyID</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {user && (
              <>
                <Link
                  to={getDashboardPath()}
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                {user.role === 'doctor' && (
                  <>
                    <Link
                      to="/doctor/dashboard"
                      className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                    >
                      Appointments
                    </Link>
                  </>
                )}
                {user.role === 'patient' && (
                  <>
                    <Link
                      to="/patient/doctors"
                      className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                    >
                      Find Doctors
                    </Link>
                    <Link
                      to="/patient/records"
                      className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                    >
                      Records
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>

          {/* User Menu */}
          {user && (
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && user && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-4">
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-600 hover:text-blue-600 font-medium"
              >
                Dashboard
              </Link>
              {user.role === 'doctor' && (
                <Link
                  to="/doctor/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-600 hover:text-blue-600 font-medium"
                >
                  Appointments
                </Link>
              )}
              {user.role === 'patient' && (
                <>
                  <Link
                    to="/patient/doctors"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-600 hover:text-blue-600 font-medium"
                  >
                    Find Doctors
                  </Link>
                  <Link
                    to="/patient/records"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-600 hover:text-blue-600 font-medium"
                  >
                    Records
                  </Link>
                </>
              )}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

