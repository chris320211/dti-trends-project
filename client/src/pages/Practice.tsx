import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    CircularProgress,
    Alert,
    Container,
    Card,
    CardContent,
    Stack,
    Chip,
    LinearProgress,
} from '@mui/material';
import {
    School,
    PlayArrow,
    Delete,
    CheckCircle,
    InsertDriveFile,
    PictureAsPdf,
} from '@mui/icons-material';
import { Note } from '../constants/consts';
import NoteView from '../components/NoteView';
import { auth } from '../firebase';
import { API_URL } from '../config/api';

const PracticePage: React.FC = () => {
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    const handleBackToList = () => {
        setSelectedNote(null);
        fetchNotes(); // Refresh notes when going back
    };

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

            fetchNotes();
        } catch (err: any) {
            console.error('Error deleting note:', err);
            alert('Failed to delete note. Please try again.');
        }
    };

    if (selectedNote) {
        return <NoteView note={selectedNote} onBack={handleBackToList} />;
    }

    const getProgress = (note: Note) => {
        const completed = note.questions.filter(q => q.completed).length;
        const total = note.questions.length;
        return { completed, total, percentage: (completed / total) * 100 };
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            background: '#1976d2',
            py: 6,
        }}>
            <Container maxWidth="lg">
                <Typography
                    variant="h3"
                    sx={{
                        color: 'white',
                        fontWeight: 700,
                        mb: 1,
                        textAlign: 'center',
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                >
                    <School sx={{ fontSize: 48, verticalAlign: 'middle', mr: 2 }} />
                    Practice Questions
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        color: 'rgba(255,255,255,0.9)',
                        mb: 4,
                        textAlign: 'center'
                    }}
                >
                    Review your study materials and test your knowledge
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                <Card sx={{
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.98)',
                }}>
                    <CardContent sx={{ p: 4 }}>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                <CircularProgress sx={{ color: '#1976d2' }} size={60} />
                            </Box>
                        ) : notes.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <School sx={{ fontSize: 80, color: 'rgba(0,0,0,0.2)', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                    No study materials yet
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Go to Upload to add your first notes and generate practice questions!
                                </Typography>
                            </Box>
                        ) : (
                            <Stack spacing={3}>
                                {notes.map((note) => {
                                    const progress = getProgress(note);
                                    const isCompleted = progress.completed === progress.total;

                                    return (
                                        <Paper
                                            key={note.id}
                                            elevation={0}
                                            sx={{
                                                border: '2px solid',
                                                borderColor: isCompleted ? '#4caf50' : 'rgba(0,0,0,0.12)',
                                                borderRadius: 3,
                                                p: 3,
                                                background: isCompleted ? 'rgba(76, 175, 80, 0.05)' : 'white',
                                            }}
                                        >
                                            <Stack spacing={2}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                            {(note as any).sourceType === 'pdf' ? (
                                                                <PictureAsPdf sx={{ color: '#1976d2', fontSize: 28 }} />
                                                            ) : (
                                                                <InsertDriveFile sx={{ color: '#1976d2', fontSize: 28 }} />
                                                            )}
                                                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                                                {note.title}
                                                            </Typography>
                                                            {isCompleted && (
                                                                <CheckCircle sx={{ color: '#4caf50', fontSize: 24 }} />
                                                            )}
                                                        </Box>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                            Added on {note.dateAdded}
                                                        </Typography>
                                                    </Box>
                                                    <Chip
                                                        label={`${progress.completed}/${progress.total}`}
                                                        sx={{
                                                            background: isCompleted
                                                                ? '#1976d2'
                                                                : '#1976d2',
                                                            color: 'white',
                                                            fontWeight: 600,
                                                            fontSize: '0.9rem',
                                                            px: 1,
                                                        }}
                                                    />
                                                </Box>

                                                <Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            Progress
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {Math.round(progress.percentage)}%
                                                        </Typography>
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={progress.percentage}
                                                        sx={{
                                                            height: 8,
                                                            borderRadius: 4,
                                                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                                            '& .MuiLinearProgress-bar': {
                                                                borderRadius: 4,
                                                                background: isCompleted
                                                                    ? '#1976d2'
                                                                    : '#1976d2',
                                                            }
                                                        }}
                                                    />
                                                </Box>

                                                {note.summary && (
                                                    <Typography variant="body2" color="text.secondary" sx={{
                                                        fontStyle: 'italic',
                                                        borderLeft: '3px solid #1976d2',
                                                        pl: 2,
                                                        py: 1,
                                                        background: 'rgba(102, 126, 234, 0.05)',
                                                        borderRadius: 1,
                                                    }}>
                                                        {note.summary}
                                                    </Typography>
                                                )}

                                                <Box sx={{ display: 'flex', gap: 2, pt: 1 }}>
                                                    <Button
                                                        variant="contained"
                                                        startIcon={<PlayArrow />}
                                                        onClick={() => setSelectedNote(note)}
                                                        fullWidth
                                                        sx={{
                                                            py: 1.5,
                                                            borderRadius: 2,
                                                            background: '#1976d2',
                                                            fontWeight: 600,
                                                            textTransform: 'none',
                                                        }}
                                                    >
                                                        Start Practice
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        startIcon={<Delete />}
                                                        onClick={() => handleDeleteNote(note.id)}
                                                        sx={{
                                                            py: 1.5,
                                                            borderRadius: 2,
                                                            borderColor: '#f44336',
                                                            color: '#f44336',
                                                            fontWeight: 600,
                                                            textTransform: 'none',
                                                            minWidth: '120px',
                                                        }}
                                                    >
                                                        Delete
                                                    </Button>
                                                </Box>
                                            </Stack>
                                        </Paper>
                                    );
                                })}
                            </Stack>
                        )}
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default PracticePage;

