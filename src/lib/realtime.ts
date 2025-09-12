import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

function resolveSocketUrl(): string {
  const meta = document.querySelector('meta[name="socket-url"]') as HTMLMetaElement | null;
  const metaUrl = meta?.content;
  const envUrl = (import.meta as any)?.env?.VITE_SOCKET_URL as string | undefined;
  const backendEnv = (import.meta as any)?.env?.VITE_BACKEND_URL as string | undefined;
  const winUrl = (window as any).__SOCKET_URL as string | undefined;
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
  const isProdHost = window.location.hostname.endsWith('freeagilepoker.com');
  socket = io(url, {
    // In production, force websocket to avoid CORS on XHR polling through proxies/CDNs
    transports: isProdHost ? ['websocket'] : ['polling', 'websocket'],
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

