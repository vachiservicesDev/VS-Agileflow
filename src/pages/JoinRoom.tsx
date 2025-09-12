import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Users, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useRoom } from '@/hooks/useRoom';
import { getSocket } from '@/lib/realtime';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function JoinRoom() {
  const { roomId } = useParams<{ roomId?: string }>();
  const [participantName, setParticipantName] = useState('');
  const [manualRoomCode, setManualRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [roomExists, setRoomExists] = useState(false);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const navigate = useNavigate();
  const effectiveRoomId = roomId || '';
  const { checkRoomExists, getRoomInfo } = useRoom(effectiveRoomId, participantName);

  useEffect(() => {
    let isMounted = true;
    const fetchRoom = async () => {
      if (!effectiveRoomId) return;
      try {
        const meta = document.querySelector('meta[name="socket-url"]') as HTMLMetaElement | null;
        const metaUrl = meta?.content;
        const envUrl = (import.meta as any)?.env?.VITE_SOCKET_URL as string | undefined;
        const winUrl = (window as any).__SOCKET_URL as string | undefined;
        const apiBase = envUrl || winUrl || metaUrl || (window.location.hostname.endsWith('freeagilepoker.com') ? 'https://vs-agileflow.onrender.com' : window.location.origin);
        const res = await fetch(`${apiBase}/rooms/${effectiveRoomId}`, { credentials: 'omit' });
        if (!isMounted) return;
        if (res.ok) {
          const data = await res.json();
          setRoomInfo(data);
          setRoomExists(true);
        } else {
          setRoomExists(false);
          setRoomInfo(null);
        }
      } catch {
        if (!isMounted) return;
        setRoomExists(false);
        setRoomInfo(null);
      }
    };
    fetchRoom();
    return () => { isMounted = false; };
  }, [effectiveRoomId]);

  const handleJoinRoom = async () => {
    if (!participantName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!effectiveRoomId) {
      toast.error('Invalid room ID');
      return;
    }

    if (!roomExists) {
      toast.error('Room not found. Please check the room code.');
      return;
    }

    setIsJoining(true);
    
    try {
      const socket = getSocket();
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('join timeout')), 5000);
        const handler = (state: any) => {
          if (state?.id === roomId) {
            clearTimeout(timer);
            socket.off('room_state', handler);
            resolve();
          }
        };
        socket.on('room_state', handler);
        socket.emit('join_room', { roomId: effectiveRoomId, name: participantName.trim(), type: (roomInfo?.type || 'planning-poker') });
      });
      toast.success('Successfully joined the room!');
      
      // Navigate to the appropriate room type
      navigate(`/room/${roomInfo?.type || 'planning-poker'}/${effectiveRoomId}`, { state: { participantName: participantName.trim(), isHost: false } });
    } catch (error) {
      console.error('Failed to join room:', error);
      toast.error('Room not found or no longer available');
      setIsJoining(false);
      
      // Refresh room existence check
      const exists = checkRoomExists();
      setRoomExists(exists);
      if (exists) {
        const info = getRoomInfo();
        setRoomInfo(info);
      }
    }
  };

  const handleNavigateToRoomCode = () => {
    const code = manualRoomCode.trim().toUpperCase();
    if (!code) return;
    navigate(`/join-room/${code}`);
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
            {effectiveRoomId ? (
              <CardDescription>
                Enter your name to join room: <code className="bg-gray-100 px-2 py-1 rounded">{effectiveRoomId}</code>
              </CardDescription>
            ) : (
              <CardDescription>
                Enter a room code to join an existing session
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {!effectiveRoomId && (
              <div>
                <Label htmlFor="manualRoomCode">Room Code</Label>
                <Input
                  id="manualRoomCode"
                  placeholder="Enter room code (e.g., ABC12345)"
                  value={manualRoomCode}
                  onChange={(e) => setManualRoomCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNavigateToRoomCode()}
                  className="mt-1 text-center font-mono"
                />
              </div>
            )}
            {/* Room Status */}
            {effectiveRoomId && roomExists ? (
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
            ) : effectiveRoomId ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Room not found. Please check the room code or ask the host to share the correct link.
                </AlertDescription>
              </Alert>
            ) : null}

            {/* Participant Name Input */}
            <div>
              <Label htmlFor="participantName">Your Name</Label>
              <Input
                id="participantName"
                placeholder="Enter your name"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                disabled={effectiveRoomId ? !roomExists : false}
                className="mt-1"
              />
            </div>

            <Button 
              onClick={effectiveRoomId ? handleJoinRoom : handleNavigateToRoomCode} 
              disabled={effectiveRoomId ? (!participantName.trim() || isJoining || !roomExists) : !manualRoomCode.trim()}
              className="w-full bg-green-600 hover:bg-green-500 active:bg-green-700 active:scale-95 text-white transition-all duration-150 shadow-md hover:shadow-lg"
            >
              {effectiveRoomId ? (isJoining ? 'Joining Room...' : 'Join Room') : 'Continue'}
            </Button>

            {/* Instructions */}
            {effectiveRoomId && roomExists && (
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