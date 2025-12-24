// src/pages/Patient/Records.jsx
import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  Calendar,
  Search,
  Filter,
  Image as ImageIcon,
  File,
  Loader,
  AlertCircle,
  Plus,
  Share2,
  X,
} from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import SharedWithModal from '../../components/SharedWithModal';

export default function Records() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingRecord, setSharingRecord] = useState(null);

  const filteredRecords = records
    .filter((record) => {
      const matchesSearch =
        record.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter =
        filter === 'all' ||
        record.tags?.includes(filter) ||
        record.type === filter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || a.uploadedAt || 0);
      const dateB = new Date(b.createdAt || b.uploadedAt || 0);
      return dateB - dateA;
    });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      console.log('Fetching medical records...');
      const res = await api.get('/records');
      console.log('Medical records response:', res.data);
      const recordsData = res.data?.records || res.data || [];
      setRecords(Array.isArray(recordsData) ? recordsData : []);
    } catch (error) {
      console.error('Error fetching records:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to load medical records';

      // Don't show toast if it's just that there are no records
      if (error.response?.status !== 404) {
        toast.error(errorMessage);
      }
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recordId) => {
    const confirmed = await new Promise((resolve) => {
      toast((t) => (
        <div className="flex flex-col gap-3">
          <p className="font-semibold">Delete Medical Record?</p>
          <p className="text-sm text-gray-600">This action cannot be undone.</p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      ), {
        duration: Infinity,
      });
    });

    if (!confirmed) return;

    try {
      await api.delete(`/records/${recordId}`);
      setRecords((prev) => prev.filter((r) => r._id !== recordId));
      toast.success('Record deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete record');
    }
  };

  const handleView = (record) => {
    setSelectedRecord(record);
    setShowPreview(true);
  };

  const handleDownload = (record) => {
    const url = record.fileUrl || record.url;
    if (url) {
      window.open(url, '_blank');
      toast.success('Opening file...');
    } else {
      toast.error('File URL not available');
    }
  };

  const handleShare = (record) => {
    setSharingRecord(record);
    setShowShareModal(true);
  };

  const getFileType = (url) => {
    if (!url) return 'unknown';
    const ext = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    return 'other';
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
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    Medical Records
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Manage your medical history and documents
                  </p>
                </div>
                <button
                  onClick={() => navigate('/patient/records/upload')}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Upload Record
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Records</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {records.length}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Images</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {records.filter((r) => getFileType(r.fileUrl || r.url) === 'image').length}
                    </p>
                  </div>
                  <ImageIcon className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">PDFs</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {records.filter((r) => getFileType(r.fileUrl || r.url) === 'pdf').length}
                    </p>
                  </div>
                  <File className="w-8 h-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">This Month</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {records.filter((r) => {
                        const recordDate = new Date(r.uploadedAt || r.createdAt);
                        const now = new Date();
                        return (
                          recordDate.getMonth() === now.getMonth() &&
                          recordDate.getFullYear() === now.getFullYear()
                        );
                      }).length}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search records by description or type..."
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
                    <option value="all">All Types</option>
                    <option value="xray">X-Ray</option>
                    <option value="prescription">Prescription</option>
                    <option value="lab-report">Lab Report</option>
                    <option value="scan">Scan</option>
                    <option value="blood-test">Blood Test</option>
                    <option value="vaccination">Vaccination</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Records Grid */}
            {filteredRecords.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No records found
                </h3>
                <p className="text-gray-500 mb-6">
                  {records.length === 0
                    ? "You haven't uploaded any medical records yet."
                    : 'No records match your search criteria.'}
                </p>
                {records.length === 0 && (
                  <button
                    onClick={() => navigate('/patient/records/upload')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Your First Record
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecords.map((record) => {
                  const fileType = getFileType(record.fileUrl || record.url);
                  const isImage = fileType === 'image';

                  return (
                    <div
                      key={record._id}
                      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all"
                    >
                      {/* Preview/Thumbnail */}
                      <div className="relative h-48 bg-gray-100">
                        {isImage && record.fileUrl ? (
                          <img
                            src={record.fileUrl || record.url}
                            alt={record.description || 'Medical record'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {fileType === 'pdf' ? (
                              <File className="w-16 h-16 text-red-500" />
                            ) : (
                              <FileText className="w-16 h-16 text-gray-400" />
                            )}
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 bg-black/50 text-white text-xs rounded">
                            {Array.isArray(record.tags) && record.tags.length > 0
                              ? record.tags[0]
                              : record.type || 'Other'}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                          {record.title || record.description || 'Medical Record'}
                        </h3>
                        {record.description && record.title && (
                          <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                            {record.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(
                              record.createdAt || record.uploadedAt
                            ).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleView(record)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition text-sm"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleShare(record)}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition text-sm"
                            title="Share"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(record)}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition text-sm"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(record._id)}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-sm"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                {selectedRecord.title || selectedRecord.description || 'Medical Record'}
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {getFileType(selectedRecord.fileUrl || selectedRecord.url) === 'image' ? (
                <img
                  src={selectedRecord.fileUrl || selectedRecord.url}
                  alt={selectedRecord.description}
                  className="w-full h-auto rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <File className="w-24 h-24 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">Preview not available</p>
                  <a
                    href={selectedRecord.fileUrl || selectedRecord.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Open File
                  </a>
                </div>
              )}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                {Array.isArray(selectedRecord.tags) && selectedRecord.tags.length > 0 && (
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Tags:</strong> {selectedRecord.tags.join(', ')}
                  </p>
                )}
                {selectedRecord.type && (
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Type:</strong> {selectedRecord.type}
                  </p>
                )}
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Uploaded:</strong>{' '}
                  {new Date(
                    selectedRecord.createdAt || selectedRecord.uploadedAt
                  ).toLocaleString()}
                </p>
                {selectedRecord.title && selectedRecord.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Title:</strong> {selectedRecord.title}
                  </p>
                )}
                {selectedRecord.description && (
                  <p className="text-sm text-gray-600">
                    <strong>Description:</strong> {selectedRecord.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && sharingRecord && (
        <SharedWithModal
          record={sharingRecord}
          onClose={() => {
            setShowShareModal(false);
            setSharingRecord(null);
            fetchRecords(); // Refresh to catch any updates if needed
          }}
        />
      )}
    </div>
  );
}

