// src/pages/Patient/AIDoctor.jsx
/**
 * AI Doctor Page
 * Allows users to upload medical reports for AI-powered analysis
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  Loader,
  CheckCircle,
  AlertCircle,
  X,
  Stethoscope,
  TestTube,
  Pill,
  AlertTriangle,
  Calendar,
  Sparkles,
  Image as ImageIcon,
  File,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

export default function AIDoctor() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');

  // Handle file selection
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(selected.type)) {
      toast.error('Please upload a JPEG, PNG, or PDF file');
      return;
    }

    // Validate file size (max 10MB)
    if (selected.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(selected);
    setError('');
    setAnalysisResult(null);

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

  // Remove selected file
  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setAnalysisResult(null);
    setError('');
    const fileInput = document.getElementById('report-image-input');
    if (fileInput) fileInput.value = '';
  };

  // Submit for analysis
  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Please select a medical report image');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append('reportImage', file);

      console.log('Uploading medical report for AI analysis...');

      const res = await api.post('/ai/analyze-report', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Analysis response:', res.data);

      if (res.data && res.data.analysis) {
        setAnalysisResult(res.data);
        toast.success('Medical report analyzed successfully!');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to analyze medical report. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get likelihood color
  const getLikelihoodColor = (likelihood) => {
    switch (likelihood?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      <div className="ml-64 pt-16">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">AI Doctor</h1>
                  <p className="text-gray-600 mt-1">
                    Get AI-powered analysis of your medical reports
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            {!analysisResult ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Section */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-blue-600" />
                    Upload Medical Report
                  </h2>

                  {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-red-800">Error</p>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* File Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                    <input
                      id="report-image-input"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={loading}
                    />

                    {!file ? (
                      <label
                        htmlFor="report-image-input"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                          <Upload className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-gray-700 font-medium mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-gray-500">
                          JPEG, PNG, or PDF (Max 10MB)
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Upload medical reports, lab results, or test images
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
                              disabled={loading}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <File className="w-8 h-8 text-gray-400" />
                            <div className="flex-1 text-left">
                              <p className="font-medium text-gray-800">{file.name}</p>
                              <p className="text-sm text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={handleRemoveFile}
                              className="p-2 hover:bg-gray-200 rounded-lg transition"
                              disabled={loading}
                            >
                              <X className="w-5 h-5 text-gray-600" />
                            </button>
                          </div>
                        )}
                        <label
                          htmlFor="report-image-input"
                          className="inline-block text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer"
                        >
                          Change File
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Analyze Button */}
                  <button
                    onClick={handleAnalyze}
                    disabled={!file || loading}
                    className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-medium"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Analyze Report
                      </>
                    )}
                  </button>
                </div>

                {/* Info Section */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-lg p-6 border border-purple-100">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-purple-600" />
                    How It Works
                  </h2>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        1
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Upload Report</p>
                        <p className="text-sm text-gray-600">
                          Upload a clear image of your medical report, lab results, or test
                          images
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        2
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">AI Analysis</p>
                        <p className="text-sm text-gray-600">
                          Our AI extracts text using OCR and analyzes it with advanced medical
                          AI models
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        3
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Get Insights</p>
                        <p className="text-sm text-gray-600">
                          Receive detailed analysis including possible conditions, risk factors,
                          and recommendations
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-yellow-800 text-sm">
                          Important Disclaimer
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          This AI analysis is for informational purposes only and should NOT
                          replace professional medical advice. Always consult with a qualified
                          healthcare provider for diagnosis and treatment.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Analysis Results */
              <div className="space-y-6">
                {/* Success Header */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">
                          Analysis Complete
                        </h2>
                        <p className="text-sm text-gray-600">
                          {analysisResult.timestamp
                            ? new Date(analysisResult.timestamp).toLocaleString()
                            : 'Just now'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      Analyze Another Report
                    </button>
                  </div>
                </div>

                {/* Summary */}
                {analysisResult.analysis?.summary && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Summary
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {analysisResult.analysis.summary}
                    </p>
                  </div>
                )}

                {/* Key Findings */}
                {analysisResult.analysis?.findings &&
                  analysisResult.analysis.findings.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-green-600" />
                        Key Findings
                      </h3>
                      <ul className="space-y-2">
                        {analysisResult.analysis.findings.map((finding, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-gray-700"
                          >
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Possible Conditions */}
                {analysisResult.analysis?.possibleConditions &&
                  analysisResult.analysis.possibleConditions.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                        Possible Conditions
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {analysisResult.analysis.possibleConditions.map((condition, index) => (
                          <div
                            key={index}
                            className="border rounded-lg p-4 hover:shadow-md transition"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-800">
                                {condition.condition}
                              </h4>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium border ${getLikelihoodColor(
                                  condition.likelihood
                                )}`}
                              >
                                {condition.likelihood || 'Unknown'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{condition.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Risk Factors */}
                {analysisResult.analysis?.riskFactors &&
                  analysisResult.analysis.riskFactors.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        Risk Factors
                      </h3>
                      <div className="space-y-2">
                        {analysisResult.analysis.riskFactors.map((risk, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg"
                          >
                            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{risk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Recommended Tests */}
                {analysisResult.analysis?.recommendedTests &&
                  analysisResult.analysis.recommendedTests.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <TestTube className="w-5 h-5 text-blue-600" />
                        Recommended Tests
                      </h3>
                      <div className="space-y-3">
                        {analysisResult.analysis.recommendedTests.map((test, index) => (
                          <div
                            key={index}
                            className="border rounded-lg p-4 hover:shadow-md transition"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-800">{test.test}</h4>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                                  test.priority
                                )}`}
                              >
                                {test.priority || 'Medium'} Priority
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{test.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* OTC Medications */}
                {analysisResult.analysis?.otcMedications &&
                  analysisResult.analysis.otcMedications.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Pill className="w-5 h-5 text-purple-600" />
                        Safe OTC Medication Suggestions
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {analysisResult.analysis.otcMedications.map((med, index) => (
                          <div
                            key={index}
                            className="border rounded-lg p-4 hover:shadow-md transition"
                          >
                            <h4 className="font-semibold text-gray-800 mb-2">
                              {med.medication}
                            </h4>
                            <div className="space-y-1 text-sm">
                              <p className="text-gray-600">
                                <span className="font-medium">Purpose:</span> {med.purpose}
                              </p>
                              {med.dosage && (
                                <p className="text-gray-600">
                                  <span className="font-medium">Dosage:</span> {med.dosage}
                                </p>
                              )}
                              {med.warnings && (
                                <p className="text-red-600 text-xs">
                                  <span className="font-medium">⚠️ Warnings:</span>{' '}
                                  {med.warnings}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* When to See Doctor */}
                {analysisResult.analysis?.whenToSeeDoctor && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      When to Consult a Doctor
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {analysisResult.analysis.whenToSeeDoctor}
                    </p>
                  </div>
                )}

                {/* General Advice */}
                {analysisResult.analysis?.generalAdvice && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      General Health Advice
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {analysisResult.analysis.generalAdvice}
                    </p>
                  </div>
                )}

                {/* Disclaimer */}
                {analysisResult.analysis?.disclaimer && (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-bold text-yellow-800 mb-2">Important Disclaimer</h3>
                        <p className="text-sm text-yellow-700 leading-relaxed">
                          {analysisResult.analysis.disclaimer}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

