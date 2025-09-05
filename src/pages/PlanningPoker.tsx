import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Eye, EyeOff, RotateCcw } from 'lucide-react';
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
  const [currentStory, setCurrentStory] = useState('');
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
      // Ensure participant exists locally
      let participantRecord = roomData.participants.find(p => p.name === participantName);
      if (!participantRecord) {
        participantRecord = {
          id: crypto.randomUUID(),
          name: participantName,
          isHost: false
        } as Participant;
        const updatedRoom = {
          ...roomData,
          participants: [...roomData.participants, participantRecord]
        } as RoomState;
        localStorage.setItem(`room-${roomId}`, JSON.stringify(updatedRoom));
        setRoomState(updatedRoom);
      } else {
        setRoomState(roomData);
      }

      setParticipant(participantRecord);

      // Set current story if exists
      const roomDataLatest: RoomState = JSON.parse(localStorage.getItem(`room-${roomId}`) || JSON.stringify(roomData));
      if (roomDataLatest.currentStory) {
        setCurrentStory(roomDataLatest.currentStory);
      }
    } else {
      // If room is missing locally, create a minimal shell so the user can proceed
      const participantRecord: Participant = {
        id: crypto.randomUUID(),
        name: participantName,
        isHost: false
      };
      const initialRoomState: RoomState = {
        id: roomId,
        type: 'planning-poker',
        participants: [participantRecord],
        host: 'unknown',
        createdAt: new Date(),
        votes: {},
        votesRevealed: false
      } as unknown as RoomState;
      localStorage.setItem(`room-${roomId}`, JSON.stringify(initialRoomState));
      setRoomState(initialRoomState);
      setParticipant(participantRecord);
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

  const handleNewRound = () => {
    if (!participant?.isHost) return;
    
    setSelectedVote(null);
    setHasVoted(false);
    
    updateRoomState(prev => ({
      ...prev,
      votes: {},
      votesRevealed: false,
      currentStory: ''
    }));

    setCurrentStory('');
    toast.success('New round started!');
  };

  const handleSetStory = () => {
    if (!participant?.isHost || !currentStory.trim()) return;
    
    updateRoomState(prev => ({
      ...prev,
      currentStory: currentStory.trim()
    }));
  };

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

  if (!roomState || !participant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Leave Room
              </Button>
              <div>
                <h1 className="text-xl font-bold">Planning Poker</h1>
                <p className="text-sm text-gray-600">Room: {roomId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
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

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Story Input (Host Only) */}
          {participant.isHost && (
            <Card>
              <CardHeader>
                <CardTitle>Current Story</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter the user story to estimate..."
                    value={currentStory}
                    onChange={(e) => setCurrentStory(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSetStory()}
                  />
                  <Button onClick={handleSetStory} disabled={!currentStory.trim()}>
                    Set Story
                  </Button>
                </div>
                {roomState.currentStory && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900">{roomState.currentStory}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Story Display (Non-Host) */}
          {!participant.isHost && roomState.currentStory && (
            <Card>
              <CardHeader>
                <CardTitle>Story to Estimate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-900">{roomState.currentStory}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Voting Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Choose Your Estimate</span>
                {roomState.votesRevealed ? (
                  <Eye className="h-5 w-5 text-green-600" />
                ) : (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {FIBONACCI_CARDS.map((card) => (
                  <Button
                    key={card}
                    variant={selectedVote === card ? "default" : "outline"}
                    className={`aspect-[3/4] text-lg font-bold ${
                      selectedVote === card ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleVote(card)}
                    disabled={roomState.votesRevealed}
                  >
                    {card}
                  </Button>
                ))}
              </div>
              {hasVoted && !roomState.votesRevealed && (
                <p className="text-center text-green-600 mt-4">
                  ✓ Vote cast! Waiting for others...
                </p>
              )}
            </CardContent>
          </Card>

          {/* Participants & Votes */}
          <Card>
            <CardHeader>
              <CardTitle>Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roomState.participants.map((p) => {
                  const vote = roomState.votes?.[p.id];
                  const hasVoted = !!vote;
                  
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {p.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium">{p.name}</span>
                        {p.isHost && <Badge variant="outline" className="text-xs">Host</Badge>}
                      </div>
                      <div>
                        {roomState.votesRevealed && vote ? (
                          <Badge variant="secondary" className="text-lg px-3 py-1">
                            {vote.value}
                          </Badge>
                        ) : hasVoted ? (
                          <Badge variant="outline" className="text-green-600">
                            ✓ Voted
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-400">
                            Waiting
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Vote Results */}
          {roomState.votesRevealed && stats && (
            <Card>
              <CardHeader>
                <CardTitle>Vote Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{stats.avg}</p>
                    <p className="text-sm text-gray-600">Average</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{stats.min}</p>
                    <p className="text-sm text-gray-600">Minimum</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{stats.max}</p>
                    <p className="text-sm text-gray-600">Maximum</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Host Controls */}
          {participant.isHost && (
            <div className="flex justify-center space-x-4">
              {!roomState.votesRevealed ? (
                <Button onClick={handleRevealVotes} size="lg">
                  <Eye className="h-4 w-4 mr-2" />
                  Reveal Votes
                </Button>
              ) : (
                <Button onClick={handleNewRound} size="lg">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  New Round
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}