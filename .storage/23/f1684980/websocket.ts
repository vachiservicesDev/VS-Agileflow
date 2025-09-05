import { WebSocketMessage } from '@/types/room';

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<string, (data: Record<string, unknown>) => void> = new Map();

  constructor(private url: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // For MVP, we'll simulate WebSocket with localStorage events
        // In production, this would connect to a real WebSocket server
        this.simulateWebSocket();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  private simulateWebSocket() {
    // Simulate WebSocket behavior using localStorage and custom events
    // This allows real-time updates within the same browser session
    window.addEventListener('storage', (event) => {
      if (event.key?.startsWith('room-message-')) {
        const message = JSON.parse(event.newValue || '{}');
        this.handleMessage(message);
      }
    });

    // Also listen for custom events for same-tab communication
    window.addEventListener('room-message', ((event: CustomEvent) => {
      this.handleMessage(event.detail);
    }) as EventListener);
  }

  private handleMessage(message: WebSocketMessage) {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message.payload);
    }
  }

  send(message: WebSocketMessage) {
    // Simulate sending message by storing in localStorage and dispatching event
    const messageKey = `room-message-${Date.now()}-${Math.random()}`;
    localStorage.setItem(messageKey, JSON.stringify(message));
    
    // Dispatch custom event for same-tab communication
    window.dispatchEvent(new CustomEvent('room-message', { detail: message }));
    
    // Clean up old messages
    setTimeout(() => {
      localStorage.removeItem(messageKey);
    }, 1000);
  }

  on(messageType: string, handler: (data: Record<string, unknown>) => void) {
    this.messageHandlers.set(messageType, handler);
  }

  off(messageType: string) {
    this.messageHandlers.delete(messageType);
  }

  disconnect() {
    this.messageHandlers.clear();
  }
}

export const generateRoomId = (): string => {
  return crypto.randomUUID().slice(0, 8).toUpperCase();
};

export const generateParticipantId = (): string => {
  return crypto.randomUUID();
};