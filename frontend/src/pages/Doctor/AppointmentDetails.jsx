import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import {
  Calendar,
  Clock,
  User,
  DollarSign,
  CheckCircle,
  XCircle,
  Loader,
  AlertCircle,
  ArrowLeft,
  Upload,
  FileText,
  Phone,
  Mail,
} from 'lucide-react';

export default function AppointmentDetails() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [sharedRecords, setSharedRecords] = useState([]);
  const [loadingShared, setLoadingShared] = useState(false);

  useEffect(() => {
    const fetchAppointment = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/appointments/${appointmentId}`);
        const apptData = res.data?.appointment || res.data;
        setAppointment(apptData);

        // If we have patient info, fetch shared records
        if (apptData?.patientId) {
          const pId = typeof apptData.patientId === 'object' ? apptData.patientId._id : apptData.patientId;
          fetchSharedRecords(pId);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch appointment details');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [appointmentId]);

  const fetchSharedRecords = async (patientId) => {
    try {
      setLoadingShared(true);
      const res = await api.get(`/records/shared?patientId=${patientId}`);
      setSharedRecords(res.data.records || []);
    } catch (err) {
      console.error("Error fetching shared records:", err);
      // Don't show error toast to avoid clutter if no shared records found/error
    } finally {
      setLoadingShared(false);
    }
  };

  const handlePrescriptionUpload = async (e) => {
    e.preventDefault();
    if (!prescriptionFile) {
      toast.error('Please select a file');
      return;
    }
    const formData = new FormData();
    formData.append('file', prescriptionFile);
    try {
      setUploading(true);
      // First upload the file
      const uploadRes = await api.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Then update appointment with prescription URL using doctor endpoint
      const res = await api.post(
        `/doctor/appointments/${appointmentId}/notes`,
        {
          prescriptionUrl: uploadRes.data?.url,
        }
      );
      toast.success('Prescription uploaded successfully');
      setAppointment(res.data.appointment || res.data); // update appointment with new prescription
      setPrescriptionFile(null);
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || 'Failed to upload prescription'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/appointments/${appointmentId}`, {
        status: newStatus,
      });
      setAppointment((prev) => ({ ...prev, status: newStatus }));
      toast.success('Status updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
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

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Sidebar />
        <div className="ml-64 pt-16 flex flex-col items-center justify-center min-h-screen">
          <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-500">Appointment not found</p>
          <button
            onClick={() => navigate('/doctor/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
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
              onClick={() => navigate('/doctor/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Appointment Details
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${appointment.status === 'completed'
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : appointment.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                      : appointment.status === 'cancelled'
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : 'bg-blue-100 text-blue-800 border-blue-300'
                    }`}
                >
                  {appointment.status.charAt(0).toUpperCase() +
                    appointment.status.slice(1)}
                </span>
              </div>

              <div className="border-b border-gray-200 pb-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Patient Information
                </h3>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-semibold text-lg">
                      {typeof appointment.patientId === 'object'
                        ? appointment.patientId.name
                        : appointment.patient?.name ||
                        appointment.patientName ||
                        'Unknown Patient'}
                    </p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">
                          {typeof appointment.patientId === 'object'
                            ? appointment.patientId.email
                            : appointment.patient?.email ||
                            appointment.patientEmail ||
                            'N/A'}
                        </span>
                      </div>
                      {typeof appointment.patientId === 'object' &&
                        appointment.patientId.bodyId && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="text-sm font-medium">
                              Body ID: {appointment.patientId.bodyId}
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Appointment Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="text-gray-800 font-medium">
                        {appointment.scheduledAt
                          ? new Date(
                            appointment.scheduledAt
                          ).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">Time</p>
                      <p className="text-gray-800 font-medium">
                        {appointment.scheduledAt
                          ? new Date(
                            appointment.scheduledAt
                          ).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-500">Consultation Fee</p>
                      <p className="text-gray-800 font-medium">
                        ${appointment.payment?.amount || appointment.fee || '0'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-xs text-gray-500">Type</p>
                      <p className="text-gray-800 font-medium capitalize">
                        {appointment.type || 'In-person'}
                      </p>
                    </div>
                  </div>
                </div>
                {appointment.symptoms && (
                  <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Symptoms:
                    </p>
                    <p className="text-gray-800">{appointment.symptoms}</p>
                  </div>
                )}
              </div>

              {/* Attached Medical History */}
              {appointment.attachedMedicalHistoryIds &&
                appointment.attachedMedicalHistoryIds.length > 0 && (
                  <div className="border-b border-gray-200 pb-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                      Patient's Medical History
                    </h3>
                    <div className="space-y-3">
                      {appointment.attachedMedicalHistoryIds.map((history) => (
                        <div
                          key={history._id || history}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <p className="font-medium text-gray-800">
                                  {typeof history === 'object'
                                    ? history.description ||
                                    'Medical History File'
                                    : 'Medical History File'}
                                </p>
                              </div>
                              {typeof history === 'object' &&
                                history.uploadedAt && (
                                  <p className="text-xs text-gray-500 mb-2">
                                    Uploaded:{' '}
                                    {new Date(
                                      history.uploadedAt
                                    ).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}
                                  </p>
                                )}
                              {typeof history === 'object' &&
                                history.fileUrl && (
                                  <a
                                    href={history.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm mt-2"
                                  >
                                    <FileText className="w-4 h-4" />
                                    View Medical History File
                                  </a>
                                )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Shared Medical Records Section */}
              <div className="border-b border-gray-200 pb-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  Shared Medical Records
                </h3>

                {loadingShared ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader className="w-6 h-6 animate-spin text-purple-500" />
                  </div>
                ) : sharedRecords.length > 0 ? (
                  <div className="space-y-3">
                    {sharedRecords.map((record) => (
                      <div key={record._id} className="bg-purple-50 border border-purple-100 rounded-lg p-4 hover:bg-purple-100 transition">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="w-5 h-5 text-purple-600" />
                              <p className="font-medium text-gray-800">{record.title || "Untitled Record"}</p>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                              <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                              {record.fileType && <span className="uppercase px-2 py-0.5 bg-white rounded border border-purple-200">{record.fileType.split('/')[1] || 'FILE'}</span>}
                            </div>

                            <a
                              href={record.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition text-sm"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              View Record
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <p className="text-gray-500 text-sm">No records have been shared with you for this patient.</p>
                  </div>
                )}
              </div>

              {/* Status Actions */}
              {appointment.status !== 'completed' &&
                appointment.status !== 'cancelled' && (
                  <div className="border-b border-gray-200 pb-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                      Actions
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {appointment.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange('confirmed')}
                          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Confirm Appointment
                        </button>
                      )}
                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange('completed')}
                          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark as Completed
                        </button>
                      )}

                      {appointment.status === 'paid' && (
                        <button
                          onClick={() => handleStatusChange('confirmed')}
                          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Confirm Appointment
                        </button>
                      )}
                    </div>
                  </div>
                )}

              {/* Prescription Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Prescription
                </h3>
                {appointment.prescriptionUrl ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-800">
                            Prescription uploaded
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(
                              appointment.updatedAt || Date.now()
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <a
                        href={appointment.prescriptionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        View Prescription
                      </a>
                    </div>
                  </div>
                ) : appointment.status === 'completed' ? (
                  <form
                    onSubmit={handlePrescriptionUpload}
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                  >
                    <p className="text-sm text-gray-700 mb-3">
                      Upload prescription for this completed appointment
                    </p>
                    <div className="flex flex-col md:flex-row gap-3">
                      <input
                        type="file"
                        onChange={(e) => setPrescriptionFile(e.target.files[0])}
                        accept=".pdf,.jpg,.png,.jpeg"
                        className="flex-1 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                      <button
                        type="submit"
                        disabled={uploading || !prescriptionFile}
                        className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Upload className="w-4 h-4" />
                        {uploading ? 'Uploading...' : 'Upload Prescription'}
                      </button>
                    </div>
                    {prescriptionFile && (
                      <p className="text-sm text-gray-600 mt-2">
                        Selected: {prescriptionFile.name}
                      </p>
                    )}
                  </form>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-600">
                      Prescription can be uploaded after marking the appointment
                      as completed.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
