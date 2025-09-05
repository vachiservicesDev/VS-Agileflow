import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Plus, X } from 'lucide-react';
import { RoomState, Participant, StickyNote } from '@/types/room';
import { toast } from 'sonner';

export default function RetroBoard() {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { participantName, isHost } = location.state || {};
  
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedColumn, setSelectedColumn] = useState<string>('1');

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
      } else {
        // If participant not found and this is a host, they might be rejoining
        // Find by isHost flag instead
        const hostParticipant = roomData.participants.find(p => p.isHost);
        if (hostParticipant && isHost) {
          setParticipant(hostParticipant);
        } else {
          console.error('Participant not found in room:', { participantName, participants: roomData.participants });
        }
      }
    } else {
      console.error('No room found in localStorage for roomId:', roomId);
    }
  }, [participantName, roomId, isHost, navigate]);

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

  const handleAddNote = () => {
    if (!newNoteText.trim() || !participant) return;

    const newNote: StickyNote = {
      id: crypto.randomUUID(),
      content: newNoteText.trim(),
      text: newNoteText.trim(),
      columnId: selectedColumn,
      authorId: participant.id,
      authorName: participant.name,
      createdAt: new Date()
    };

    updateRoomState(prev => ({
      ...prev,
      notes: [...(prev.notes || []), newNote]
    }));

    setNewNoteText('');
    toast.success('Note added!');
  };

  const handleDeleteNote = (noteId: string) => {
    if (!participant) return;

    updateRoomState(prev => ({
      ...prev,
      notes: (prev.notes || []).filter(note => 
        note.id !== noteId || note.authorId === participant.id
      )
    }));

    toast.success('Note deleted!');
  };

  const getNotesForColumn = (columnId: string) => {
    return roomState?.notes?.filter(note => note.columnId === columnId) || [];
  };

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
                <h1 className="text-xl font-bold">Retrospective Board</h1>
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
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Participants */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {roomState.participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full"
                  >
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">
                        {p.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{p.name}</span>
                    {p.isHost && <Badge variant="outline" className="text-xs">Host</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Add Note */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Textarea
                    placeholder="What would you like to share with the team?"
                    value={newNoteText}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNoteText(e.target.value)}
                    onKeyPress={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddNote();
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <select
                    value={selectedColumn}
                    onChange={(e) => setSelectedColumn(e.target.value)}
                    className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {roomState.columns?.map((column) => (
                      <option key={column.id} value={column.id}>
                        {column.title}
                      </option>
                    ))}
                  </select>
                  <Button
                    onClick={handleAddNote}
                    disabled={!newNoteText.trim()}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Retro Columns */}
          <div className="grid md:grid-cols-3 gap-6">
            {roomState.columns?.map((column) => (
              <Card key={column.id} className="h-fit">
                <CardHeader className={`${column.color} rounded-t-lg`}>
                  <CardTitle className="text-center">{column.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3 min-h-[400px]">
                  {getNotesForColumn(column.id).map((note) => (
                    <div
                      key={note.id}
                      className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 group hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-sm flex-1 mb-2">{note.text}</p>
                        {note.authorId === participant?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{note.authorName}</span>
                        <span>{note.createdAt ? new Date(note.createdAt).toLocaleTimeString() : 'Unknown time'}</span>
                      </div>
                    </div>
                  ))}
                  {getNotesForColumn(column.id).length === 0 && (
                    <div className="text-center text-gray-400 py-8">
                      <p className="text-sm">No notes yet</p>
                      <p className="text-xs">Add the first note to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Session Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {getNotesForColumn('1').length}
                  </p>
                  <p className="text-sm text-gray-600">What Went Well</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">
                    {getNotesForColumn('2').length}
                  </p>
                  <p className="text-sm text-gray-600">What to Improve</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {getNotesForColumn('3').length}
                  </p>
                  <p className="text-sm text-gray-600">Action Items</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {roomState.notes?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Total Notes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}