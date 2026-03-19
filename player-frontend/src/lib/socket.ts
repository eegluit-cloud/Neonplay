import { io, Socket } from 'socket.io-client';

// Use dedicated socket URL if set, otherwise derive from API URL
const SOCKET_URL =
  (import.meta.env.VITE_SOCKET_URL as string) ||
  (import.meta.env.VITE_API_URL as string)?.replace('/api/v1', '') ||
  'http://localhost:4000';

let socket: Socket | null = null;

/** Connect the socket with an auth token. Safe to call multiple times. */
export function connectSocket(token: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('[Socket] Connection error:', err.message);
  });

  return socket;
}

/** Disconnect and clean up the socket. Called on logout. */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/** Get the current socket instance (may be null if not connected). */
export function getSocket(): Socket | null {
  return socket;
}
