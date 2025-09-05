export interface Participant {
  id: string;
  name: string;
  isHost: boolean;
}

export interface PlanningPokerVote {
  participantId: string;
  value: string | null;
  revealed: boolean;
}

export interface StickyNote {
  id: string;
  content: string;
  text?: string;
  authorId: string;
  authorName?: string;
  columnId: string;
  createdAt?: Date;
  x?: number;
  y?: number;
}

export interface RetroNote {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  columnId: string;
  createdAt: Date;
}

export interface RetroColumn {
  id: string;
  title: string;
  color: string;
}

export interface RoomState {
  id: string;
  type: 'planning-poker' | 'retro-board';
  participants: Participant[];
  host: string;
  createdAt: Date;
  // Planning Poker specific
  currentStory?: string;
  votes?: Record<string, PlanningPokerVote>;
  votesRevealed?: boolean;
  // Retro Board specific
  columns?: RetroColumn[];
  notes?: StickyNote[];
}

export type WebSocketMessageType = 'join-room' | 'leave-room' | 'vote' | 'reveal-votes' | 'add-note' | 'update-note' | 'delete-note' | 'set-story' | 'new-round';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: Record<string, unknown>;
  roomId: string;
  participantId: string;
}