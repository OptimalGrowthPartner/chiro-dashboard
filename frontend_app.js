import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileAudio, Copy, Download, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('transcript');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/flac'];
      if (!validTypes.includes(selectedFile.type) && 
          !selectedFile.name.toLowerCase().match(/\.(wav|mp3|m4a|flac)$/)) {
        setError('Please select a valid audio file (WAV, MP3, M4A, or FLAC)');
        return;
      }
      
      // Validate file size (50MB limit)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select an audio file first');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minute timeout
      });

      setResults(response.data);
      setActiveTab('transcript');
    } catch (err) {
      console.error('Upload error:', err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again with a shorter audio file.');
      } else {
        setError('Failed to process audio file. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log('Copied to clipboard');
    });
  };

  const downloadAsText = (content, filename) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const formatCodes = (codes) => {
    if (!codes) return 'No codes generated';
    
    let formatted = '';
    
    if (codes.cpt_codes && codes.cpt_codes.length > 0) {
      formatted += 'CPT CODES:\n';
      codes.cpt_codes.forEach(code => {
        formatted += `• ${code.code}: ${code.description}\n`;
      });
      formatted += '\n';
    }
    
    if (codes.icd10_codes && codes.icd10_codes.length > 0) {
      formatted += 'ICD-10 CODES:\n';
      codes.icd10_codes.forEach(code => {
        formatted += `• ${code.code}: ${code.description}\n`;
      });
    }
    
    return formatted;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <FileAudio className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Chiropractic AI Assistant
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              HIPAA Compliant Documentation
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Upload Patient Consultation Audio
          </h2>
          
          <div className="space-y-4">
            {/* File Upload */}
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> audio file
                  </p>
                  <p className="text-xs text-gray-500">
                    WAV, MP3, M4A, or FLAC (MAX. 50MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".wav,.mp3,.m4a,.flac,audio/*"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* Selected File Display */}
            {file && (
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <FileAudio className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-sm text-gray-700 flex-1">{file.name}</span>
                <span className="text-xs text-gray-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="flex items-center p-3 bg-red-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!file || loading}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Processing... (This may take several minutes)
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  Upload & Transcribe
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="bg-white rounded-lg shadow-md">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { key: 'transcript', label: 'Transcript' },
                  { key: 'soap_note', label: 'SOAP Note' },
                  { key: 'referral_letter', label: 'Referral Letter' },
                  { key: 'codes', label: 'Billing Codes' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {activeTab === 'transcript' && 'Consultation Transcript'}
                  {activeTab === 'soap_note' && 'SOAP Note'}
                  {activeTab === 'referral_letter' && 'Referral Letter'}
                  {activeTab === 'codes' && 'Billing & Diagnostic Codes'}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(
                      activeTab === 'codes' 
                        ? formatCodes(results[activeTab])
                        : results[activeTab]
                    )}
                    className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </button>
                  <button
                    onClick={() => downloadAsText(
                      activeTab === 'codes' 
                        ? formatCodes(results[activeTab])
                        : results[activeTab],
                      `${activeTab}.txt`
                    )}
                    className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 min-h-64">
                {activeTab === 'codes' ? (
                  <div className="space-y-4">
                    {results.codes?.cpt_codes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">CPT Codes</h4>
                        <div className="space-y-1">
                          {results.codes.cpt_codes.map((code, index) => (
                            <div key={index} className="flex items-start">
                              <span className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded mr-3">
                                {code.code}
                              </span>
                              <span className="text-sm text-gray-700">{code.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {results.codes?.icd10_codes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">ICD-10 Codes</h4>
                        <div className="space-y-1">
                          {results.codes.icd10_codes.map((code, index) => (
                            <div key={index} className="flex items-start">
                              <span className="font-mono text-sm bg-green-100 text-green-800 px-2 py-1 rounded mr-3">
                                {code.code}
                              </span>
                              <span className="text-sm text-gray-700">{code.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                    {results[activeTab]}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {results && (
          <div className="mt-6 flex items-center p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-sm text-green-700">
              Audio processing completed successfully! Review all generated documents above.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;