// src/pages/Doctor/Dashboard.jsx
import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Loader,
  AlertCircle,
  Eye,
  FileText,
} from 'lucide-react';
import api from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

export default function DoctorDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const res = await api.get('/appointments');
        const appointmentsArray = res.data?.appointment || [];
        setAppointments(appointmentsArray);

        // Calculate stats
        setStats({
          total: appointmentsArray.length,
          pending: appointmentsArray.filter((a) => a.status === 'pending')
            .length,
          confirmed: appointmentsArray.filter((a) => a.status === 'confirmed')
            .length,
          completed: appointmentsArray.filter((a) => a.status === 'completed')
            .length,
          cancelled: appointmentsArray.filter((a) => a.status === 'cancelled')
            .length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleViewDetails = (appointmentId) => {
    navigate(`/doctor/appointment/${appointmentId}`);
  };

  const filteredAppointments = appointments
    .filter((a) => filter === 'all' || a.status === filter)
    .filter(
      (a) =>
        a.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.patientId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.symptoms?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      <div className="ml-64 pt-16">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome, Dr. {user?.name}
            </h1>
            <p className="text-gray-600 mt-1">
              Here's your appointments overview
            </p>
            {user?.averageRating !== undefined && (
              <div className="mt-4 inline-flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200 text-yellow-800">
                <span className="font-bold flex items-center gap-1">
                  ⭐ {user.averageRating.toFixed(1)}
                </span>
                <span className="text-sm opacity-80">
                  ({user.totalRatings} ratings)
                </span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {['total', 'pending', 'confirmed', 'completed', 'cancelled'].map(
              (key) => (
                <div
                  key={key}
                  className={`bg-white rounded-lg shadow p-6 border-l-4 ${key === 'total'
                      ? 'border-blue-500'
                      : key === 'pending'
                        ? 'border-yellow-500'
                        : key === 'confirmed'
                          ? 'border-blue-500'
                          : key === 'completed'
                            ? 'border-green-500'
                            : 'border-red-500'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </p>
                      <p className="text-2xl font-bold text-gray-800">
                        {stats[key]}
                      </p>
                    </div>
                    {key === 'total' && (
                      <Calendar className="w-8 h-8 text-blue-500" />
                    )}
                    {key === 'pending' && (
                      <Clock className="w-8 h-8 text-yellow-500" />
                    )}
                    {key === 'confirmed' && (
                      <CheckCircle className="w-8 h-8 text-blue-500" />
                    )}
                    {key === 'completed' && (
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    )}
                    {key === 'cancelled' && (
                      <XCircle className="w-8 h-8 text-red-500" />
                    )}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
            <input
              type="text"
              placeholder="Search by patient or symptoms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 flex-1"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Appointments */}
          <div className="space-y-4">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No appointments found</p>
              </div>
            ) : (
              filteredAppointments.map((a) => (
                <div
                  key={a._id}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {a.patientId?.name || 'Unknown Patient'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {a.patientId?.email || ''}
                          </p>
                        </div>
                        <span
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            a.status
                          )}`}
                        >
                          {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(a.scheduledAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(a.scheduledAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {a.symptoms && (
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                              {a.symptoms}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 lg:items-end">
                      <button
                        onClick={() => handleViewDetails(a._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      {a.status === 'completed' && a.prescriptionUrl && (
                        <a
                          href={a.prescriptionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                        >
                          <FileText className="w-4 h-4" />
                          View Prescription
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
