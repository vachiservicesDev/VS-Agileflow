import { useState, useCallback, useEffect } from 'react';
import { 
  RoomState, 
  Participant, 
  WebSocketMessageType,
  JoinRoomPayload,
  VotePayload,
  NotePayload,
  DeleteNotePayload,
  SetStoryPayload
} from '@/types/room';
import { getSocket } from '@/lib/realtime';

export const useRoom = (roomId: string, participantName: string) => {
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const initializeRoom = useCallback(async (type: 'planning-poker' | 'retro-board') => {
    const socket = getSocket();
    return new Promise<RoomState>((resolve) => {
      socket.emit('join_room', { roomId, name: participantName, type });
      const handler = (state: RoomState) => {
        if (state.id === roomId) {
          setRoomState(state);
          setParticipant(state.participants.find(p => p.name === participantName) || null);
          setIsConnected(true);
          socket.off('room_state', handler);
          resolve(state);
        }
      };
      socket.on('room_state', handler);
    });
  }, [roomId, participantName]);

  const joinRoom = useCallback(async () => {
    const socket = getSocket();
    return new Promise<RoomState>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('join timeout')), 5000);
      const handler = (state: RoomState) => {
        if (state.id === roomId) {
          clearTimeout(timeout);
          setRoomState(state);
          setParticipant(state.participants.find(p => p.name === participantName) || null);
          setIsConnected(true);
          socket.off('room_state', handler);
          resolve(state);
        }
      };
      socket.on('room_state', handler);
      socket.emit('join_room', { roomId, name: participantName, type: 'planning-poker' });
    });
  }, [roomId, participantName]);

  const sendMessage = useCallback((
    type: WebSocketMessageType, 
    payload: JoinRoomPayload | VotePayload | NotePayload | DeleteNotePayload | SetStoryPayload | Record<string, unknown>
  ) => {
    // Mock WebSocket message sending for demo purposes
    console.log('Mock send message:', type, payload);
  }, []);

  const updateRoomState = useCallback((updater: (prev: RoomState) => RoomState) => {
    setRoomState(prev => {
      if (!prev) return prev;
      const updated = updater(prev);
      return updated;
    });
  }, []);

  const checkRoomExists = useCallback(() => {
    // With realtime server, presence is validated on join; assume true client-side
    return true;
  }, []);

  const getRoomInfo = useCallback(() => roomState, [roomState]);

  useEffect(() => {
    const socket = getSocket();
    const handler = (state: RoomState) => {
      if (state.id === roomId) {
        setRoomState(state);
        if (participantName) {
          setParticipant(state.participants.find(p => p.name === participantName) || null);
        }
      }
    };
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('room_state', handler);
    return () => {
      socket.off('room_state', handler);
    };
  }, [roomId, participantName]);

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