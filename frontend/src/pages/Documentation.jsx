import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import FileExplorer from '../components/Documentation/FileExplorer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import '../styles/documentation.css';

const API_BASE_URL = 'http://localhost:5000';
const socket = io(API_BASE_URL);

const Documentation = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [files, setFiles] = useState([]);
  const [documentation, setDocumentation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileContent, setFileContent] = useState(null);
  const [expandingFolder, setExpandingFolder] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [userName, setUserName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [typingUser, setTypingUser] = useState('');
  const [isConnected, setIsConnected] = useState(false);

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
      setFileContent(null);
      
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
      
      if (roomId) {
        socket.emit('repoFetched', { 
          roomId, 
          files: response.data, 
          repoUrl: cleanUrl 
        });
      }
    } catch (error) {
      console.error('Error fetching repository:', error);
      let errorMessage = 'Failed to fetch repository';
      
      if (error.response?.status === 403) {
        errorMessage = 'GitHub API rate limit exceeded. Please try again later or contact the administrator.';
      } else if (error.response?.status === 401) {
        errorMessage = 'GitHub authentication failed. Please check your GitHub token configuration.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Repository not found. Please check if the repository exists and is accessible.';
      } else {
        errorMessage = error.response?.data?.message || error.message || 'Failed to fetch repository';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchFileContent = async (file) => {
    try {
      setLoading(true);
      const { owner, repo } = extractRepoInfo(repoUrl);
      
      const response = await axios.post(`${API_BASE_URL}/api/documentation/fetch-file`, {
        owner,
        repo,
        path: file.path
      });

      const newFileContent = {
        path: file.path,
        content: response.data.content
      };

      setFileContent(newFileContent);

      if (roomId) {
        socket.emit('fileContentFetched', { roomId, fileContent: newFileContent });
      }
    } catch (error) {
      console.error('Error fetching file content:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch file content');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file) => {
    const newSelectedFiles = selectedFiles.includes(file.path)
      ? selectedFiles.filter(p => p !== file.path)
      : [...selectedFiles, file.path];
    
    setSelectedFiles(newSelectedFiles);
    
    if (roomId) {
      socket.emit('filesSelected', { roomId, selectedFiles: newSelectedFiles });
    }
  };

  const generateDocumentation = async () => {
    try {
      setLoading(true);
      setError(null);
      setDocumentation('');
      
      const selectedFileData = files.filter(file => 
        selectedFiles.includes(file.path)
      );

      const response = await axios.post(`${API_BASE_URL}/api/documentation/generate`, {
        repoUrl,
        files: selectedFileData
      }, {
        timeout: 30000
      });
      
      setDocumentation(response.data.documentation);

      if (roomId) {
        socket.emit('documentationGenerated', { 
          roomId, 
          documentation: response.data.documentation 
        });
      }
    } catch (error) {
      console.error('Full error:', error);
      let errorMessage = 'Failed to generate documentation';
      if (error.response) {
        errorMessage = error.response.data?.message || 
                      error.response.data?.error ||
                      JSON.stringify(error.response.data);
      } else if (error.request) {
        errorMessage = 'No response from server. Check your connection.';
      } else {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const downloadDocumentation = () => {
    try {
      const blob = new Blob([documentation], { type: 'text/markdown' });
      
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `documentation-${new Date().toISOString().split('T')[0]}.md`;
      
      document.body.appendChild(a);
      a.click();
      
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading documentation:', error);
      setError('Failed to download documentation');
    }
  };

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('docUsersUpdate', (users) => {
      setCollaborators(users);
    });

    socket.on('docContentUpdate', ({ content, userName }) => {
      setEditableContent(content);
      setDocumentation(content);
    });

    socket.on('docUserTyping', (user) => {
      setTypingUser(user);
      setTimeout(() => setTypingUser(''), 1000);
    });

    socket.on('syncRoomState', ({ users, content, repoFiles, selectedFiles, repoUrl, fileContent }) => {
      setCollaborators(users);
      if (content) setDocumentation(content);
      if (repoFiles.length > 0) setFiles(repoFiles);
      if (selectedFiles.length > 0) setSelectedFiles(selectedFiles);
      if (repoUrl) setRepoUrl(repoUrl);
      if (fileContent) setFileContent(fileContent);
    });

    socket.on('repoUpdate', ({ files, repoUrl }) => {
      setFiles(files);
      setRepoUrl(repoUrl);
    });

    socket.on('selectedFilesUpdate', (selectedFiles) => {
      setSelectedFiles(selectedFiles);
    });

    socket.on('fileContentUpdate', (fileContent) => {
      setFileContent(fileContent);
    });

    socket.on('documentationUpdate', (documentation) => {
      setDocumentation(documentation);
      setEditableContent(documentation);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('docUsersUpdate');
      socket.off('docContentUpdate');
      socket.off('docUserTyping');
      socket.off('syncRoomState');
      socket.off('repoUpdate');
      socket.off('selectedFilesUpdate');
      socket.off('fileContentUpdate');
      socket.off('documentationUpdate');
    };
  }, []);

  const joinCollaboration = () => {
    if (userName && roomId) {
      socket.emit('joinDocRoom', { roomId, userName });
    }
  };

  const toggleEditMode = () => {
    if (!isEditing) {
      setEditableContent(documentation);
    } else {
      setDocumentation(editableContent);
      socket.emit('docContentChange', { roomId, content: editableContent, userName });
    }
    setIsEditing(!isEditing);
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setEditableContent(newContent);
    
    socket.emit('docUserTyping', { roomId, userName });
    
    setTimeout(() => {
      socket.emit('docContentChange', { roomId, content: newContent, userName });
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (roomId && userName) {
        socket.emit('leaveDocRoom', { roomId, userName });
      }
    };
  }, [roomId, userName]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4">
        <div className="mb-4 flex gap-4 items-center bg-white p-4 rounded shadow">
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name"
            className="p-2 border rounded"
          />
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter room ID"
            className="p-2 border rounded"
          />
          <button
            onClick={joinCollaboration}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            disabled={!userName || !roomId}
          >
            Join Collaboration
          </button>
          {isConnected && (
            <span className="text-green-500">Connected</span>
          )}
        </div>

        {collaborators.length > 0 && (
          <div className="mb-4 p-2 bg-gray-100 rounded">
            <span className="font-semibold">Collaborators: </span>
            {collaborators.join(', ')}
          </div>
        )}

        {typingUser && (
          <div className="mb-4 text-gray-600 italic">
            {typingUser} is typing...
          </div>
        )}

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
          
          {error && (
            <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

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
                onFileContent={fetchFileContent}
              />
            </div>

            <div className="w-[70%]">
              <div className="bg-white p-4 rounded shadow mb-4">
                <div className="flex justify-between mb-4">
                  <button
                    onClick={generateDocumentation}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
                    disabled={loading || selectedFiles.length === 0}
                  >
                    {loading ? 'Generating...' : `Generate Documentation (${selectedFiles.length} files selected)`}
                  </button>
                  {documentation && (
                    <button
                      onClick={downloadDocumentation}
                      className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                    >
                      Download Documentation
                    </button>
                  )}
                </div>

                {fileContent && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">File Preview: {fileContent.path}</h3>
                    <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                      <code>{fileContent.content}</code>
                    </pre>
                  </div>
                )}

                {loading && (
                  <div className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                )}
                
                {documentation && (
                  <div className="prose prose-lg max-w-none dark:prose-invert bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={toggleEditMode}
                        className={`px-4 py-2 rounded ${
                          isEditing 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : 'bg-blue-500 hover:bg-blue-600'
                        } text-white`}
                      >
                        {isEditing ? 'Save Changes' : 'Edit Documentation'}
                      </button>
                    </div>

                    {isEditing ? (
                      <textarea
                        value={editableContent}
                        onChange={handleContentChange}
                        className="w-full h-[600px] p-4 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ 
                          resize: 'vertical',
                          minHeight: '300px',
                          backgroundColor: '#1f2937',
                          color: '#e5e7eb'
                        }}
                      />
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw, rehypeHighlight]}
                        components={{
                          root: ({ children }) => <div className="markdown-body">{children}</div>,
                          code: ({ node, inline, className, children, ...props }) => {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <pre>
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {documentation}
                      </ReactMarkdown>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Documentation; 