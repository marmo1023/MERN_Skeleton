// Socket.IO setup for real-time communication
import React, { createContext } from 'react';
import io from 'socket.io-client';

// Create context for Socket.IO instance
export const SocketContext = createContext();

// Initialize Socket.IO client connection to backend
const socket = io('http://localhost:5000', { withCredentials: true });

// Provider component to make socket available to all components
export function SocketProvider({ children }) {
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}