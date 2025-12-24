// src/pages/Patient/AppointmentCreate.jsx
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  ArrowLeft,
  MapPin,
  DollarSign,
  Stethoscope,
  Loader,
  AlertCircle,
  Phone,
  Mail,
  FileText,
  Check,
} from 'lucide-react';
import api from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

export default function AppointmentCreate() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [type, setType] = useState('in-person');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [medicalHistories, setMedicalHistories] = useState([]);
  const [selectedHistoryIds, setSelectedHistoryIds] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchDoctor();
    fetchMedicalHistory();
  }, [doctorId]);

  const fetchDoctor = async () => {
    setFetching(true);
    try {
      // Try /doctors/:id first, fallback to /users/:id
      let res;
      try {
        res = await api.get(`/doctors/${doctorId}`);
      } catch (_err) {
        res = await api.get(`/users/${doctorId}`);
      }
      setDoctor(res.data?.doctor || res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load doctor info');
    } finally {
      setFetching(false);
    }
  };

  const fetchMedicalHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/patient/history');
      setMedicalHistories(res.data?.histories || []);
    } catch (err) {
      console.error('Failed to fetch medical history:', err);
      // Don't show error to user, just log it
    } finally {
      setLoadingHistory(false);
    }
  };

  const toggleHistorySelection = (historyId) => {
    setSelectedHistoryIds((prev) =>
      prev.includes(historyId)
        ? prev.filter((id) => id !== historyId)
        : [...prev, historyId]
    );
  };

  const handleSubmit = async () => {
    if (!date || !time) {
      setError('Please select date and time');
      return;
    }

    // Validate date is not in the past
    const selectedDateTime = new Date(`${date}T${time}`);
    if (selectedDateTime < new Date()) {
      setError('Please select a future date and time');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Combine date and time into ISO string for scheduledAt
      const scheduledAt = new Date(`${date}T${time}`).toISOString();

      const appointmentData = {
        doctorId,
        scheduledAt,
        // Optional fields
        ...(symptoms && { symptoms }),
        ...(type && { type }),
        ...(selectedHistoryIds.length > 0 && {
          attachedMedicalHistoryIds: selectedHistoryIds,
        }),
      };

      console.log('Creating appointment...', appointmentData);

      const res = await api.post('/appointments', appointmentData);
      console.log('Appointment created:', res.data);

      const appointmentId =
        res.data?.appointment?._id ||
        res.data?.appointment?.id ||
        res.data?._id ||
        res.data?.id;

      if (appointmentId) {
        navigate(`/patient/payment/${appointmentId}`);
      } else {
        throw new Error('Appointment ID not received from server');
      }
    } catch (err) {
      console.error('Appointment creation error:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to create appointment. Please try again.';
      setError(errorMessage);
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  // Generate time slots (9 AM to 6 PM, every 30 minutes)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')}`;
        slots.push(timeStr);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  if (fetching) {
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

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Sidebar />
        <div className="ml-64 pt-16 flex flex-col items-center justify-center min-h-screen">
          <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-500 mb-4">Doctor not found</p>
          <button
            onClick={() => navigate('/patient/doctors')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Doctors
          </button>
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
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate('/patient/doctors')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Doctors
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Doctor Info Card */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white sticky top-24">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <User className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{doctor.name}</h2>
                      <p className="text-blue-100 text-sm">
                        {doctor.specialization || 'General Practitioner'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    {doctor.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{doctor.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span>
                        ${doctor.consultationFee || doctor.fee || 'N/A'} per
                        consultation
                      </span>
                    </div>
                    {doctor.experience && (
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4" />
                        <span>{doctor.experience} years experience</span>
                      </div>
                    )}
                  </div>

                  {doctor.qualifications && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <p className="text-xs text-blue-100 mb-1">
                        Qualifications:
                      </p>
                      <p className="text-sm">{doctor.qualifications}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Book Appointment
                  </h2>

                  {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setShowConfirm(true);
                    }}
                    className="space-y-6"
                  >
                    {/* Appointment Type */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Appointment Type <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setType('in-person')}
                          className={`px-4 py-3 rounded-lg border-2 transition ${
                            type === 'in-person'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          In-Person
                        </button>
                        <button
                          type="button"
                          onClick={() => setType('video')}
                          className={`px-4 py-3 rounded-lg border-2 transition ${
                            type === 'video'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          Video Call
                        </button>
                      </div>
                    </div>

                    {/* Date Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Select Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        min={today}
                        max={maxDateStr}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Time Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Select Time <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Choose a time</option>
                        {timeSlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Symptoms */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Symptoms/Reason for Visit{' '}
                        <span className="text-gray-400">(Optional)</span>
                      </label>
                      <textarea
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="Describe your symptoms or reason for the appointment..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Medical History Selection */}
                    {medicalHistories.length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Attach Previous Medical History{' '}
                          <span className="text-gray-400">(Optional)</span>
                        </label>
                        <p className="text-xs text-gray-500 mb-3">
                          Select your previous medical history files to share with
                          the doctor
                        </p>
                        <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                          {loadingHistory ? (
                            <div className="p-4 text-center">
                              <Loader className="w-5 h-5 animate-spin text-blue-500 mx-auto" />
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-200">
                              {medicalHistories.map((history) => (
                                <div
                                  key={history._id}
                                  className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                                    selectedHistoryIds.includes(history._id)
                                      ? 'bg-blue-50 border-l-4 border-blue-500'
                                      : ''
                                  }`}
                                  onClick={() =>
                                    toggleHistorySelection(history._id)
                                  }
                                >
                                  <div className="flex items-start gap-3">
                                    <div
                                      className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                        selectedHistoryIds.includes(history._id)
                                          ? 'bg-blue-500 border-blue-500'
                                          : 'border-gray-300'
                                      }`}
                                    >
                                      {selectedHistoryIds.includes(
                                        history._id
                                      ) && (
                                        <Check className="w-3 h-3 text-white" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <p className="text-sm font-medium text-gray-800 truncate">
                                          {history.description ||
                                            'Medical History File'}
                                        </p>
                                      </div>
                                      <p className="text-xs text-gray-500">
                                        Uploaded:{' '}
                                        {new Date(
                                          history.uploadedAt
                                        ).toLocaleDateString()}
                                      </p>
                                      {history.fileUrl && (
                                        <a
                                          href={history.fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                                        >
                                          View File
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {selectedHistoryIds.length > 0 && (
                          <p className="text-xs text-blue-600 mt-2">
                            {selectedHistoryIds.length} file(s) selected
                          </p>
                        )}
                      </div>
                    )}

                    {/* Summary */}
                    {date && time && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-blue-800 mb-2">
                          Appointment Summary:
                        </p>
                        <div className="space-y-1 text-sm text-blue-700">
                          <p>
                            <strong>Date:</strong>{' '}
                            {new Date(date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                          <p>
                            <strong>Time:</strong> {time}
                          </p>
                          <p>
                            <strong>Type:</strong>{' '}
                            {type === 'video' ? 'Video Call' : 'In-Person'}
                          </p>
                          <p>
                            <strong>Fee:</strong> $
                            {doctor.consultationFee || doctor.fee || 'N/A'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={!date || !time || loading}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Calendar className="w-5 h-5" />
                          Continue to Payment
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                Confirm Appointment
              </h3>
            </div>
            <div className="space-y-3 mb-6">
              <p className="text-gray-700">
                You are about to book an appointment with{' '}
                <span className="font-semibold">{doctor.name}</span>
              </p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {new Date(date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">
                    {type === 'video' ? 'Video Call' : 'In-Person'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fee:</span>
                  <span className="font-medium">
                    ${doctor.consultationFee || doctor.fee || 'N/A'}
                  </span>
                </div>
                {selectedHistoryIds.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Medical History:</span>
                    <span className="font-medium text-blue-600">
                      {selectedHistoryIds.length} file(s) attached
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm & Pay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
