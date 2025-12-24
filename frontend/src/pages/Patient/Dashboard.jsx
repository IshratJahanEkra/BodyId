// src/pages/Patient/Dashboard.jsx
import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  DollarSign,
  Search,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  Eye,
  FileText,
  Video,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Activity,
  Bell,
  Plus,
  Filter,
  ArrowRight,
  FileCheck,
  Heart,
  Stethoscope,
  X,
  Sparkles,
} from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import RatingModal from '../../components/RatingModal';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalSpent: 0,
    pendingPayments: 0,
    totalRecords: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedAppointmentForRating, setSelectedAppointmentForRating] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('Fetching dashboard data...');
        const [appointmentsRes, statsRes] = await Promise.all([
          api.get('/appointments').catch((err) => {
            console.error('Error fetching appointments:', err);
            return { data: [] };
          }),
          api.get('/patient/stats').catch(() => {
            console.log(
              'Stats endpoint not available, will calculate from appointments'
            );
            return { data: null };
          }),
        ]);

        console.log('Appointments response:', appointmentsRes.data);
        // Backend returns: { message: "...", appointment: [...] }
        const appointmentsData =
          appointmentsRes.data?.appointment ||
          appointmentsRes.data?.appointments ||
          appointmentsRes.data ||
          [];
        setAppointments(
          Array.isArray(appointmentsData) ? appointmentsData : []
        );

        // Calculate stats if not provided
        if (statsRes.data) {
          setStats(statsRes.data);
        } else {
          const calculatedStats = {
            totalAppointments: appointmentsData.length,
            upcomingAppointments: appointmentsData.filter((a) => {
              const appointmentDate = a.scheduledAt
                ? new Date(a.scheduledAt)
                : a.date
                  ? new Date(a.date)
                  : null;
              return (
                appointmentDate &&
                (a.status === 'pending' || a.status === 'confirmed') &&
                appointmentDate >= new Date()
              );
            }).length,
            completedAppointments: appointmentsData.filter(
              (a) => a.status === 'completed'
            ).length,
            cancelledAppointments: appointmentsData.filter(
              (a) => a.status === 'cancelled'
            ).length,
            totalSpent: appointmentsData
              .filter(
                (a) => a.status === 'completed' || a.status === 'confirmed'
              )
              .reduce(
                (sum, a) => sum + parseFloat(a.payment?.amount || a.fee || 0),
                0
              ),
            pendingPayments: appointmentsData.filter(
              (a) => a.status === 'pending'
            ).length,
            totalRecords: 0, // Will be fetched separately if needed
          };
          setStats(calculatedStats);
        }

        // Get upcoming appointments (next 3)
        // Backend uses scheduledAt (ISO string), but may also have date/time separately
        const upcoming = appointmentsData
          .filter((a) => {
            const appointmentDate = a.scheduledAt
              ? new Date(a.scheduledAt)
              : a.date
                ? new Date(a.date)
                : null;
            return (
              appointmentDate &&
              (a.status === 'pending' || a.status === 'confirmed') &&
              appointmentDate >= new Date()
            );
          })
          .sort((a, b) => {
            const dateA = a.scheduledAt
              ? new Date(a.scheduledAt)
              : a.date
                ? new Date(a.date)
                : new Date(0);
            const dateB = b.scheduledAt
              ? new Date(b.scheduledAt)
              : b.date
                ? new Date(b.date)
                : new Date(0);
            return dateA - dateB;
          })
          .slice(0, 3);
        setUpcomingAppointments(upcoming);

        // Recent activity (last 5 appointments)
        const recent = appointmentsData
          .sort((a, b) => {
            const dateA = a.scheduledAt
              ? new Date(a.scheduledAt)
              : a.date
                ? new Date(a.date)
                : new Date(0);
            const dateB = b.scheduledAt
              ? new Date(b.scheduledAt)
              : b.date
                ? new Date(b.date)
                : new Date(0);
            return dateB - dateA;
          })
          .slice(0, 5);
        setRecentActivity(recent);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Failed to load dashboard data';
        toast.error(errorMessage);
        // Set empty arrays to prevent crashes
        setAppointments([]);
        setUpcomingAppointments([]);
        setRecentActivity([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      confirmed: <CheckCircle className="w-4 h-4" />,
      completed: <CheckCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />,
    };
    return icons[status];
  };

  const filteredAppointments = appointments
    .filter((a) => filter === 'all' || a.status === filter)
    .filter((a) => {
      const doctorName =
        typeof a.doctorId === 'object' ? a.doctorId.name : a.doctorId || '';
      const specialization =
        typeof a.doctorId === 'object' ? a.doctorId.specialization || '' : '';
      return (
        doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.symptoms?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = a.scheduledAt
          ? new Date(a.scheduledAt)
          : a.date
            ? new Date(a.date)
            : new Date(0);
        const dateB = b.scheduledAt
          ? new Date(b.scheduledAt)
          : b.date
            ? new Date(b.date)
            : new Date(0);
        return dateB - dateA;
      } else if (sortBy === 'status') {
        return (a.status || '').localeCompare(b.status || '');
      } else if (sortBy === 'doctor') {
        const nameA =
          typeof a.doctorId === 'object' ? a.doctorId.name : a.doctorId || '';
        const nameB =
          typeof b.doctorId === 'object' ? b.doctorId.name : b.doctorId || '';
        return nameA.localeCompare(nameB);
      }
      return 0;
    });

  const exportAppointments = () => {
    const csv = [
      [
        'Date',
        'Time',
        'Doctor',
        'Specialization',
        'Status',
        'Fee',
        'Symptoms',
        'Type',
      ].join(','),
      ...filteredAppointments.map((a) => {
        // Handle both scheduledAt (ISO) and separate date/time
        let dateStr = '';
        let timeStr = '';
        if (a.scheduledAt) {
          const date = new Date(a.scheduledAt);
          dateStr = date.toLocaleDateString();
          timeStr = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          });
        } else {
          dateStr = a.date ? new Date(a.date).toLocaleDateString() : '';
          timeStr = a.time || '';
        }
        return [
          dateStr,
          timeStr,
          typeof a.doctorId === 'object'
            ? a.doctorId.name
            : a.doctorId || 'N/A',
          typeof a.doctorId === 'object' ? a.doctorId.specialization || '' : '',
          a.status || 'pending',
          a.fee || 0,
          `"${a.symptoms || ''}"`,
          a.type || 'In-person',
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appointments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePayment = (appointmentId) => {
    navigate(`/patient/payment/${appointmentId}`);
  };

  const handleJoinCall = (appointmentId) => {
    // In a real app, this would initiate a video call
    console.log(`Joining video call for appointment ${appointmentId}`);
    // navigate(`/patient/video-call/${appointmentId}`);
  };

  const handleCancel = async (appointmentId) => {
    const confirmed = await new Promise((resolve) => {
      toast(
        (t) => (
          <div className="flex flex-col gap-3">
            <p className="font-semibold">Cancel Appointment?</p>
            <p className="text-sm text-gray-600">
              Are you sure you want to cancel this appointment?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(false);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
              >
                No
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(true);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity,
        }
      );
    });

    if (!confirmed) return;

    try {
      await api.put(`/appointments/${appointmentId}`, { status: 'cancelled' });
      setAppointments((prev) =>
        prev.map((a) =>
          a._id === appointmentId ? { ...a, status: 'cancelled' } : a
        )
      );
      toast.success('Appointment cancelled successfully');
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to cancel appointment'
      );
    }
  };

  const handleViewDetails = (appointmentId) => {
    const appointment = appointments.find((a) => a._id === appointmentId);
    if (appointment) {
      const doctorName =
        typeof appointment.doctorId === 'object'
          ? appointment.doctorId.name
          : appointment.doctorId || 'Unknown Doctor';

      // Handle both scheduledAt and separate date/time
      let dateStr = '';
      let timeStr = '';
      if (appointment.scheduledAt) {
        const date = new Date(appointment.scheduledAt);
        dateStr = date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        timeStr = date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
      } else {
        dateStr = appointment.date
          ? new Date(appointment.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
          : 'N/A';
        timeStr = appointment.time || 'N/A';
      }

      toast(
        (t) => (
          <div className="flex flex-col gap-3 max-w-md">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-lg">Appointment Details</p>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Doctor:</strong> {doctorName}
              </p>
              <p>
                <strong>Date:</strong> {dateStr}
              </p>
              <p>
                <strong>Time:</strong> {timeStr}
              </p>
              <p>
                <strong>Status:</strong> {appointment.status || 'pending'}
              </p>
              <p>
                <strong>Fee:</strong> $
                {appointment.payment?.amount || appointment.fee || 0}
              </p>
              {appointment.symptoms && (
                <p>
                  <strong>Symptoms:</strong> {appointment.symptoms}
                </p>
              )}
              {appointment.type && (
                <p>
                  <strong>Type:</strong> {appointment.type}
                </p>
              )}
            </div>
          </div>
        ),
        {
          duration: 10000,
        }
      );
    }
  };

  const handleViewPrescription = (appointment) => {
    if (appointment.prescriptionUrl) {
      window.open(appointment.prescriptionUrl, '_blank');
      toast.success('Opening prescription...');
    } else if (appointment.prescription?.url) {
      window.open(appointment.prescription.url, '_blank');
      toast.success('Opening prescription...');
    } else if (appointment.prescription) {
      window.open(appointment.prescription, '_blank');
      toast.success('Opening prescription...');
    } else {
      toast.error('Prescription not available');
    }
  };

  const handleBookFollowUp = (appointment) => {
    const doctorId =
      typeof appointment.doctorId === 'object'
        ? appointment.doctorId._id
        : appointment.doctorId;
    if (doctorId) {
      navigate(`/patient/appointment/create/${doctorId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Sidebar />
        <div className="ml-64 pt-16 flex items-center justify-center min-h-screen">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      <div className="ml-64 pt-16">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    Welcome back, {user?.name || 'Patient'}!
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Here's your health dashboard overview
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate('/patient/ai-doctor')}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition shadow-lg"
                  >
                    <Sparkles className="w-5 h-5" />
                    AI Doctor
                  </button>
                  <button
                    onClick={() => navigate('/patient/doctors')}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    Book Appointment
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">
                      Total Appointments
                    </p>
                    <p className="text-3xl font-bold mt-1">
                      {stats.totalAppointments}
                    </p>
                    <p className="text-blue-100 text-xs mt-2">All time</p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                    <Calendar className="w-7 h-7" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">
                      Upcoming
                    </p>
                    <p className="text-3xl font-bold mt-1">
                      {stats.upcomingAppointments}
                    </p>
                    <p className="text-yellow-100 text-xs mt-2">Scheduled</p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                    <Clock className="w-7 h-7" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">
                      Completed
                    </p>
                    <p className="text-3xl font-bold mt-1">
                      {stats.completedAppointments}
                    </p>
                    <p className="text-green-100 text-xs mt-2">Visits</p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">
                      Total Spent
                    </p>
                    <p className="text-3xl font-bold mt-1">
                      ${stats.totalSpent.toFixed(2)}
                    </p>
                    <p className="text-purple-100 text-xs mt-2">
                      On consultations
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                    <DollarSign className="w-7 h-7" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Pending Payments</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {stats.pendingPayments}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Medical Records</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {stats.totalRecords}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-indigo-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-teal-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Cancelled</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {stats.cancelledAppointments}
                    </p>
                  </div>
                  <XCircle className="w-8 h-8 text-teal-500" />
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Upcoming Appointments */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      Upcoming
                    </h2>
                    <button
                      onClick={() => setFilter('all')}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      View All
                    </button>
                  </div>
                  {upcomingAppointments.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">
                        No upcoming appointments
                      </p>
                      <button
                        onClick={() => navigate('/patient/doctors')}
                        className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Book Now
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingAppointments.map((a) => (
                        <div
                          key={a._id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                          onClick={() => handleViewDetails(a._id)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800 text-sm">
                                {typeof a.doctorId === 'object'
                                  ? a.doctorId.name
                                  : a.doctorId || 'Unknown Doctor'}
                              </p>
                              {typeof a.doctorId === 'object' && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {a.doctorId.specialization}
                                </p>
                              )}
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                a.status
                              )}`}
                            >
                              {a.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {a.scheduledAt
                                ? new Date(a.scheduledAt).toLocaleDateString(
                                  'en-US',
                                  {
                                    month: 'short',
                                    day: 'numeric',
                                  }
                                )
                                : a.date
                                  ? new Date(a.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                  })
                                  : 'N/A'}
                            </span>
                            <Clock className="w-3 h-3 ml-2" />
                            <span>
                              {a.scheduledAt
                                ? new Date(a.scheduledAt).toLocaleTimeString(
                                  'en-US',
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )
                                : a.time || 'N/A'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-600" />
                      Recent Activity
                    </h2>
                  </div>
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">
                        No recent activity
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentActivity.map((a) => (
                        <div
                          key={a._id}
                          className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${a.status === 'completed'
                              ? 'bg-green-100'
                              : a.status === 'confirmed'
                                ? 'bg-blue-100'
                                : a.status === 'pending'
                                  ? 'bg-yellow-100'
                                  : 'bg-red-100'
                              }`}
                          >
                            {getStatusIcon(a.status)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 text-sm">
                              {typeof a.doctorId === 'object'
                                ? a.doctorId.name
                                : a.doctorId || 'Unknown Doctor'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {a.scheduledAt
                                ? new Date(a.scheduledAt).toLocaleDateString() +
                                ' at ' +
                                new Date(a.scheduledAt).toLocaleTimeString(
                                  'en-US',
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )
                                : a.date
                                  ? new Date(a.date).toLocaleDateString() +
                                  (a.time ? ' at ' + a.time : '')
                                  : 'N/A'}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              a.status
                            )}`}
                          >
                            {a.status}
                          </span>
                          {
                            (a.status === 'completed' || a.status === 'confirmed') && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAppointmentForRating(a);
                                  setShowRatingModal(true);
                                }}
                                className="ml-2 px-3 py-1 text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-md font-medium transition"
                              >
                                Rate
                              </button>
                            )
                          }
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* All Appointments Section */}
            <div className="bg-white rounded-lg shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-blue-600" />
                    All Appointments
                  </h2>

                  <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search appointments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="date">Sort by Date</option>
                      <option value="status">Sort by Status</option>
                      <option value="doctor">Sort by Doctor</option>
                    </select>

                    <button
                      onClick={exportAppointments}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No appointments found</p>
                    <button
                      onClick={() => navigate('/patient/doctors')}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Book your first appointment
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAppointments.map((a) => (
                      <div
                        key={a._id}
                        className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                  <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-800 text-lg">
                                    {typeof a.doctorId === 'object'
                                      ? a.doctorId.name
                                      : a.doctorId || 'Unknown Doctor'}
                                  </h3>
                                  {typeof a.doctorId === 'object' && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <p className="text-sm text-gray-500">
                                        {a.doctorId.specialization}
                                      </p>
                                      {a.doctorId.location && (
                                        <>
                                          <span className="text-gray-300">
                                            •
                                          </span>
                                          <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <MapPin className="w-3 h-3" />
                                            {a.doctorId.location}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <span
                                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                  a.status
                                )}`}
                              >
                                {getStatusIcon(a.status)}
                                {a.status.charAt(0).toUpperCase() +
                                  a.status.slice(1)}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                <span>
                                  {(a.scheduledAt
                                    ? new Date(a.scheduledAt)
                                    : a.date
                                      ? new Date(a.date)
                                      : new Date()
                                  ).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <span>
                                  {a.scheduledAt
                                    ? new Date(
                                      a.scheduledAt
                                    ).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                    : a.time || 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <DollarSign className="w-4 h-4 text-green-500" />
                                <span className="font-medium">
                                  ${a.payment?.amount || a.fee || 0}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                  {a.type || 'In-person'}
                                </span>
                              </div>
                            </div>

                            {a.symptoms && (
                              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                                <p className="text-xs font-semibold text-blue-700 mb-1">
                                  Symptoms:
                                </p>
                                <p className="text-sm text-gray-700">
                                  {a.symptoms}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap lg:flex-col gap-2 lg:items-end">
                            {a.status === 'pending' && (
                              <button
                                onClick={() => handlePayment(a._id)}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-md"
                              >
                                <DollarSign className="w-4 h-4" />
                                Pay Now
                              </button>
                            )}
                            {a.status === 'confirmed' && (
                              <>
                                <button
                                  onClick={() => handleJoinCall(a._id)}
                                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm shadow-md"
                                >
                                  <Video className="w-4 h-4" />
                                  Join Call
                                </button>
                                <button
                                  onClick={() => handleCancel(a._id)}
                                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-sm"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {a.status === 'completed' && (
                              <>
                                {(a.prescriptionUrl || a.prescription) && (
                                  <button
                                    onClick={() => handleViewPrescription(a)}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm shadow-md"
                                  >
                                    <FileText className="w-4 h-4" />
                                    Prescription
                                  </button>
                                )}
                                <button
                                  onClick={() => handleBookFollowUp(a)}
                                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition text-sm"
                                >
                                  <Plus className="w-4 h-4" />
                                  Follow-up
                                </button>
                              </>
                            )}
                            {/* cancel button for other statuses */}
                            <div className="flex items-center gap-2 mt-2 lg:mt-0">
                              {a.status === 'pending' && (
                                <button
                                  onClick={() => handleCancel(a._id)}
                                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-sm"
                                >
                                  Cancel
                                </button>
                              )}
                              <button
                                onClick={() => handleViewDetails(a._id)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition text-sm"
                              >
                                <Eye className="w-4 h-4" />
                                Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {
        showRatingModal && selectedAppointmentForRating && (
          <RatingModal
            appointment={selectedAppointmentForRating}
            onClose={() => {
              setShowRatingModal(false);
              setSelectedAppointmentForRating(null);
            }}
            onSuccess={() => {
              // Optionally refresh data or mark as rated locally to hide button
              // For now just close
            }}
          />
        )
      }
    </div >
  );
}
