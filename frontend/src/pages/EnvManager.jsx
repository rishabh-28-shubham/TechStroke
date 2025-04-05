import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EnvList from '../components/EnviromentManager/EnvList';
import EnvForm from '../components/EnviromentManager/EnvForm';
import { Database } from 'lucide-react';
import { API_CONFIG } from '../config/config';

const EnvManager = () => {
  const [envVariables, setEnvVariables] = useState([]);

  // Fetch environment variables from the backend
  const fetchEnvVariables = async () => {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/env`);
      setEnvVariables(response.data);
    } catch (error) {
      console.error('Error fetching environment variables:', error);
    }
  };

  // Add a new environment variable to the state
  const addEnvVariable = (newEnv) => {
    setEnvVariables((prev) => [...prev, newEnv]);
  };

  // Update an environment variable
  const updateEnvVariable = (updatedEnv) => {
    setEnvVariables((prev) =>
      prev.map((env) => (env._id === updatedEnv._id ? updatedEnv : env))
    );
  };

  // Delete an environment variable
  const deleteEnvVariable = (id) => {
    setEnvVariables((prev) => prev.filter((env) => env._id !== id));
  };

  useEffect(() => {
    fetchEnvVariables(); // Fetch the initial data when the component mounts
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-[#6366F1] flex items-center justify-center gap-2">
          <Database className="h-8 w-8" />
          Environment Variable Manager
        </h1>
        <p className="text-gray-600">Securely manage your environment variables</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <EnvForm addEnvVariable={addEnvVariable} />
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <EnvList
              envVariables={envVariables}
              updateEnvVariable={updateEnvVariable}
              deleteEnvVariable={deleteEnvVariable}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvManager;
