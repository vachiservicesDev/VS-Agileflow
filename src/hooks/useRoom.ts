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

  // Persist participantId per room/name within this browser session to avoid duplicates on retries
  const getOrCreateParticipantId = useCallback((): string => {
    const key = `room-${roomId}-participant-${participantName}`;
    try {
      const existing = sessionStorage.getItem(key);
      if (existing) return existing;
      const generated = crypto.randomUUID();
      sessionStorage.setItem(key, generated);
      return generated;
    } catch {
      // Fallback if sessionStorage is unavailable
      return crypto.randomUUID();
    }
  }, [roomId, participantName]);

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
    const stableParticipantId = getOrCreateParticipantId();

    return withRetry(async () => {
      return withLock(`room-${roomId}`, async () => {
        const storedRoom = localStorage.getItem(`room-${roomId}`);
        if (!storedRoom) {
          // Trigger retry path until host finishes creating the room
          throw new Error('Room not found');
        }

        // Always work off the latest room snapshot
        const latestRoom: RoomState = JSON.parse(storedRoom);

        // If participant with this name already exists, attach and return
        const byName = latestRoom.participants.find(p => p.name === participantName);
        if (byName && !byName.isHost) {
          setRoomState(latestRoom);
          setParticipant(byName);
          setIsConnected(true);
          return latestRoom;
        }

        const newParticipant: Participant = {
          id: byName?.id || stableParticipantId,
          name: participantName,
          isHost: false
        };

        // Merge participant ensuring id/name uniqueness (id takes precedence)
        const hasIdAlready = latestRoom.participants.some(p => p.id === newParticipant.id);
        const hasNameAlready = latestRoom.participants.some(p => p.name === newParticipant.name && !p.isHost);
        const participantsMerged: Participant[] = hasIdAlready || hasNameAlready
          ? latestRoom.participants
          : [...latestRoom.participants, newParticipant];

        const updatedRoom: RoomState = {
          ...latestRoom,
          participants: participantsMerged
        };

        // Write and verify to mitigate concurrent write stomping
        localStorage.setItem(`room-${roomId}`, JSON.stringify(updatedRoom));

        const verifyStored = localStorage.getItem(`room-${roomId}`);
        if (verifyStored) {
          const verified: RoomState = JSON.parse(verifyStored);
          const present = verified.participants.some(p => p.id === newParticipant.id || p.name === newParticipant.name);
          if (!present) {
            // Another tab overwrote our write; request a retry
            throw new Error('Join conflict, retrying');
          }
          setRoomState(verified);
          const attached = verified.participants.find(p => p.id === newParticipant.id || p.name === newParticipant.name) || newParticipant;
          setParticipant(attached);
          setIsConnected(true);
          return verified;
        }

        // Should not happen; ask for retry
        throw new Error('Verification failed');
      });
    }, 6, 80);
  }, [roomId, participantName, getOrCreateParticipantId]);

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