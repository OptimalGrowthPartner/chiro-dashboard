import React, { useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [soapNote, setSoapNote] = useState('');
  const [referralLetter, setReferralLetter] = useState('');
  const [codes, setCodes] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Transcript');

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        'https://chiro-backend-grfj.onrender.com/upload',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setTranscript(response.data.transcript);
      setSoapNote(response.data.soap_note);
      setReferralLetter(response.data.referral_letter);
      setCodes(response.data.codes);
    } catch (err) {
      setError('Upload failed or transcription error.');
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Transcript':
        return transcript;
      case 'SOAP Note':
        return soapNote;
      case 'Referral Letter':
        return referralLetter;
      case 'Codes':
        return codes;
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Chiropractor AI Dashboard</h1>

        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4"
        />

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Transcribing...' : 'Upload & Transcribe'}
        </button>

        {error && <p className="text-red-600 mt-4">{error}</p>}

        {(transcript || soapNote || referralLetter || codes) && (
          <div className="mt-6">
            <div className="flex space-x-4 mb-4">
              {['Transcript', 'SOAP Note', 'Referral Letter', 'Codes'].map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 rounded ${
                    activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <pre className="bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap">
              {renderTabContent()}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}