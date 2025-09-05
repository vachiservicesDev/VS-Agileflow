import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Users, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateRoom() {
  const { type, roomId } = useParams<{ type: 'planning-poker' | 'retro-board'; roomId: string }>();
  const [hostName, setHostName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const roomUrl = `${window.location.origin}/join-room/${roomId}`;

  const handleCreateRoom = async () => {
    if (!hostName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!type || !roomId) {
      toast.error('Invalid room configuration');
      return;
    }

    setIsCreating(true);
    
    try {
      // Create the room state directly here instead of using the hook
      const participantId = crypto.randomUUID();
      const newParticipant = {
        id: participantId,
        name: hostName.trim(),
        isHost: true
      };

      const initialRoomState = {
        id: roomId,
        type,
        participants: [newParticipant],
        host: participantId,
        createdAt: new Date(),
        votes: {},
        votesRevealed: false,
        columns: type === 'retro-board' ? [
          { id: '1', title: 'What Went Well', color: 'bg-green-100' },
          { id: '2', title: 'What to Improve', color: 'bg-yellow-100' },
          { id: '3', title: 'Action Items', color: 'bg-blue-100' }
        ] : undefined,
        notes: []
      };

      // Store room state in localStorage
      localStorage.setItem(`room-${roomId}`, JSON.stringify(initialRoomState));
      
      // Navigate immediately to the room
      navigate(`/room/${type}/${roomId}`, { 
        state: { participantName: hostName.trim(), isHost: true } 
      });
    } catch (error) {
      console.error('Failed to create room:', error);
      toast.error('Failed to create room');
      setIsCreating(false);
    }
  };

  const copyRoomUrl = () => {
    navigator.clipboard.writeText(roomUrl);
    toast.success('Room URL copied to clipboard!');
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId || '');
    toast.success('Room code copied to clipboard!');
  };

  const getToolName = () => {
    return type === 'planning-poker' ? 'Planning Poker' : 'Retrospective Board';
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
            <CardTitle className="text-2xl">Create {getToolName()} Room</CardTitle>
            <CardDescription>
              Set up your collaboration session and invite your team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Room Info */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Room Code</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    value={roomId}
                    readOnly
                    className="font-mono text-center bg-gray-50"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyRoomCode}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Share URL</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    value={roomUrl}
                    readOnly
                    className="text-sm bg-gray-50"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyRoomUrl}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Host Name Input */}
            <div>
              <Label htmlFor="hostName">Your Name (Host)</Label>
              <Input
                id="hostName"
                placeholder="Enter your name"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
              />
            </div>

            {/* Create Button */}
            <Button
              onClick={handleCreateRoom}
              disabled={!hostName.trim() || isCreating}
              className="w-full"
            >
              {isCreating ? 'Creating Room...' : `Create ${getToolName()} Room`}
            </Button>

            {/* Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">How to invite your team:</p>
                  <ol className="text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Share the room code: <code className="bg-white px-1 rounded">{roomId}</code></li>
                    <li>Or send them the direct URL above</li>
                    <li>Team members can join instantly - no sign-up required</li>
                  </ol>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}