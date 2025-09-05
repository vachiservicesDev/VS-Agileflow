import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function JoinRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const [participantName, setParticipantName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  const handleJoinRoom = async () => {
    if (!participantName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!roomId) {
      toast.error('Invalid room ID');
      return;
    }

    setIsJoining(true);
    
    try {
      // Check if room exists in localStorage
      const storedRoom = localStorage.getItem(`room-${roomId}`);
      
      if (!storedRoom) {
        toast.error('Room not found. Please check the room code.');
        setIsJoining(false);
        return;
      }

      const roomData = JSON.parse(storedRoom);
      
      // Navigate to the appropriate room type
      navigate(`/room/${roomData.type}/${roomId}`, { 
        state: { participantName: participantName.trim(), isHost: false } 
      });
    } catch (error) {
      console.error('Failed to join room:', error);
      toast.error('Failed to join room');
      setIsJoining(false);
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
            <div>
              <Label htmlFor="participantName">Your Name</Label>
              <Input
                id="participantName"
                placeholder="Enter your name"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}