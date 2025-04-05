// src/components/EnvironmentManager/EnvItem.jsx
import { useState } from 'react';
import axios from 'axios';
import React from 'react';
import { Pencil, Trash2, Save, Key } from 'lucide-react';
import { API_CONFIG } from '../../config/config';

const EnvItem = ({ env, updateEnvVariable, deleteEnvVariable }) => {
  const { _id, name, value } = env;
  const [isEditing, setIsEditing] = useState(false);
  const [newValue, setNewValue] = useState(value);

  const handleEdit = async () => {
    try {
      const response = await axios.put(
        ${API_CONFIG.BASE_URL}/api/env/${env._id},
        { value: newValue }
      );
      updateEnvVariable(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating environment variable:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(${API_CONFIG.BASE_URL}/api/env/${name});
      deleteEnvVariable(_id);
    } catch (error) {
      console.error('Error deleting environment variable:', error);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:shadow-sm transition-all">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-[#6366F1]" />
              <span className="font-medium text-gray-900">{name}</span>
            </div>
            {!isEditing && (
              <div className="text-gray-600 font-mono text-sm pl-6">{value}</div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-600 hover:text-[#6366F1] rounded-full hover:bg-gray-100 transition-colors"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-600 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
        
        {isEditing && (
          <div className="space-y-3 pl-6">
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6366F1] focus:border-transparent outline-none transition-all font-mono text-sm"
              placeholder="Enter new value"
            />
            <button
              onClick={handleEdit}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#5355E8] transition-colors"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnvItem;