import React, { useState } from 'react';
import axios from 'axios';
import mermaid from 'mermaid';
import FileExplorer from '../Documentation/FileExplorer';

const API_BASE_URL = 'http://localhost:5000';

const DiagramGenerator = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [diagramType, setDiagramType] = useState('flowchart');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandingFolder, setExpandingFolder] = useState(false);

  const extractRepoInfo = (url) => {
    const parts = url
      .replace('https://github.com/', '')
      .replace('http://github.com/', '')
      .split('/');
    return { owner: parts[0], repo: parts[1] };
  };

  const fetchRepository = async () => {
    try {
      setLoading(true);
      setError(null);
      setFiles([]);
      setSelectedFiles([]);
      
      if (!repoUrl.includes('github.com')) {
        throw new Error('Please enter a valid GitHub repository URL');
      }

      const cleanUrl = repoUrl.trim();
      const { owner, repo } = extractRepoInfo(cleanUrl);

      if (!owner || !repo) {
        throw new Error('Invalid GitHub repository URL format. Please use: https://github.com/owner/repo');
      }

      const response = await axios.post(`${API_BASE_URL}/api/documentation/fetch-repo`, {
        repoUrl: cleanUrl
      });

      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching repository:', error);
      let errorMessage = 'Failed to fetch repository';
      
      if (error.response?.status === 403) {
        errorMessage = 'GitHub API rate limit exceeded. Please try again later.';
      } else if (error.response?.status === 401) {
        errorMessage = 'GitHub authentication failed. Please check your GitHub token.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Repository not found. Please check if it exists and is accessible.';
      } else {
        errorMessage = error.response?.data?.message || error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolderContent = async (file) => {
    try {
      setExpandingFolder(true);
      const { owner, repo } = extractRepoInfo(repoUrl);
      
      const response = await axios.post(`${API_BASE_URL}/api/documentation/fetch-file`, {
        owner,
        repo,
        path: file.path
      });

      // Update the files state by adding the new files to the correct folder
      setFiles(prevFiles => {
        const updateFilesRecursively = (files, path, newContent) => {
          return files.map(f => {
            if (f.path === path) {
              return {
                ...f,
                children: Array.isArray(newContent) ? newContent : [newContent]
              };
            }
            if (f.children) {
              return {
                ...f,
                children: updateFilesRecursively(f.children, path, newContent)
              };
            }
            return f;
          });
        };

        return updateFilesRecursively(prevFiles, file.path, response.data);
      });
    } catch (error) {
      console.error('Error fetching folder content:', error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setExpandingFolder(false);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFiles(
      selectedFiles.includes(file.path)
        ? selectedFiles.filter(p => p !== file.path)
        : [...selectedFiles, file.path]
    );
  };

  const generateDiagram = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get selected files data
      const selectedFileData = files.filter(file => 
        selectedFiles.includes(file.path)
      );

      // Generate diagram directly from the files
      const diagramResponse = await axios.post(`${API_BASE_URL}/api/diagram/generate`, {
        files: selectedFileData,
        diagramType
      });

      if (diagramResponse.data.success) {
        // Render the diagram
        const element = document.querySelector("#diagram-container");
        const { svg } = await mermaid.render('diagram', diagramResponse.data.mermaidCode);
        element.innerHTML = svg;
      }
    } catch (error) {
      console.error('Error generating diagram:', error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="Enter GitHub repository URL (e.g., https://github.com/owner/repo)"
          className="w-full p-2 border rounded"
        />
        <button
          onClick={fetchRepository}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          disabled={loading || !repoUrl.trim()}
        >
          {loading ? 'Fetching...' : 'Fetch Repository'}
        </button>
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="flex gap-4">
          <div className="w-[30%] relative">
            {expandingFolder && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}
            <FileExplorer 
              files={files}
              onFileSelect={handleFileSelect}
              selectedFiles={selectedFiles}
              onFileContent={fetchFolderContent}
            />
          </div>

          <div className="w-[70%]">
            <div className="diagram-controls mb-4">
              <label className="block mb-2">Diagram Type:</label>
              <select 
                value={diagramType} 
                onChange={(e) => setDiagramType(e.target.value)}
                className="p-2 border rounded mr-4"
              >
                <option value="flowchart">Flowchart</option>
                <option value="class">Class Diagram</option>
                <option value="sequence">Sequence Diagram</option>
              </select>
              <button
                onClick={generateDiagram}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
                disabled={loading || selectedFiles.length === 0}
              >
                {loading ? 'Generating...' : `Generate Diagram (${selectedFiles.length} files selected)`}
              </button>
            </div>

            <div id="diagram-container" className="diagram-container bg-white p-4 rounded shadow"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagramGenerator;