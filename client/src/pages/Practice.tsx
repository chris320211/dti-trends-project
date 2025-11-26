import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, List, ListItem, CircularProgress, Alert } from '@mui/material';
import { Note } from '../constants/consts';
import NoteView from '../components/NoteView';
import { auth } from '../firebase';

const API_URL = 'http://localhost:1010';

const PracticePage: React.FC = () => {
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch notes from backend
    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            setError('');

            const user = auth.currentUser;
            if (!user) {
                setError('You must be logged in to view your notes');
                setLoading(false);
                return;
            }

            const token = await user.getIdToken();

            const response = await fetch(`${API_URL}/api/notes`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch notes');
            }

            setNotes(data.notes);
        } catch (err: any) {
            console.error('Error fetching notes:', err);
            setError(err.message || 'Failed to load notes');
        } finally {
            setLoading(false);
        }
    };

    // Function to handle going back to the notes list
    const handleBackToList = () => {
        setSelectedNote(null);
        fetchNotes(); // Refresh notes when going back
    };

    // Function to handle deleting a note
    const handleDeleteNote = async (noteId: string) => {
        if (!window.confirm('Are you sure you want to delete this note?')) {
            return;
        }

        try {
            const user = auth.currentUser;
            if (!user) return;

            const token = await user.getIdToken();

            const response = await fetch(`${API_URL}/api/notes/${noteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete note');
            }

            // Refresh notes list
            fetchNotes();
        } catch (err: any) {
            console.error('Error deleting note:', err);
            alert('Failed to delete note. Please try again.');
        }
    };

    // If a note is selected, show the NoteView component
    if (selectedNote) {
        return <NoteView note={selectedNote} onBack={handleBackToList} />;
    }

    // calculuate progress for each note
    const getProgress = (note: Note) => {
        const completed = note.questions.filter(q => q.completed).length;
        return `${completed}/${note.questions.length}`;
    };

    return (
        <Box sx={{ padding: 4, maxWidth: '1000px', margin: '0 auto' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Practice
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : notes.length === 0 ? (
                <Typography variant="body1" color="text.secondary">
                    No notes uploaded yet. Go to Upload to add your first notes!
                </Typography>
            ) : (
                <List>
                    {notes.map((note) => (
                        <ListItem key={note.id} sx={{ mb: 2, p: 0 }}>
                            <Paper
                                elevation={2}
                                sx={{
                                    width: '100%',
                                    padding: 3,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                                        {note.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Date added: {note.dateAdded}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Progress: {getProgress(note)} questions
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        variant="contained"
                                        onClick={() => setSelectedNote(note)}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Go
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => handleDeleteNote(note.id)}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Delete
                                    </Button>
                                </Box>
                            </Paper>
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );
};

export default PracticePage;

