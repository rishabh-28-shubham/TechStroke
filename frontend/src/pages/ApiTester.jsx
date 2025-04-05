import React, { useState } from 'react';
import ApiForm from '../components/ApiTester/ApiForm';
import ResponseView from '../components/ApiTester/ResponseView';
import HistoryList from '../components/ApiTester/HistoryList';
import axios from 'axios';
import { Zap } from 'lucide-react';

const ApiTester = () => {
  const [response, setResponse] = useState(null);
  const [history, setHistory] = useState([]);

  const handleSendRequest = async (request) => {
    setHistory([request, ...history]);

    try {
      const res = await axios({
        method: request.method,
        url: request.url,
        headers: request.headers,
        data: request.body,
      });
      setResponse(res.data);
    } catch (err) {
      setResponse({ error: err.message });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-[#6366F1] flex items-center justify-center gap-2">
          <Zap className="h-8 w-8" />
          API Tester
        </h1>
        <p className="text-gray-600">Test your APIs with an intuitive interface</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <ApiForm onSendRequest={handleSendRequest} />
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <ResponseView response={response} />
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-4">
            <h2 className="text-xl font-semibold text-[#6366F1] mb-4">History</h2>
            <HistoryList history={history} onSelect={handleSendRequest} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTester;
