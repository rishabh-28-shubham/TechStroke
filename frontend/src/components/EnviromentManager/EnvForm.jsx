import {useState } from 'react';
import axios from 'axios';
import React from 'react';
import { Plus } from 'lucide-react';
import { API_CONFIG } from '../../config/config';

const EnvForm = ({ addEnvVariable }) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !value) {
      alert('Both fields are required');
      return;
    }

    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/env`, { name, value });
      addEnvVariable(response.data);
      setName('');
      setValue('');
    } catch (error) {
      console.error('Error adding environment variable:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <h2 className="text-xl font-semibold text-[#6366F1] mb-6 flex items-center gap-2">
        <Plus className="h-5 w-5" />
        Add New Variable
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6366F1] focus:border-transparent outline-none transition-all"
            placeholder="Enter variable name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6366F1] focus:border-transparent outline-none transition-all"
            placeholder="Enter value"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#6366F1] text-white px-4 py-2 rounded-lg hover:bg-[#5355E8] transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Variable
        </button>
      </div>
    </form>
  );
};

export default EnvForm;