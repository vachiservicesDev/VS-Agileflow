import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Vote, StickyNote, Zap, Shield } from 'lucide-react';
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
          <div className="max-w-4xl mx-auto text-left">
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-700 leading-relaxed">
                  FreeAgilePoker.com empowers scrum masters, agile coaches, and software development teams with a real-time collaboration platform designed for Planning Poker and Retrospectives. Launch sessions instantly—no sign-ups or downloads required—and invite participants with a single link. Our Privacy by Design approach ensures no data storage and no tracking; rooms are ephemeral, personal information isn’t collected, and your team’s insights remain yours. Facilitation features keep ceremonies efficient and inclusive, including customizable estimation decks, anonymous voting with simultaneous reveal, timers, and clean visual summaries that drive alignment. Retrospectives flow smoothly with modern templates, flexible formats, and frictionless participation from any device. Because nothing persists on our servers, FreeAgilePoker.com aligns with strict privacy requirements and reduces administrative overhead. Enjoy a modern, responsive interface that supports distributed teams and hybrid work. Elevate planning accuracy, shorten meetings, and foster continuous improvement with a secure, zero-hassle experience.
                </p>
              </CardContent>
            </Card>
          </div>
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
                className="w-full bg-green-600 hover:bg-green-500 active:bg-green-700 active:scale-95 text-white transition-all duration-150 shadow-md hover:shadow-lg"
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
                className="w-full bg-green-600 hover:bg-green-500 active:bg-green-700 active:scale-95 text-white transition-all duration-150 shadow-md hover:shadow-lg"
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
              <Button onClick={joinRoom} className="w-full bg-green-600 hover:bg-green-500 active:bg-green-700 active:scale-95 text-white transition-all duration-150 shadow-md hover:shadow-lg" disabled={!roomCode.trim()}>
                Join Room
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}