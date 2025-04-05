import React, { useState } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';
import { API_CONFIG } from '../../config/config';

const SnippetForm = ({ onSnippetAdded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !code) {
      alert('Title and code are required');
      return;
    }

    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/snippets`, {
        title,
        description,
        code,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      });

      onSnippetAdded(response.data);
      setTitle('');
      setDescription('');
      setCode('');
      setTags('');
    } catch (error) {
      console.error('Error adding snippet:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6366F1] focus:border-transparent outline-none transition-all"
          placeholder="Enter snippet title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6366F1] focus:border-transparent outline-none transition-all"
          placeholder="Enter snippet description"
          rows="2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6366F1] focus:border-transparent outline-none transition-all font-mono"
          placeholder="Enter your code here"
          rows="6"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6366F1] focus:border-transparent outline-none transition-all"
          placeholder="Enter tags (comma-separated)"
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#5355E8] transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Snippet
      </button>
    </form>
  );
};

export default SnippetForm;