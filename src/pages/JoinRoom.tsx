import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Users, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useRoom } from '@/hooks/useRoom';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function JoinRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const [participantName, setParticipantName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [roomExists, setRoomExists] = useState(false);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const navigate = useNavigate();
  const { joinRoom, checkRoomExists, getRoomInfo } = useRoom(roomId || '', participantName);

  useEffect(() => {
    if (!roomId) return;

    // Initial check
    const exists = checkRoomExists();
    setRoomExists(exists);
    if (exists) {
      const info = getRoomInfo();
      setRoomInfo(info);
    }

    // Listen for storage changes so the page updates the moment the host creates the room
    const handleStorage = (e: StorageEvent) => {
      if (e.key === `room-${roomId}`) {
        const nowExists = !!e.newValue;
        setRoomExists(nowExists);
        if (nowExists && e.newValue) {
          try {
            setRoomInfo(JSON.parse(e.newValue));
          } catch {
            // ignore parse errors
          }
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    // Lightweight polling as a backstop for cross-origin/incognito cases where storage events may not fire
    const interval = window.setInterval(() => {
      const p = checkRoomExists();
      setRoomExists(p);
      if (p) {
        const info = getRoomInfo();
        setRoomInfo(info);
      }
    }, 300);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.clearInterval(interval);
    };
  }, [roomId, checkRoomExists, getRoomInfo]);

  const handleJoinRoom = async () => {
    if (!participantName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!roomId) {
      toast.error('Invalid room ID');
      return;
    }

    // Do not block here; joinRoom has its own retry/backoff to handle creation races

    setIsJoining(true);
    
    try {
      const roomState = await joinRoom();
      toast.success('Successfully joined the room!');
      
      // Navigate to the appropriate room type
      navigate(`/room/${roomState.type}/${roomId}`, { 
        state: { participantName: participantName.trim(), isHost: false } 
      });
    } catch (error) {
      console.error('Failed to join room:', error);
      toast.error('Room not found or not ready yet. Please try again.');
      setIsJoining(false);
      // State will continue to refresh via storage listener/polling
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Join Room</CardTitle>
            <CardDescription>
              Enter your name to join room: <code className="bg-gray-100 px-2 py-1 rounded">{roomId}</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Room Status */}
            {roomExists ? (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Users className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-green-900 mb-1">
                      {roomInfo?.type === 'planning-poker' ? 'Planning Poker' : 'Retrospective Board'} session
                    </p>
                    <p className="text-green-700">
                      {roomInfo?.participants?.length || 0} participant(s) already joined
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Waiting for the host to finish creating the room… If you just received the link, try joining now; we will retry automatically if it is not ready yet.
                </AlertDescription>
              </Alert>
            )}

            {/* Participant Name Input */}
            <div>
              <Label htmlFor="participantName">Your Name</Label>
              <Input
                id="participantName"
                placeholder="Enter your name"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                disabled={isJoining}
                className="mt-1"
              />
            </div>

            <Button 
              onClick={handleJoinRoom} 
              disabled={!participantName.trim() || isJoining}
              className="w-full bg-green-600 hover:bg-green-500 active:bg-green-700 active:scale-95 text-white transition-all duration-150 shadow-md hover:shadow-lg"
            >
              {isJoining ? 'Joining Room...' : 'Join Room'}
            </Button>

            {/* Instructions */}
            {roomExists && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">Joining existing session:</p>
                    <ul className="text-blue-700 space-y-1 list-disc list-inside">
                      <li>Enter your name above</li>
                      <li>You'll be added to the room instantly</li>
                      <li>All changes sync in real-time with other participants</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Help Text */}
            <div className="text-center text-sm text-gray-500">
              <p>No account required • Your data stays private</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}