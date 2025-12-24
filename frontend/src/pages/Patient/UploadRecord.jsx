// src/pages/Patient/UploadRecord.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Loader,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

export default function UploadRecord() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [description, setDescription] = useState('');
  const [type, setType] = useState('other');
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    // Validate file size (max 10MB)
    if (selected.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(selected);

    // Create preview for images
    if (selected.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selected);
    } else {
      setPreview(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', description || type || 'Medical Record');
    formData.append('description', description);
    if (type && type !== 'other') {
      formData.append('tags', type);
    }

    try {
      setLoading(true);
      console.log('Uploading medical record...', {
        description,
        type,
        fileName: file.name,
      });

      const res = await api.post('/records/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Upload successful:', res.data);

      if (res.data && (res.data.record || res.data.message)) {
        toast.success(
          res.data.message || 'Medical record uploaded successfully!'
        );
        setUploadSuccess(true);
        setTimeout(() => {
          navigate('/patient/records');
        }, 2000);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Upload failed. Please try again.';
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      <div className="ml-64 pt-16">
        <div className="p-6">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => navigate('/patient/records')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Records
            </button>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Upload Medical Record
                </h1>
                <p className="text-gray-600">
                  Upload your medical history, test results, prescriptions, or
                  any medical documents
                </p>
              </div>

              {/* Success Message */}
              {uploadSuccess && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">
                      Record uploaded successfully!
                    </p>
                    <p className="text-sm text-green-600">
                      Redirecting to records page...
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Record Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Record Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="xray">X-Ray</option>
                    <option value="prescription">Prescription</option>
                    <option value="lab-report">Lab Report</option>
                    <option value="scan">Scan (CT, MRI, etc.)</option>
                    <option value="blood-test">Blood Test</option>
                    <option value="vaccination">Vaccination Record</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description{' '}
                    <span className="text-gray-400">(Optional)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., Chest X-ray from January 2024, Blood test results..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload File <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                    <input
                      id="file-input"
                      type="file"
                      // accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                    {!file ? (
                      <label
                        htmlFor="file-input"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                          <Upload className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-gray-700 font-medium mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG, PDF up to 10MB
                        </p>
                      </label>
                    ) : (
                      <div className="space-y-4">
                        {preview ? (
                          <div className="relative inline-block">
                            <img
                              src={preview}
                              alt="Preview"
                              className="max-h-64 rounded-lg shadow-md"
                            />
                            <button
                              type="button"
                              onClick={handleRemoveFile}
                              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <FileText className="w-8 h-8 text-gray-400" />
                            <div className="flex-1 text-left">
                              <p className="font-medium text-gray-800">
                                {file.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={handleRemoveFile}
                              className="p-2 hover:bg-gray-200 rounded-lg transition"
                            >
                              <X className="w-5 h-5 text-gray-600" />
                            </button>
                          </div>
                        )}
                        <label
                          htmlFor="file-input"
                          className="inline-block text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer"
                        >
                          Change File
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/patient/records')}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !file || uploadSuccess}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Upload Record
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
