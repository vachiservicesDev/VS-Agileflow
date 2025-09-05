import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Users, Plus, Trash2 } from 'lucide-react';
import { useRoom } from '@/hooks/useRoom';
import { StickyNote } from '@/types/room';
import { toast } from 'sonner';

export default function RetroBoard() {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { participantName, isHost } = location.state || {};
  
  const [newNoteContent, setNewNoteContent] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('1');

  const { roomState, participant, sendMessage, updateRoomState } = useRoom(roomId || '', participantName);

  useEffect(() => {
    if (!participantName) {
      navigate('/');
      return;
    }
  }, [participantName, navigate]);

  const handleAddNote = () => {
    if (!newNoteContent.trim() || !participant) return;

    const newNote: StickyNote = {
      id: crypto.randomUUID(),
      content: newNoteContent.trim(),
      authorId: participant.id,
      columnId: selectedColumn
    };

    updateRoomState(prev => ({
      ...prev,
      notes: [...(prev.notes || []), newNote]
    }));

    sendMessage('add-note', { note: newNote });
    setNewNoteContent('');
    toast.success('Note added!');
  };

  const handleDeleteNote = (noteId: string) => {
    const note = roomState?.notes?.find(n => n.id === noteId);
    if (!note || !participant) return;

    // Only allow deletion by the author or host
    if (note.authorId !== participant.id && !participant.isHost) {
      toast.error('You can only delete your own notes');
      return;
    }

    updateRoomState(prev => ({
      ...prev,
      notes: (prev.notes || []).filter(n => n.id !== noteId)
    }));

    sendMessage('delete-note', { noteId });
    toast.success('Note deleted!');
  };

  const getNotesForColumn = (columnId: string) => {
    return roomState?.notes?.filter(note => note.columnId === columnId) || [];
  };

  const getParticipantName = (participantId: string) => {
    return roomState?.participants.find(p => p.id === participantId)?.name || 'Unknown';
  };

  if (!roomState || !participant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
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
          {/* Add Note Section */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Textarea
                    placeholder="What's on your mind?"
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddNote();
                      }
                    }}
                    rows={3}
                  />
                </div>
                <div>
                  <select
                    value={selectedColumn}
                    onChange={(e) => setSelectedColumn(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {roomState.columns?.map((column) => (
                      <option key={column.id} value={column.id}>
                        {column.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Button 
                    onClick={handleAddNote} 
                    disabled={!newNoteContent.trim()}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Retrospective Columns */}
          <div className="grid md:grid-cols-3 gap-6">
            {roomState.columns?.map((column) => {
              const notes = getNotesForColumn(column.id);
              
              return (
                <Card key={column.id} className="h-fit">
                  <CardHeader className={`${column.color} rounded-t-lg`}>
                    <CardTitle className="text-center">{column.title}</CardTitle>
                    <p className="text-center text-sm text-gray-600">
                      {notes.length} note{notes.length !== 1 ? 's' : ''}
                    </p>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 min-h-[300px]">
                    {notes.map((note) => {
                      const authorName = getParticipantName(note.authorId);
                      const isOwner = note.authorId === participant.id;
                      const canDelete = isOwner || participant.isHost;
                      
                      return (
                        <div
                          key={note.id}
                          className="p-3 bg-yellow-100 border-l-4 border-yellow-400 rounded-r-lg shadow-sm hover:shadow-md transition-shadow group"
                        >
                          <div className="flex justify-between items-start">
                            <p className="text-sm flex-1 pr-2">{note.content}</p>
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteNote(note.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            )}
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500">
                              by {isOwner ? 'You' : authorName}
                            </span>
                            {isOwner && (
                              <Badge variant="outline" className="text-xs">
                                Your note
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {notes.length === 0 && (
                      <div className="text-center text-gray-400 py-8">
                        <p>No notes yet</p>
                        <p className="text-sm">Add the first note to this column!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Participants */}
          <Card>
            <CardHeader>
              <CardTitle>Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {roomState.participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600">
                        {p.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium">{p.name}</span>
                    {p.isHost && <Badge variant="outline" className="text-xs">Host</Badge>}
                    {p.id === participant.id && <Badge variant="secondary" className="text-xs">You</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}