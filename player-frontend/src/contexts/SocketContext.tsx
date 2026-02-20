import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { tokenManager } from '../lib/tokenManager';
import { useAuth } from './AuthContext';

interface SocketContextType {
  isConnected: boolean;
  socket: Socket | null;
}

interface BalanceUpdateEvent {
  userId: string;
  currency: string;
  balance: string;
  transactionType?: string;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Extract base URL from API URL (remove /api/v1 path)
const getSocketUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
  // Remove /api/v1 or similar paths to get the base server URL
  const url = new URL(apiUrl);
  return url.origin;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated, refreshWallet } = useAuth();

  const connect = useCallback(() => {
    const token = tokenManager.getAccessToken();
    if (!token) {
      console.log('[Socket] No access token available, skipping connection');
      return;
    }

    // Disconnect existing socket if any
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socketUrl = getSocketUrl();
    console.log('[Socket] Connecting to', socketUrl);

    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected with ID:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
      setIsConnected(false);
    });

    // Listen for wallet balance updates
    socket.on('wallet:balance_updated', (data: BalanceUpdateEvent) => {
      console.log('[Socket] Balance updated:', data);
      // Refresh wallet to get all balances
      refreshWallet();
    });

    socketRef.current = socket;
  }, [refreshWallet]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('[Socket] Disconnecting');
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Connect when authenticated, disconnect when not
  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, connect, disconnect]);

  // Reconnect when access token changes (after refresh)
  useEffect(() => {
    const handleTokenRefresh = () => {
      if (isAuthenticated && socketRef.current) {
        // Reconnect with new token
        connect();
      }
    };

    // Listen for storage events (token refresh in other tabs)
    window.addEventListener('storage', handleTokenRefresh);
    return () => window.removeEventListener('storage', handleTokenRefresh);
  }, [isAuthenticated, connect]);

  return (
    <SocketContext.Provider value={{ isConnected, socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
