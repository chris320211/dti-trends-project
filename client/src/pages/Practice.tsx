import React, { useState } from 'react';
import { Box, Typography, Paper, Button, List, ListItem } from '@mui/material';
import { dummyNotes, Note } from '../constants/consts';
import NoteView from '../components/NoteView';

const PracticePage: React.FC = () => {
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);

    if (selectedNote) {
        return <NoteView note={selectedNote} onBack={() => setSelectedNote(null)} />;
    }

    const getProgress = (note: Note) => {
        const completed = note.questions.filter(q => q.completed).length;
        return `${completed}/${note.questions.length}`;
    };

    return (
        <Box sx={{ padding: 4, maxWidth: '1000px', margin: '0 auto' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Practice
            </Typography>

            {dummyNotes.length === 0 ? (
                <Typography variant="body1" color="text.secondary">
                    No notes uploaded yet. Go to Upload to add your first notes!
                </Typography>
            ) : (
                <List>
                    {dummyNotes.map((note) => (
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
                                        onClick={() => {
                                            // TODO: add delete
                                            console.log('Delete note:', note.id);
                                        }}
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

