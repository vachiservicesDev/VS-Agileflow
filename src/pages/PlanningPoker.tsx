import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Eye, EyeOff, RefreshCw, Check, Clock } from 'lucide-react';
import { RoomState, Participant } from '@/types/room';
import { toast } from 'sonner';

const FIBONACCI_CARDS = ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕'];

export default function PlanningPoker() {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { participantName } = location.state || {};
  
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (!participantName || !roomId) {
      navigate('/');
      return;
    }

    // Load room state from localStorage
    const storedRoom = localStorage.getItem(`room-${roomId}`);
    if (storedRoom) {
      const roomData: RoomState = JSON.parse(storedRoom);
      setRoomState(roomData);
      
      // Find current participant
      const currentParticipant = roomData.participants.find(p => p.name === participantName);
      if (currentParticipant) {
        setParticipant(currentParticipant);
      }
      
      // Minimalist: no story context
    }
  }, [participantName, roomId, navigate]);

  const updateRoomState = (updater: (prev: RoomState) => RoomState) => {
    setRoomState(prev => {
      if (!prev) return prev;
      const updated = updater(prev);
      localStorage.setItem(`room-${roomId}`, JSON.stringify(updated));
      
      // Dispatch storage event for real-time updates
      window.dispatchEvent(new StorageEvent('storage', {
        key: `room-${roomId}`,
        newValue: JSON.stringify(updated)
      }));
      
      return updated;
    });
  };

  // Listen for storage changes for real-time updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `room-${roomId}` && e.newValue) {
        const updatedRoom: RoomState = JSON.parse(e.newValue);
        setRoomState(updatedRoom);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [roomId]);

  const handleVote = (value: string) => {
    if (!participant || roomState?.votesRevealed) return;
    
    setSelectedVote(value);
    setHasVoted(true);
    
    updateRoomState(prev => ({
      ...prev,
      votes: {
        ...prev.votes,
        [participant.id]: {
          participantId: participant.id,
          value,
          revealed: false
        }
      }
    }));

    toast.success('Vote cast!');
  };

  const handleRevealVotes = () => {
    if (!participant?.isHost) return;
    
    updateRoomState(prev => ({
      ...prev,
      votesRevealed: true
    }));

    toast.success('Votes revealed!');
  };

  const handleResetVotes = () => {
    if (!participant?.isHost) return;

    setSelectedVote(null);
    setHasVoted(false);

    updateRoomState(prev => ({
      ...prev,
      votes: {},
      votesRevealed: false
    }));

    toast.success('Votes reset!');
  };

  // Minimalist: no explicit new round button; Reset covers the flow


  const getVoteStats = () => {
    if (!roomState?.votes || !roomState.votesRevealed) return null;
    
    const votes = Object.values(roomState.votes).map(v => v.value).filter(v => v && v !== '?');
    if (votes.length === 0) return null;
    
    const numericVotes = votes.filter(v => !isNaN(Number(v))).map(Number);
    if (numericVotes.length === 0) return null;
    
    const avg = numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length;
    const min = Math.min(...numericVotes);
    const max = Math.max(...numericVotes);
    
    return { avg: avg.toFixed(1), min, max };
  };

  const stats = getVoteStats();
  const totalParticipants = roomState?.participants.length || 0;
  const votedParticipants = roomState?.votes ? Object.keys(roomState.votes).length : 0;

  if (!roomState || !participant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-gray-300 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Leave Room
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white">Planning Poker</h1>
                <p className="text-sm text-gray-400">Room: {roomId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <Users className="h-4 w-4" />
                <span className="text-sm">{roomState.participants.length} participants</span>
              </div>
              {participant.isHost && (
                <Badge variant="secondary">Host</Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Top Center: Results and Story */}
      <section className="container mx-auto px-4 pt-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Vote Results - prominent */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="w-full text-center text-2xl md:text-3xl">Vote Results</CardTitle>
            </CardHeader>
            <CardContent>
              {!roomState.votesRevealed && (
                <div className="text-center text-gray-300">
                  <p className="text-xl md:text-2xl font-semibold">Waiting for votes…</p>
                  <p className="text-sm mt-1 text-gray-400">{votedParticipants}/{totalParticipants} voted</p>
                </div>
              )}

              {roomState.votesRevealed && (
                <div className="space-y-6">
                  {/* Key stats */}
                  {stats && (
                    <div className="grid sm:grid-cols-3 gap-4 text-center">
                      <div className="p-4 rounded-lg bg-gray-800">
                        <p className="text-2xl font-bold text-green-400">{stats.avg}</p>
                        <p className="text-xs text-gray-400 mt-1">Average</p>
                      </div>
                      <div className="p-4 rounded-lg bg-gray-800">
                        <p className="text-2xl font-bold text-blue-400">{stats.min}</p>
                        <p className="text-xs text-gray-400 mt-1">Minimum</p>
                      </div>
                      <div className="p-4 rounded-lg bg-gray-800">
                        <p className="text-2xl font-bold text-red-400">{stats.max}</p>
                        <p className="text-xs text-gray-400 mt-1">Maximum</p>
                      </div>
                    </div>
                  )}

                  {/* Individual votes */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {roomState.participants.map((p) => {
                      const vote = roomState.votes?.[p.id];
                      return (
                        <Badge key={p.id} variant="secondary" className="px-3 py-1 bg-gray-800 text-gray-100 border border-gray-700">
                          <span className="mr-2 text-gray-300">{p.name}</span>
                          <span className="font-semibold text-green-400">{vote?.value ?? '—'}</span>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
        </div>
      </section>

      {/* Main 3-column layout */}
      <section className="container mx-auto px-4 py-6 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Participants */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-900 border-gray-800 h-full">
              <CardHeader>
                <CardTitle>Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {roomState.participants.map((p) => {
                    const vote = roomState.votes?.[p.id];
                    const hasParticipantVoted = !!vote;
                    const status = roomState.votesRevealed
                      ? (vote?.value ?? '—')
                      : (hasParticipantVoted ? 'Voted' : 'Waiting…');
                    const statusIcon = roomState.votesRevealed
                      ? null
                      : (hasParticipantVoted ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Clock className="h-3.5 w-3.5 text-gray-400" />);
                    const statusClass = roomState.votesRevealed
                      ? 'text-green-400'
                      : (hasParticipantVoted ? 'text-green-400' : 'text-gray-400');

                    return (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-800 bg-gray-950">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-green-900/30 text-green-300 flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {p.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-100">{p.name}</span>
                            {p.isHost && <Badge variant="outline" className="text-xs">Host</Badge>}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {statusIcon}
                          <span className={`text-sm font-medium ${statusClass}`}>
                            {status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Spacer / optional center content */}
          <div className="lg:col-span-4">
            {/* Intentionally left for breathing room and scalability */}
          </div>

          {/* Right: Estimate cards */}
          <div className="lg:col-span-5">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Choose Your Estimate</span>
                  {roomState.votesRevealed ? (
                    <Eye className="h-5 w-5 text-green-400" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedVote && !roomState.votesRevealed && (
                  <p className="mb-3 text-sm text-gray-300">Your Vote: <span className="font-semibold text-green-400">{selectedVote}</span></p>
                )}
                <div className="grid grid-cols-4 md:grid-cols-6 xl:grid-cols-8 gap-3">
                  {FIBONACCI_CARDS.map((card) => (
                    <Button
                      key={card}
                      variant={selectedVote === card ? 'default' : 'outline'}
                      className={`aspect-[3/4] text-lg font-bold transition-colors ${selectedVote === card ? 'bg-green-600 hover:bg-green-500 text-white border-transparent' : 'bg-transparent text-gray-100 border border-gray-700 hover:border-gray-500'}`}
                      onClick={() => handleVote(card)}
                      disabled={roomState.votesRevealed}
                    >
                      {card}
                    </Button>
                  ))}
                </div>
                {hasVoted && !roomState.votesRevealed && (
                  <p className="text-center text-green-400 mt-4">
                    ✓ Vote cast! Waiting for others...
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Bottom sticky controls */}
      {participant.isHost && (
        <div className="sticky bottom-0 border-t border-gray-800 bg-gray-900/90 backdrop-blur py-3">
          <div className="container mx-auto px-4">
            <div className="flex justify-center gap-3">
              {!roomState.votesRevealed && (
                <Button onClick={handleRevealVotes} size="lg" className="bg-green-600 hover:bg-green-500">
                  <Eye className="h-4 w-4 mr-2" />
                  Reveal Votes
                </Button>
              )}
              <Button onClick={handleResetVotes} size="lg" variant="outline" className="border-gray-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Votes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}