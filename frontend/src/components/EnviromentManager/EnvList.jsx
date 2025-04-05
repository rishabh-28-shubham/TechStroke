// src/components/EnvironmentManager/EnvList.jsx
import React from 'react';
import EnvItem from './EnvItem';
import { List } from 'lucide-react';

const EnvList = ({ envVariables, updateEnvVariable, deleteEnvVariable }) => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-[#6366F1] mb-6 flex items-center gap-2">
        <List className="h-5 w-5" />
        Environment Variables
      </h2>
      <div className="space-y-4">
        {envVariables.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No environment variables found. Add one to get started.
          </div>
        ) : (
          envVariables.map((env) => (
            <EnvItem
              key={env._id}
              env={env}
              updateEnvVariable={updateEnvVariable}
              deleteEnvVariable={deleteEnvVariable}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default EnvList;
