import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Users, AlertCircle } from 'lucide-react';
import { useRoom } from '@/hooks/useRoom';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function JoinRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const [participantName, setParticipantName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();
  const { joinRoom } = useRoom(roomId || '', participantName);

  const handleJoinRoom = async () => {
    if (!participantName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!roomId) {
      toast.error('Invalid room code');
      return;
    }

    setIsJoining(true);
    try {
      const roomState = await joinRoom();
      navigate(`/room/${roomState.type}/${roomId}`, { 
        state: { participantName, isHost: false } 
      });
    } catch (error) {
      toast.error('Room not found or no longer available');
      setIsJoining(false);
    }
  };

  const checkRoomExists = () => {
    if (!roomId) return false;
    const storedRoom = localStorage.getItem(`room-${roomId}`);
    return !!storedRoom;
  };

  const getRoomInfo = () => {
    if (!roomId) return null;
    const storedRoom = localStorage.getItem(`room-${roomId}`);
    if (!storedRoom) return null;
    
    try {
      return JSON.parse(storedRoom);
    } catch {
      return null;
    }
  };

  const roomExists = checkRoomExists();
  const roomInfo = getRoomInfo();

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
              Enter your name to join the collaboration session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Room Code Display */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Room Code</Label>
              <Input
                value={roomId}
                readOnly
                className="font-mono text-center bg-gray-50 mt-1"
              />
            </div>

            {/* Room Status */}
            {roomExists && roomInfo ? (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Users className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-green-900 mb-1">Room Found!</p>
                    <p className="text-green-700">
                      {roomInfo.type === 'planning-poker' ? 'Planning Poker' : 'Retrospective Board'} session
                    </p>
                    <p className="text-green-700">
                      {roomInfo.participants?.length || 0} participant(s) already joined
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Room not found. Please check the room code or ask the host to share the correct link.
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
                disabled={!roomExists}
              />
            </div>

            {/* Join Button */}
            <Button
              onClick={handleJoinRoom}
              disabled={!participantName.trim() || isJoining || !roomExists}
              className="w-full"
            >
              {isJoining ? 'Joining Room...' : 'Join Room'}
            </Button>

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