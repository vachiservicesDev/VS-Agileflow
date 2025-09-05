import { useState, useEffect, useCallback } from 'react';
import { RoomState, Participant, WebSocketMessage } from '@/types/room';
import { WebSocketManager } from '@/lib/websocket';

export const useRoom = (roomId: string, participantName: string) => {
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [ws, setWs] = useState<WebSocketManager | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const initializeRoom = useCallback(async (type: 'planning-poker' | 'retro-board') => {
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

    // Initialize WebSocket
    const wsManager = new WebSocketManager('ws://localhost:3001');
    await wsManager.connect();
    setWs(wsManager);
    setIsConnected(true);

    return initialRoomState;
  }, [roomId, participantName]);

  const joinRoom = useCallback(async () => {
    const storedRoom = localStorage.getItem(`room-${roomId}`);
    if (!storedRoom) {
      throw new Error('Room not found');
    }

    const roomData: RoomState = JSON.parse(storedRoom);
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

    // Initialize WebSocket
    const wsManager = new WebSocketManager('ws://localhost:3001');
    await wsManager.connect();
    setWs(wsManager);
    setIsConnected(true);

    return updatedRoom;
  }, [roomId, participantName]);

  const sendMessage = useCallback((type: string, payload: any) => {
    if (ws && participant) {
      const message: WebSocketMessage = {
        type: type as any,
        payload,
        roomId,
        participantId: participant.id
      };
      ws.send(message);
    }
  }, [ws, participant, roomId]);

  const updateRoomState = useCallback((updater: (prev: RoomState) => RoomState) => {
    setRoomState(prev => {
      if (!prev) return prev;
      const updated = updater(prev);
      localStorage.setItem(`room-${roomId}`, JSON.stringify(updated));
      return updated;
    });
  }, [roomId]);

  useEffect(() => {
    if (ws) {
      ws.on('participant-joined', (data) => {
        updateRoomState(prev => ({
          ...prev,
          participants: [...prev.participants, data.participant]
        }));
      });

      ws.on('vote-cast', (data) => {
        updateRoomState(prev => ({
          ...prev,
          votes: {
            ...prev.votes,
            [data.participantId]: data.vote
          }
        }));
      });

      ws.on('votes-revealed', () => {
        updateRoomState(prev => ({
          ...prev,
          votesRevealed: true
        }));
      });

      ws.on('note-added', (data) => {
        updateRoomState(prev => ({
          ...prev,
          notes: [...(prev.notes || []), data.note]
        }));
      });

      return () => {
        ws.off('participant-joined');
        ws.off('vote-cast');
        ws.off('votes-revealed');
        ws.off('note-added');
      };
    }
  }, [ws, updateRoomState]);

  return {
    roomState,
    participant,
    isConnected,
    initializeRoom,
    joinRoom,
    sendMessage,
    updateRoomState
  };
};