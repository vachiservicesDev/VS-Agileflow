import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Vote, StickyNote, Zap, Shield } from 'lucide-react';
import { generateRoomId } from '@/lib/websocket';

export default function Index() {
  const [activePreview, setActivePreview] = useState<'poker' | 'retro'>('poker');
  const [activeTool, setActiveTool] = useState<'poker' | 'retro'>('poker');
  const navigate = useNavigate();

  const createRoom = (type: 'planning-poker' | 'retro-board') => {
    const newRoomId = generateRoomId();
    navigate(`/create-room/${type}/${newRoomId}`);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePreview((prev: 'poker' | 'retro') => (prev === 'poker' ? 'retro' : 'poker'));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Run Better Agile Meetings, Instantly.
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Create a free, private room in seconds. No sign-ups, no tracking. Ever.
          </p>
          <div className="flex justify-center mb-10">
            <Button
              onClick={() => createRoom('planning-poker')}
              size="lg"
              className="bg-green-600 hover:bg-green-500 active:bg-green-700 active:scale-95 text-white transition-all duration-150 shadow-md hover:shadow-lg"
            >
              Create Your Free Room
            </Button>
          </div>
          {/* Animated Visual Preview */}
          <div className="relative max-w-5xl mx-auto mb-10">
            <div className="aspect-video rounded-xl border bg-white/70 backdrop-blur shadow-sm overflow-hidden">
              {/* Planning Poker Preview */}
              <div className={`absolute inset-0 transition-opacity duration-700 ${activePreview === 'poker' ? 'opacity-100' : 'opacity-0'}`}>
                <div className="h-full w-full p-6 grid grid-rows-3 gap-4">
                  <div className="rounded-lg bg-gradient-to-r from-green-50 to-green-100 border flex items-center justify-center text-green-700 font-semibold">
                    Planning Poker
                  </div>
                  <div className="grid grid-cols-6 gap-3">
                    {['0','1','2','3','5','8','13','21','34','55','89','?'].map((v) => (
                      <div key={v} className="aspect-[3/4] rounded-lg border bg-white flex items-center justify-center text-sm md:text-base font-bold text-gray-700">
                        {v}
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border bg-gray-50 flex items-center justify-center text-gray-500">
                    Waiting for votes…
                  </div>
                </div>
              </div>
              {/* Retro Board Preview */}
              <div className={`absolute inset-0 transition-opacity duration-700 ${activePreview === 'retro' ? 'opacity-100' : 'opacity-0'}`}>
                <div className="h-full w-full p-6 grid md:grid-cols-3 gap-4">
                  {['Went Well','To Improve','Actions'].map((col, idx) => (
                    <div key={col} className="rounded-lg border bg-white overflow-hidden">
                      <div className={`${idx===0?'bg-green-50':idx===1?'bg-yellow-50':'bg-blue-50'} px-4 py-2 font-medium`}>{col}</div>
                      <div className="p-4 space-y-2">
                        <div className="p-3 rounded-md border bg-white shadow-sm text-sm text-gray-700">Collaborated across teams</div>
                        <div className="p-3 rounded-md border bg-white shadow-sm text-sm text-gray-700">Faster code reviews</div>
                        <div className="p-3 rounded-md border bg-white shadow-sm text-sm text-gray-700">Clearer action items</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="p-4 bg-green-100 rounded-full w-fit mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Your Data is Sacred</h4>
              <p className="text-gray-600">Sessions are ephemeral. Nothing is stored, so your conversations remain confidential.</p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Launch in Seconds</h4>
              <p className="text-gray-600">No accounts, no setup. Just share a link and start collaborating.</p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-purple-100 rounded-full w-fit mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Perfectly in Sync</h4>
              <p className="text-gray-600">Every vote, note, and action appears instantly for all participants.</p>
            </div>
          </div>
        </div>

        {/* Product Showcase: Tabs */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Button
              variant={activeTool === 'poker' ? 'default' : 'outline'}
              onClick={() => setActiveTool('poker')}
              className={activeTool === 'poker' ? 'bg-green-600 hover:bg-green-500 text-white' : ''}
            >
              Planning Poker
            </Button>
            <Button
              variant={activeTool === 'retro' ? 'default' : 'outline'}
              onClick={() => setActiveTool('retro')}
              className={activeTool === 'retro' ? 'bg-green-600 hover:bg-green-500 text-white' : ''}
            >
              Retrospectives
            </Button>
          </div>
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${activeTool==='poker'?'bg-blue-100':'bg-green-100'}`}>
                  {activeTool === 'poker' ? (
                    <Vote className="h-6 w-6 text-blue-600" />
                  ) : (
                    <StickyNote className="h-6 w-6 text-green-600" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-xl">{activeTool === 'poker' ? 'Planning Poker' : 'Retrospective Board'}</CardTitle>
                  <CardDescription>
                    {activeTool === 'poker' 
                      ? 'Estimate stories collaboratively with private voting and simultaneous reveal.' 
                      : 'Reflect as a team, group insights, and turn takeaways into action items.'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg border bg-white flex items-center justify-center text-gray-500">
                {activeTool === 'poker' ? 'Preview: Planning Poker Interface' : 'Preview: Retrospective Board'}
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                {activeTool === 'poker' ? (
                  <Button 
                    onClick={() => createRoom('planning-poker')} 
                    className="bg-green-600 hover:bg-green-500 active:bg-green-700 active:scale-95 text-white transition-all duration-150 shadow-md hover:shadow-lg flex-1"
                  >
                    Create Poker Room
                  </Button>
                ) : (
                  <Button 
                    onClick={() => createRoom('retro-board')} 
                    className="bg-green-600 hover:bg-green-500 active:bg-green-700 active:scale-95 text-white transition-all duration-150 shadow-md hover:shadow-lg flex-1"
                  >
                    Create Retro Board
                  </Button>
                )}
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={() => setActiveTool(activeTool === 'poker' ? 'retro' : 'poker')}
                >
                  {activeTool === 'poker' ? 'View Retrospectives' : 'View Planning Poker'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Social Proof */}
        <div className="max-w-5xl mx-auto mb-24">
          <h3 className="text-center text-2xl font-bold text-gray-900 mb-8">Trusted by High-Performing Agile Teams</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6 text-gray-700">
                “This is now our go-to tool for planning poker. Simple, fast, and no friction.”
                <div className="mt-4 text-sm text-gray-500">— Scrum Master, Startup Inc.</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-gray-700">
                “Privacy-first and zero setup. We start in seconds and stay focused.”
                <div className="mt-4 text-sm text-gray-500">— Agile Coach, FinTech Co.</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-gray-700">
                “Perfect for distributed teams—everything syncs instantly across devices.”
                <div className="mt-4 text-sm text-gray-500">— Engineering Manager, SaaS Co.</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Final CTA */}
        <div className="max-w-3xl mx-auto text-center">
          <h4 className="text-2xl font-semibold text-gray-900 mb-3">Start your session now</h4>
          <p className="text-gray-600 mb-6">Create a private room in seconds and invite your team with a link.</p>
          <Button
            onClick={() => createRoom('planning-poker')}
            size="lg"
            className="bg-green-600 hover:bg-green-500 active:bg-green-700 active:scale-95 text-white transition-all duration-150 shadow-md hover:shadow-lg"
          >
            Create Your Free Room
          </Button>
        </div>
      </section>
    </div>
  );
}