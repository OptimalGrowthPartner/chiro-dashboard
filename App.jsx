import React, { useState } from 'react';
import axios from 'axios';

const TABS = ['Transcript', 'SOAP Note', 'Referral Letter', 'Billing Codes'];

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Transcript');

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setData({});
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post(
        'https://chiro-backend-grfj.onrender.com/upload',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setData(response.data);
    } catch (err) {
      setError('Upload failed or processing error.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (!data.transcript) return <p className="text-sm text-gray-600">No results yet.</p>;
    switch (activeTab) {
      case 'Transcript': return <pre className="whitespace-pre-wrap">{data.transcript}</pre>;
      case 'SOAP Note': return <pre className="whitespace-pre-wrap">{data.soap_note}</pre>;
      case 'Referral Letter': return <pre className="whitespace-pre-wrap">{data.referral_letter}</pre>;
      case 'Billing Codes':
        return (
          <div>
            <strong>CPT Codes:</strong>
            <ul className="list-disc list-inside">
              {data.cpt_codes?.map((code, i) => <li key={i}>{code}</li>)}
            </ul>
            <strong>ICD-10 Codes:</strong>
            <ul className="list-disc list-inside">
              {data.icd10_codes?.map((code, i) => <li key={i}>{code}</li>)}
            </ul>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Chiropractor AI Dashboard</h1>
        <input type="file" accept="audio/*" onChange={(e) => setFile(e.target.files[0])} className="mb-4" />
        <button onClick={handleUpload} disabled={loading || !file} className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {loading ? 'Processing...' : 'Upload & Transcribe'}
        </button>
        {error && <p className="text-red-600 mt-4">{error}</p>}
        {data.transcript && (
          <div className="mt-6">
            <div className="flex gap-4 border-b mb-4">
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`py-2 px-4 ${activeTab === tab ? 'border-b-2 border-blue-600 font-semibold' : 'text-gray-600'}`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="bg-gray-100 p-4 rounded text-sm">{renderContent()}</div>
          </div>
        )}
      </div>
    </div>
  );
}
export default App;