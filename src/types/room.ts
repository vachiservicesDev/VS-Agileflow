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

/**
 * Payload for joining a room
 */
export interface JoinRoomPayload {
  roomId: string;
  name: string;
  type: 'planning-poker' | 'retro-board';
}

/**
 * Payload for voting in planning poker
 */
export interface VotePayload {
  value: string | null;
}

/**
 * Payload for adding or updating a note in retro board
 *
 * Fields:
 * - text: canonical plain-string body of the note (preferred)
 * - content: optional legacy/rich body; if both are provided, text takes precedence
 */
export interface NotePayload {
  id?: string;
  content?: string;
  text?: string;
  columnId: string;
  x?: number;
  y?: number;
}

/**
 * Payload for deleting a note
 */
export interface DeleteNotePayload {
  id: string;
}

/**
 * Payload for setting the current story in planning poker
 */
export interface SetStoryPayload {
  story: string;
}

/**
 * Base WebSocket message interface
 */
export interface WebSocketMessage<T = Record<string, unknown>> {
  type: WebSocketMessageType;
  payload: T;
  roomId: string;
  participantId: string;
}