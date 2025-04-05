import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SnippetItem from './SnippetItem';
import SnippetForm from './SnippetForm';
import { Plus, Code2 } from 'lucide-react';
import { API_CONFIG } from '../../config/config';

const SnippetList = () => {
  const [snippets, setSnippets] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchSnippets();
  }, []);

  const fetchSnippets = async () => {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/snippets`);
      setSnippets(response.data);
    } catch (error) {
      console.error('Error fetching snippets:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_CONFIG.BASE_URL}/api/snippets/${id}`);
      setSnippets(snippets.filter(snippet => snippet._id !== id));
    } catch (error) {
      console.error('Error deleting snippet:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="p-6">
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#5355E8] transition-colors duration-200 flex items-center justify-center gap-2 mb-4"
            >
              <Plus className="h-5 w-5" />
              {showForm ? 'Close Form' : 'Add New Snippet'}
            </button>
            {showForm && <SnippetForm onSnippetAdded={fetchSnippets} />}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-[#6366F1] flex items-center gap-2 mb-6">
              <Code2 className="h-5 w-5" />
              Your Snippets
            </h2>
            <div className="space-y-4">
              {snippets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No snippets found. Add one to get started.
                </div>
              ) : (
                snippets.map((snippet) => (
                  <SnippetItem
                    key={snippet._id}
                    snippet={snippet}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnippetList;
