import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function MedicalHistoryUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);

    if (selected && selected.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('historyFile', file);
    formData.append('description', description);

    try {
      setLoading(true);
      const res = await api.post('/patient/history/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Medical history uploaded successfully!');

      // Reset
      setFile(null);
      setPreview(null);
      setDescription('');
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.message || 'Upload failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-start">
      <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Upload Medical History
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Description */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Description (optional)
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Example: X-ray report, previous prescription..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* File Input */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Upload File
            </label>

            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-xl p-3 bg-gray-50"
            />

            {/* Preview for images */}
            {preview && (
              <div className="mt-4 border rounded-xl overflow-hidden shadow-sm">
                <img src={preview} alt="Preview" className="w-full h-auto" />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-purple-600 text-white font-semibold py-3 rounded-xl transition-all hover:bg-purple-700 ${
              loading && 'opacity-60 cursor-not-allowed'
            }`}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>
    </div>
  );
}
