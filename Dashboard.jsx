import React, { useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setTranscript('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        'https://chiro-backend-grfj.onrender.com/upload',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setTranscript(response.data.transcript);
    } catch (err) {
      setError('Upload failed or transcription error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-6">
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

        {transcript && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Transcript:</h2>
            <p className="bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap">{transcript}</p>
          </div>
        )}

        {error && <p className="text-red-600 mt-4">{error}</p>}
      </div>
    </div>
  );
}
