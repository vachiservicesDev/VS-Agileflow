import { io, Socket } from 'socket.io-client';

const SERVER_URL = process.env.SOCKET_URL || 'http://localhost:8080';
const SOCKET_ORIGIN = process.env.SOCKET_ORIGIN || 'https://www.freeagilepoker.com';

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

async function runRoomScenario(roomId: string, type: 'planning-poker' | 'retro-board') {
  const opts = { transports: ['websocket'] as const, extraHeaders: { Origin: SOCKET_ORIGIN } };
  const host: Socket = io(SERVER_URL, opts);
  const a: Socket = io(SERVER_URL, opts);
  const b: Socket = io(SERVER_URL, opts);

  const states: any[] = [];
  const onState = (s: any) => { if (s?.id === roomId) states.push(s); };

  host.on('room_state', onState);
  a.on('room_state', onState);
  b.on('room_state', onState);

  host.emit('join_room', { roomId, name: 'Host', type });
  a.emit('join_room', { roomId, name: 'Alice', type });
  b.emit('join_room', { roomId, name: 'Bob', type });

  await delay(500);

  if (type === 'planning-poker') {
    a.emit('cast_vote', { roomId, participantName: 'Alice', value: '5' });
    b.emit('cast_vote', { roomId, participantName: 'Bob', value: '8' });
    await delay(200);
    host.emit('reveal_votes', { roomId, requesterName: 'Host' });
    await delay(200);
    host.emit('reset_votes', { roomId, requesterName: 'Host' });
  } else {
    host.emit('note_add', { roomId, text: 'Test note 1', columnId: '1', authorName: 'Host' });
    await delay(200);
    a.emit('note_add', { roomId, text: 'Test note 2', columnId: '2', authorName: 'Alice' });
  }

  await delay(500);

  host.disconnect(); a.disconnect(); b.disconnect();

  const last = states[states.length - 1];
  if (!last || last.id !== roomId) throw new Error('No final state received');
  if (type === 'planning-poker') {
    if (!last.votes || Object.keys(last.votes).length < 0) throw new Error('Votes missing');
  } else {
    if (!last.notes || last.notes.length < 1) throw new Error('Notes missing');
  }
}

(async () => {
  const pokerRoom = `E2E-${Math.random().toString(36).slice(2, 8)}`;
  const retroRoom = `E2E-${Math.random().toString(36).slice(2, 8)}`;
  await runRoomScenario(pokerRoom, 'planning-poker');
  await runRoomScenario(retroRoom, 'retro-board');
  // eslint-disable-next-line no-console
  console.log('E2E OK');
  process.exit(0);
})().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('E2E FAILED', err);
  process.exit(1);
});

