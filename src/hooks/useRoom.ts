import { useState, useCallback } from 'react';
import { RoomState, Participant } from '@/types/room';

// Simple locking mechanism for localStorage operations
const lockMap = new Map<string, Promise<void>>();

const withLock = async <T>(key: string, operation: () => Promise<T>): Promise<T> => {
  // Wait for any existing lock on this key
  if (lockMap.has(key)) {
    await lockMap.get(key);
  }

  // Create a new lock
  let resolveLock: () => void;
  const lockPromise = new Promise<void>((resolve) => {
    resolveLock = resolve;
  });
  lockMap.set(key, lockPromise);

  try {
    const result = await operation();
    return result;
  } finally {
    // Release the lock
    lockMap.delete(key);
    resolveLock!();
  }
};

// Retry operation with exponential backoff
const withRetry = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 100
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 50;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

export const useRoom = (roomId: string, participantName: string) => {
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const initializeRoom = useCallback(async (type: 'planning-poker' | 'retro-board') => {
    return withLock(`room-${roomId}`, async () => {
      const participantId = crypto.randomUUID();
      const newParticipant: Participant = {
        id: participantId,
        name: participantName,
        isHost: true
      };

      const initialRoomState: RoomState = {
        id: roomId,
        type,
        participants: [newParticipant],
        host: participantId,
        createdAt: new Date(),
        votes: {},
        votesRevealed: false,
        columns: type === 'retro-board' ? [
          { id: '1', title: 'What Went Well', color: 'bg-green-100' },
          { id: '2', title: 'What to Improve', color: 'bg-yellow-100' },
          { id: '3', title: 'Action Items', color: 'bg-blue-100' }
        ] : undefined,
        notes: []
      };

      // Store room state in localStorage for persistence across page refreshes
      localStorage.setItem(`room-${roomId}`, JSON.stringify(initialRoomState));
      
      setRoomState(initialRoomState);
      setParticipant(newParticipant);
      setIsConnected(true);

      return initialRoomState;
    });
  }, [roomId, participantName]);

  const joinRoom = useCallback(async () => {
    return withRetry(async () => {
      return withLock(`room-${roomId}`, async () => {
        const storedRoom = localStorage.getItem(`room-${roomId}`);
        if (!storedRoom) {
          throw new Error('Room not found');
        }

        const roomData: RoomState = JSON.parse(storedRoom);
        
        // Check if participant with this name already exists
        const existingParticipant = roomData.participants.find(p => p.name === participantName);
        if (existingParticipant && !existingParticipant.isHost) {
          // If participant already exists, just return the room state
          setRoomState(roomData);
          setParticipant(existingParticipant);
          setIsConnected(true);
          return roomData;
        }
        
        const participantId = crypto.randomUUID();
        const newParticipant: Participant = {
          id: participantId,
          name: participantName,
          isHost: false
        };

        const updatedRoom = {
          ...roomData,
          participants: [...roomData.participants, newParticipant]
        };

        localStorage.setItem(`room-${roomId}`, JSON.stringify(updatedRoom));
        setRoomState(updatedRoom);
        setParticipant(newParticipant);
        setIsConnected(true);

        return updatedRoom;
      });
    });
  }, [roomId, participantName]);

  const sendMessage = useCallback((type: string, payload: any) => {
    // Mock WebSocket message sending for demo purposes
    console.log('Mock send message:', type, payload);
  }, []);

  const updateRoomState = useCallback((updater: (prev: RoomState) => RoomState) => {
    setRoomState(prev => {
      if (!prev) return prev;
      const updated = updater(prev);
      localStorage.setItem(`room-${roomId}`, JSON.stringify(updated));
      return updated;
    });
  }, [roomId]);

  const checkRoomExists = useCallback(() => {
    try {
      const storedRoom = localStorage.getItem(`room-${roomId}`);
      return !!storedRoom;
    } catch (error) {
      return false;
    }
  }, [roomId]);

  const getRoomInfo = useCallback(() => {
    try {
      const storedRoom = localStorage.getItem(`room-${roomId}`);
      if (!storedRoom) return null;
      return JSON.parse(storedRoom) as RoomState;
    } catch (error) {
      return null;
    }
  }, [roomId]);

  return {
    roomState,
    participant,
    isConnected,
    initializeRoom,
    joinRoom,
    sendMessage,
    updateRoomState,
    checkRoomExists,
    getRoomInfo
  };
};