import { io, Socket } from 'socket.io-client';

/**
 * Interface for import.meta environment variables
 */
interface ImportMetaEnv {
  VITE_SOCKET_URL?: string;
  VITE_BACKEND_URL?: string;
}

/**
 * Interface for import.meta object
 */
interface ImportMeta {
  env?: ImportMetaEnv;
}

/**
 * Interface for window object with socket URL
 */
interface WindowWithSocketUrl extends Window {
  __SOCKET_URL?: string;
}

let socket: Socket | null = null;

function resolveSocketUrl(): string {
  const meta = document.querySelector('meta[name="socket-url"]') as HTMLMetaElement | null;
  const metaUrl = meta?.content;
  const envUrl = (import.meta as ImportMeta)?.env?.VITE_SOCKET_URL;
  const backendEnv = (import.meta as ImportMeta)?.env?.VITE_BACKEND_URL;
  const winUrl = (window as WindowWithSocketUrl).__SOCKET_URL;
  const hardFallback = 'https://vs-agileflow.onrender.com';

  // Prefer explicit envs/meta/window override
  const candidate = envUrl || winUrl || metaUrl || backendEnv;
  if (candidate && typeof candidate === 'string' && candidate.startsWith('http')) {
    return candidate;
  }

  // If served from freeagilepoker.com, default to Render realtime server
  if (window.location.hostname.endsWith('freeagilepoker.com')) {
    return hardFallback;
  }

  // Otherwise, same-origin (useful for local dev)
  return window.location.origin;
}

export function getSocket(): Socket {
  if (socket) return socket;
  const url = resolveSocketUrl();
  socket = io(url, {
    // Prefer polling first; upgrade to websocket when available
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
    withCredentials: false,
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

