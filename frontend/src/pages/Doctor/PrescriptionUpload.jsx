import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import {
  Upload,
  FileText,
  ArrowLeft,
  Loader,
  AlertCircle,
  CheckCircle,
  Calendar,
  User,
} from 'lucide-react';

export default function PrescriptionUpload() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await api.get(`/appointments/${appointmentId}`);
        setAppointment(res.data?.appointment || res.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch appointment details');
      } finally {
        setFetching(false);
      }
    };

    if (appointmentId) {
      fetchAppointment();
    }
  }, [appointmentId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      // First upload the file
      const uploadRes = await api.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Then update appointment with prescription URL using doctor endpoint
      const res = await api.post(`/doctor/appointments/${appointmentId}/notes`, {
        prescriptionUrl: uploadRes.data?.url,
      });
      
      toast.success('Prescription uploaded successfully!');
      setUploadSuccess(true);
      setAppointment(res.data?.appointment || res.data);
      setFile(null);
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
      setTimeout(() => {
        navigate(`/doctor/appointment/${appointmentId}`);
      }, 2000);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload prescription');
    } finally {
      setLoading(false);
    }
  };

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
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => navigate(`/doctor/appointment/${appointmentId}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Appointment Details
            </button>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Upload Prescription
                </h2>
                <p className="text-gray-600">
                  Upload prescription file for this appointment
                </p>
              </div>

              {/* Appointment Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {typeof appointment.patientId === 'object'
                        ? appointment.patientId.name
                        : appointment.patient?.name || appointment.patientName || 'Unknown Patient'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {typeof appointment.patientId === 'object'
                        ? appointment.patientId.email
                        : appointment.patient?.email || appointment.patientEmail || ''}
                    </p>
                  </div>
                </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {appointment.scheduledAt
                          ? new Date(appointment.scheduledAt).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>
                    <span>•</span>
                    <span>
                      {appointment.scheduledAt
                        ? new Date(appointment.scheduledAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'N/A'}
                    </span>
                  </div>
              </div>

              {/* Upload Success Message */}
              {uploadSuccess && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">
                      Prescription uploaded successfully!
                    </p>
                    <p className="text-sm text-green-600">
                      Redirecting to appointment details...
                    </p>
                  </div>
                </div>
              )}

              {/* Upload Form */}
              {!appointment.prescriptionUrl ? (
                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Prescription File
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <input
                        type="file"
                        accept=".pdf,.jpg,.png,.jpeg"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="hidden"
                        id="prescription-file"
                        required
                      />
                      <label
                        htmlFor="prescription-file"
                        className="cursor-pointer inline-block"
                      >
                        <span className="text-purple-600 hover:text-purple-700 font-medium">
                          Click to select file
                        </span>
                        <span className="text-gray-500"> or drag and drop</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        PDF, JPG, PNG (Max 10MB)
                      </p>
                      {file && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-800">
                            Selected: {file.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading || !file}
                      className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Upload Prescription
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/doctor/appointment/${appointmentId}`)}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-800">
                        Prescription already uploaded
                      </p>
                      <p className="text-sm text-gray-600">
                        Uploaded on{' '}
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
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <FileText className="w-4 h-4" />
                    View Prescription
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
