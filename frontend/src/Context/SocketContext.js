import {io} from 'socket.io-client';

// Create a socket connection with error handling
let socket;
try {
  // Use environment variable for the server URL if available, otherwise use localhost
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
  
  socket = io(serverUrl, {
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    timeout: 20000,
    transports: ['websocket'],
    autoConnect: true,
    forceNew: true,
    withCredentials: true,
    path: '/socket.io',
    rejectUnauthorized: false,
    secure: true
  });
  
  // Add error handling
  socket.on('connect_error', (error) => {
    console.warn('Socket connection error:', error.message);
    // Try to reconnect with polling if websocket fails
    if (socket.io.opts.transports.length === 1) {
      console.log('Retrying with polling transport');
      socket.io.opts.transports = ['polling', 'websocket'];
    }
  });
  
  socket.on('connect_timeout', () => {
    console.warn('Socket connection timeout');
  });

  socket.on('connect', () => {
    console.log('Socket connected successfully');
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('Socket reconnected after', attemptNumber, 'attempts');
  });

  socket.on('reconnect_error', (error) => {
    console.error('Socket reconnection error:', error);
  });

  socket.on('reconnect_failed', () => {
    console.error('Socket reconnection failed after all attempts');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
} catch (error) {
  console.error('Failed to create socket connection:', error);
  // Create a dummy socket that doesn't do anything
  socket = {
    on: () => {},
    emit: () => {},
    connected: false,
  };
}

export default socket;