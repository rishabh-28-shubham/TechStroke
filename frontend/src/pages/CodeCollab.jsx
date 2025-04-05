import React, { useEffect, useState } from 'react'
import Join from '../components/CodeEditor/Join';
import Editor from '@monaco-editor/react'
import { ClipboardCopy, Users, Type, Code, LogOut, Play, Share2, Terminal, Loader2, AlertCircle } from "lucide-react"
import socket from '../Context/SocketContext';

const CodeCollab = () => {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// start code here");
  const [copySuccess, setCopySuccess] = useState("");
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState("");
  const [output, setOutput] = useState("");
  const [version, setVersion] = useState("*");
  const [connected, setConnected] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [connectionError, setConnectionError] = useState("");

  // Socket connection status
  useEffect(() => {
    const handleConnect = () => {
      setConnected(true);
      setConnectionError("");
      console.log('Socket connected');
      if (roomId) {
        socket.emit('rejoinRoom', { roomId, userName });
      }
    };

    const handleDisconnect = () => {
      setConnected(false);
      setConnectionError("Disconnected from server. Trying to reconnect...");
      console.log('Socket disconnected');
    };

    const handleConnectError = (error) => {
      setConnected(false);
      setConnectionError(`Connection error: ${error.message}. Please check if the server is running.`);
      console.error('Connection error:', error);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    // Check initial connection status
    setConnected(socket.connected);
    if (!socket.connected) {
      setConnectionError("Not connected to server. Please check if the server is running.");
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, [roomId, userName]);

  // Room events
  useEffect(() => {
    const handleUserJoined = (users) => {
      setUsers(users);
    };

    const handleCodeUpdate = (newCode) => {
      setCode(newCode);
    };

    const handleUserTyping = (user) => {
      setTyping(`${user} is typing...`);
      setTimeout(() => setTyping(""), 2000);
    };

    const handleLanguageUpdate = (newLanguage) => {
      setLanguage(newLanguage);
    };

    const handleCodeResponse = (response) => {
      setIsCompiling(false);
      if (response && response.run) {
        setOutput(response.run.output || 'No output');
      } else {
        setOutput('Error: Invalid response format');
      }
    };

    socket.on("userJoined", handleUserJoined);
    socket.on("codeUpdate", handleCodeUpdate);
    socket.on("userTyping", handleUserTyping);
    socket.on("languageUpdate", handleLanguageUpdate);
    socket.on('codeResponse', handleCodeResponse);

    return () => {
      socket.off('userJoined', handleUserJoined);
      socket.off('codeUpdate', handleCodeUpdate);
      socket.off('userTyping', handleUserTyping);
      socket.off('languageUpdate', handleLanguageUpdate);
      socket.off('codeResponse', handleCodeResponse);
    };
  }, []);

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (roomId) {
        socket.emit("leaveRoom", { roomId, userName });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [roomId, userName]);

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopySuccess("Copied");
    setTimeout(() => setCopySuccess(""), 2000);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (connected && roomId) {
      socket.emit("codeChange", { roomId, code: newCode });
      socket.emit("typing", { roomId, userName });
    }
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    if (connected && roomId) {
      socket.emit("languageChange", { roomId, language: newLanguage });
    }
  };

  const leaveRoom = () => {
    if (connected && roomId) {
      socket.emit("leaveRoom", { roomId, userName });
    }
    setJoined(false);
    setRoomId("");
    setUserName("");
    setCode("// start code here");
    setLanguage("javascript");
    setUsers([]);
    setOutput("");
  };

  const runCode = () => {
    if (connected && roomId) {
      setIsCompiling(true);
      socket.emit("compileCode", { code, roomId, language, version });
      setOutput("Compiling...");
    } else {
      setOutput("Error: Not connected to server. Please check your connection.");
    }
  };

  if (!joined) {
    return <div>
      <Join joined={joined} setJoined={setJoined} roomId={roomId} setRoomId={setRoomId} userName={userName} setUserName={setUserName} />
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {connectionError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{connectionError}</p>
        </div>
      )}
      <div className="flex h-[calc(100vh-2rem)] m-4 gap-4">
        {/* Sidebar */}
        <div className="w-80 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="p-6 space-y-6">
            {/* Room Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#6366F1] flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Room Information
              </h2>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Room Code</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={roomId}
                    readOnly
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm font-mono"
                  />
                  <div className="relative">
                    <button
                      onClick={copyRoomId}
                      className="p-2 text-gray-600 hover:text-[#6366F1] rounded-lg hover:bg-gray-50 transition-colors"
                      title="Copy Room ID"
                    >
                      <ClipboardCopy className="h-5 w-5" />
                    </button>
                    {copySuccess && (
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-3 py-1 text-sm text-white bg-[#6366F1] rounded-lg">
                        {copySuccess}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">{connected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>

            {/* Users List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#6366F1] flex items-center gap-2">
                <Users className="h-5 w-5" />
                Collaborators
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <ul className="space-y-2">
                  {users.map((user, index) => (
                    user && (
                      <li key={index} className="flex items-center gap-2 text-gray-700">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        {user.slice(0, 12)}...
                      </li>
                    )
                  ))}
                </ul>
              </div>
              {typing && (
                <p className="flex items-center gap-2 text-gray-600 text-sm italic">
                  <Type className="h-4 w-4 animate-pulse" />
                  {typing}
                </p>
              )}
            </div>

            {/* Language Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#6366F1] flex items-center gap-2">
                <Code className="h-5 w-5" />
                Language
              </h3>
              <select
                value={language}
                onChange={handleLanguageChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-[#6366F1] focus:border-transparent outline-none transition-all"
              >
                <option value="javascript">Javascript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>

            {/* Leave Room Button */}
            <button 
              onClick={leaveRoom} 
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <LogOut className="h-5 w-5" />
              Leave Room
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Editor */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage={language}
              language={language}
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                padding: { top: 20 },
              }}
            />
          </div>

          {/* Console */}
          <div className="h-1/3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#6366F1] flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Console
                </h3>
                <button
                  onClick={runCode}
                  disabled={isCompiling || !connected}
                  className={`px-4 py-2 bg-[#6366F1] text-white rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                    (isCompiling || !connected) ? 'opacity-75 cursor-not-allowed' : 'hover:bg-[#5355E8]'
                  }`}
                >
                  {isCompiling ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Compiling...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Execute
                    </>
                  )}
                </button>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 h-[calc(100%-4rem)] overflow-auto">
                <pre className="font-mono text-sm text-gray-100">
                  {output || "Output will appear here..."}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodeCollab