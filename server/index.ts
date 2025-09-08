import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import { randomUUID } from 'crypto';

type RoomType = 'planning-poker' | 'retro-board';

interface Participant {
  id: string;
  name: string;
  isHost: boolean;
}

interface RoomState {
  id: string;
  type: RoomType;
  participants: Participant[];
  host: string;
  createdAt: string;
  currentStory?: string;
  votes?: Record<string, { participantId: string; value: string | null; revealed: boolean }>;
  votesRevealed?: boolean;
  columns?: Array<{ id: string; title: string; color: string }>;
  notes?: Array<{ id: string; text?: string; content?: string; authorId: string; authorName?: string; columnId: string; createdAt?: string }>;
}

const PORT = Number(process.env.PORT || 8080);
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const ROOM_TTL_SECONDS = Number(process.env.ROOM_TTL_SECONDS || 60 * 60 * 6); // 6 hours

const app = express();
app.use(cors({ origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(',') }));
app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/rooms/:roomId', async (req, res) => {
  const { roomId } = req.params;
  const room = await getRoom(roomId);
  if (!room) return res.status(404).json({ error: 'not_found' });
  return res.json(room);
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(',') },
});

const pubClient = new Redis(REDIS_URL);
const subClient = new Redis(REDIS_URL);
io.adapter(createAdapter(pubClient, subClient));

const roomKey = (roomId: string) => `room:${roomId}:state`;

async function getRoom(roomId: string): Promise<RoomState | null> {
  const data = await pubClient.get(roomKey(roomId));
  return data ? (JSON.parse(data) as RoomState) : null;
}

async function setRoom(roomId: string, state: RoomState) {
  await pubClient.set(roomKey(roomId), JSON.stringify(state), 'EX', ROOM_TTL_SECONDS);
}

io.on('connection', (socket) => {
  socket.on('join_room', async ({ roomId, name, type }: { roomId: string; name: string; type: RoomType }) => {
    if (!roomId || !name || (type !== 'planning-poker' && type !== 'retro-board')) return;
    let room = await getRoom(roomId);
    const joiningParticipantId = randomUUID();
    if (!room) {
      const hostId = joiningParticipantId;
      room = {
        id: roomId,
        type,
        participants: [{ id: hostId, name, isHost: true }],
        host: hostId,
        createdAt: new Date().toISOString(),
        votes: {},
        votesRevealed: false,
        columns: type === 'retro-board' ? [
          { id: '1', title: 'What Went Well', color: 'bg-green-100' },
          { id: '2', title: 'What to Improve', color: 'bg-yellow-100' },
          { id: '3', title: 'Action Items', color: 'bg-blue-100' },
        ] : undefined,
        notes: [],
      };
    } else {
      // If participant already in room by name, reuse id; else add
      const existing = room.participants.find((p) => p.name === name);
      if (!existing) {
        room.participants.push({ id: joiningParticipantId, name, isHost: false });
      }
    }
    await setRoom(roomId, room);
    socket.join(roomId);
    io.to(roomId).emit('room_state', room);
  });

  socket.on('leave_room', async ({ roomId, name }: { roomId: string; name: string }) => {
    const room = await getRoom(roomId);
    if (!room) return;
    room.participants = room.participants.filter((p) => p.name !== name);
    await setRoom(roomId, room);
    socket.leave(roomId);
    io.to(roomId).emit('room_state', room);
  });

  socket.on('cast_vote', async ({ roomId, participantName, value }: { roomId: string; participantName: string; value: string | null }) => {
    const room = await getRoom(roomId);
    if (!room) return;
    const participant = room.participants.find((p) => p.name === participantName);
    if (!participant || room.votesRevealed) return;
    room.votes = room.votes || {};
    room.votes[participant.id] = { participantId: participant.id, value, revealed: false };
    await setRoom(roomId, room);
    io.to(roomId).emit('room_state', room);
  });

  socket.on('reveal_votes', async ({ roomId, requesterName }: { roomId: string; requesterName: string }) => {
    const room = await getRoom(roomId);
    if (!room) return;
    const requester = room.participants.find((p) => p.name === requesterName);
    if (!requester || !requester.isHost) return;
    room.votesRevealed = true;
    await setRoom(roomId, room);
    io.to(roomId).emit('room_state', room);
  });

  socket.on('reset_votes', async ({ roomId, requesterName }: { roomId: string; requesterName: string }) => {
    const room = await getRoom(roomId);
    if (!room) return;
    const requester = room.participants.find((p) => p.name === requesterName);
    if (!requester || !requester.isHost) return;
    room.votes = {};
    room.votesRevealed = false;
    await setRoom(roomId, room);
    io.to(roomId).emit('room_state', room);
  });

  socket.on('note_add', async ({ roomId, text, columnId, authorName }: { roomId: string; text: string; columnId: string; authorName: string }) => {
    const room = await getRoom(roomId);
    if (!room) return;
    const author = room.participants.find((p) => p.name === authorName);
    if (!author) return;
    const note = { id: randomUUID(), text, content: text, authorId: author.id, authorName, columnId, createdAt: new Date().toISOString() };
    room.notes = room.notes || [];
    room.notes.push(note);
    await setRoom(roomId, room);
    io.to(roomId).emit('room_state', room);
  });

  socket.on('note_delete', async ({ roomId, noteId, requesterName }: { roomId: string; noteId: string; requesterName: string }) => {
    const room = await getRoom(roomId);
    if (!room) return;
    const requester = room.participants.find((p) => p.name === requesterName);
    if (!requester) return;
    room.notes = (room.notes || []).filter((n) => n.id !== noteId || n.authorId === requester.id);
    await setRoom(roomId, room);
    io.to(roomId).emit('room_state', room);
  });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Realtime server listening on :${PORT}`);
});

