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
  authorId: string;
  columnId: string;
  x?: number;
  y?: number;
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

export interface WebSocketMessage {
  type: 'join-room' | 'leave-room' | 'vote' | 'reveal-votes' | 'add-note' | 'update-note' | 'delete-note' | 'set-story';
  payload: any;
  roomId: string;
  participantId: string;
}