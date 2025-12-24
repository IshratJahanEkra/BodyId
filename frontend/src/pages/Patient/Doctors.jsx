// src/pages/Patient/Doctors.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  User,
  MapPin,
  Star,
  Clock,
  DollarSign,
  Stethoscope,
  Phone,
  Mail,
  Calendar,
  Loader,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

export default function Doctors() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      // Fetch all users and filter by role (backend doesn't have /doctors endpoint)
      const res = await api.get('/users');
      const allUsers = res.data || [];
      const doctorsList = allUsers.filter((user) => user.role === 'doctor');
      setDoctors(doctorsList);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (doctorId) => {
    navigate(`/patient/appointment/create/${doctorId}`);
  };

  // Get unique specializations
  const specializations = [
    ...new Set(doctors.map((d) => d.specialization).filter(Boolean)),
  ];

  const filteredDoctors = doctors
    .filter((doctor) => {
      const matchesSearch =
        doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.location?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialization =
        specializationFilter === 'all' ||
        doctor.specialization === specializationFilter;
      return matchesSearch && matchesSpecialization;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'fee') {
        return (a.consultationFee || 0) - (b.consultationFee || 0);
      } else if (sortBy === 'rating') {
        return (b.averageRating || 0) - (a.averageRating || 0);
      }
      return 0;
    });

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
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800">
                Find a Doctor
              </h1>
              <p className="text-gray-600 mt-1">
                Browse our verified doctors and book an appointment
              </p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, specialty, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={specializationFilter}
                    onChange={(e) => setSpecializationFilter(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Specializations</option>
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name">Sort by Name</option>
                  <option value="fee">Sort by Fee (Low to High)</option>
                  <option value="rating">Sort by Rating</option>
                </select>
              </div>
            </div>

            {/* Doctors Grid */}
            {filteredDoctors.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No doctors found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all"
                  >
                    {/* Doctor Header */}
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <User className="w-8 h-8" />
                        </div>
                        {doctor.averageRating > 0 && (
                          <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm font-medium">
                              {doctor.averageRating.toFixed(1)}
                            </span>
                            <span className="text-xs opacity-75">
                              ({doctor.totalRatings || 0})
                            </span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-bold">{doctor.name}</h3>
                      <p className="text-blue-100 text-sm mt-1">
                        {doctor.specialization || 'General Practitioner'}
                      </p>
                      {doctor.bmdcId && (
                        <p className="text-blue-100 text-xs mt-1 font-mono opacity-80">
                          BMDC ID: {doctor.bmdcId}
                        </p>
                      )}
                    </div>

                    {/* Doctor Info */}
                    <div className="p-6 space-y-4">
                      {doctor.location && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">{doctor.location}</span>
                        </div>
                      )}

                      {doctor.experience && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4 text-green-500" />
                          <span className="text-sm">
                            {doctor.experience} years experience
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-semibold">
                          ${doctor.consultationFee || doctor.fee || 'N/A'} per
                          consultation
                        </span>
                      </div>

                      {doctor.qualifications && (
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">
                            Qualifications:
                          </p>
                          <p className="text-sm text-gray-700">
                            {doctor.qualifications}
                          </p>
                        </div>
                      )}

                      {doctor.bio && (
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {doctor.bio}
                          </p>
                        </div>
                      )}

                      {/* Action Button */}
                      <button
                        onClick={() => handleBookAppointment(doctor._id)}
                        className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-md"
                      >
                        <Calendar className="w-4 h-4" />
                        Book Appointment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <Stethoscope className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800">
                  {doctors.length}
                </p>
                <p className="text-gray-500 text-sm">Verified Doctors</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800">
                  {specializations.length}
                </p>
                <p className="text-gray-500 text-sm">Specializations</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800">24/7</p>
                <p className="text-gray-500 text-sm">Available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

