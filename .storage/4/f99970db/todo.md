# Agile Collaboration Platform MVP - Development Plan

## Core Features to Implement
1. **Landing Page** - Tool selection (Planning Poker, Retrospective Board)
2. **Room Creation** - Generate unique room codes/URLs
3. **Room Join** - Enter room via URL with optional display name
4. **Planning Poker Tool** - Real-time story point estimation
5. **Retrospective Board Tool** - Virtual sticky notes with real-time updates

## Files to Create/Modify

### 1. Core Application Files
- `src/pages/Index.tsx` - Landing page with tool selection
- `src/pages/CreateRoom.tsx` - Room creation interface
- `src/pages/JoinRoom.tsx` - Room joining interface with name input
- `src/pages/PlanningPoker.tsx` - Planning poker game interface
- `src/pages/RetroBoard.tsx` - Retrospective board interface

### 2. Components
- `src/components/RoomHeader.tsx` - Room info and participants display
- `src/components/poker/VotingCards.tsx` - Fibonacci voting cards
- `src/components/poker/VoteResults.tsx` - Vote reveal display
- `src/components/retro/StickyNote.tsx` - Individual sticky note component
- `src/components/retro/RetroColumn.tsx` - Retrospective board columns

### 3. Utilities & Hooks
- `src/lib/websocket.ts` - WebSocket connection management
- `src/hooks/useRoom.ts` - Room state management
- `src/types/room.ts` - TypeScript interfaces for room data

### 4. Configuration
- `src/App.tsx` - Add new routes
- `index.html` - Update title and meta tags

## Implementation Strategy
- Start with static UI components
- Implement local state management first
- Add WebSocket integration for real-time features
- Use localStorage for temporary session data (client-side only)
- Focus on core functionality over advanced features

## Technical Decisions
- Use React Router for navigation
- Implement WebSocket with native WebSocket API
- Use Tailwind CSS for styling with shadcn/ui components
- Generate room codes using crypto.randomUUID()
- Store room state in React context/hooks