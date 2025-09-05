import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Vote, StickyNote, Zap, Shield, Globe } from 'lucide-react';
import { generateRoomId } from '@/lib/websocket';

export default function Index() {
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();

  const createRoom = (type: 'planning-poker' | 'retro-board') => {
    const newRoomId = generateRoomId();
    navigate(`/create-room/${type}/${newRoomId}`);
  };

  const joinRoom = () => {
    if (roomCode.trim()) {
      navigate(`/join-room/${roomCode.toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">FreeAgilePoker</h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                <Shield className="h-4 w-4" />
                <span>No Registration</span>
              </div>
              <div className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                <Globe className="h-4 w-4" />
                <span>Ephemeral Sessions</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Real-Time Agile Collaboration
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Create instant collaboration rooms for your team. No sign-ups, no data storage, 
            just pure real-time agile tools that disappear when you're done.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="p-4 bg-green-100 rounded-full w-fit mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Privacy by Design</h4>
              <p className="text-gray-600">No data storage, no tracking. Your session data disappears when you close the room.</p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Instant Setup</h4>
              <p className="text-gray-600">Create rooms in seconds. No accounts, no setup time, just click and collaborate.</p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-purple-100 rounded-full w-fit mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Real-time Sync</h4>
              <p className="text-gray-600">See changes instantly. Every vote, note, and action syncs across all participants.</p>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Vote className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Planning Poker</CardTitle>
                  <CardDescription>Story point estimation with your team</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Estimate user stories collaboratively with Fibonacci sequence cards. 
                Vote privately and reveal simultaneously for unbiased estimation.
              </p>
              <Button 
                onClick={() => createRoom('planning-poker')} 
                className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors"
              >
                Create Planning Poker Room
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <StickyNote className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Retrospective Board</CardTitle>
                  <CardDescription>Reflect and improve with your team</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Conduct sprint retrospectives with virtual sticky notes. 
                Add insights, group ideas, and create action items together.
              </p>
              <Button 
                onClick={() => createRoom('retro-board')} 
                className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors"
              >
                Create Retro Board Room
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Join Room Section */}
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Join Existing Room</CardTitle>
              <CardDescription>
                Have a room code? Enter it below to join the session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="roomCode">Room Code</Label>
                <Input
                  id="roomCode"
                  placeholder="Enter room code (e.g., ABC12345)"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
                  className="text-center font-mono"
                />
              </div>
              <Button onClick={joinRoom} className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors" disabled={!roomCode.trim()}>
                Join Room
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}