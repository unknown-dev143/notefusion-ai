import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TestComponent = () => {
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    testBackendConnection();
  }, []);

  const testBackendConnection = async () => {
    try {
      const response = await axios.get('http://localhost:8000/');
      setBackendStatus('✅ Connected');
      setTestResults(prev => [...prev, { test: 'Backend Health Check', status: '✅ Passed', details: response.data }]);
    } catch (error) {
      setBackendStatus('❌ Failed');
      setTestResults(prev => [...prev, { test: 'Backend Health Check', status: '❌ Failed', details: error.message }]);
    }
  };

  const testSessionsAPI = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/sessions');
      setTestResults(prev => [...prev, { test: 'Sessions API', status: '✅ Passed', details: response.data }]);
    } catch (error) {
      setTestResults(prev => [...prev, { test: 'Sessions API', status: '❌ Failed', details: error.message }]);
    }
  };

  const testUploadAPI = async () => {
    try {
      const testFile = new File(['This is a test file'], 'test.txt', { type: 'text/plain' });
      const formData = new FormData();
      formData.append('file', testFile);

      const response = await axios.post('http://localhost:8000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTestResults(prev => [...prev, { test: 'Upload API', status: '✅ Passed', details: response.data }]);
    } catch (error) {
      setTestResults(prev => [...prev, { test: 'Upload API', status: '❌ Failed', details: error.message }]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">🧪 NoteFusion AI Test Dashboard</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Backend Status</h3>
        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
          backendStatus.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {backendStatus}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">API Tests</h3>
        <div className="space-y-2">
          <button
            onClick={testSessionsAPI}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
          >
            Test Sessions API
          </button>
          <button
            onClick={testUploadAPI}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Test Upload API
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Test Results</h3>
        <div className="space-y-2">
          {testResults.map((result, index) => (
            <div key={index} className="border rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{result.test}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  result.status.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {result.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <pre className="whitespace-pre-wrap">{JSON.stringify(result.details, null, 2)}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded">
        <h3 className="text-lg font-semibold mb-2">Quick Start Guide</h3>
        <div className="text-sm text-gray-700 space-y-1">
          <p>1. Ensure backend is running: <code className="bg-gray-200 px-1 rounded">py -m uvicorn main:app --reload</code></p>
          <p>2. Frontend should be running on: <code className="bg-gray-200 px-1 rounded">http://localhost:3000</code></p>
          <p>3. Backend API available at: <code className="bg-gray-200 px-1 rounded">http://localhost:8000</code></p>
          <p>4. Test the APIs using the buttons above</p>
        </div>
      </div>
    </div>
  );
};

export default TestComponent; 