import React, { useState } from 'react';
import { Box, Typography, Checkbox, FormControlLabel, Button, Paper, List, ListItem } from '@mui/material';
import { Note } from '../constants/consts';

interface NoteViewProps {
    note: Note;
    onBack: () => void;
}

const NoteView: React.FC<NoteViewProps> = ({ note, onBack }) => {
    const [questions, setQuestions] = useState(note.questions);
    const [showNotes, setShowNotes] = useState(false);

    // Handle checkbox change
    const handleToggle = (questionId: string) => {
        setQuestions(questions.map(q => 
            q.id === questionId ? { ...q, completed: !q.completed } : q
        ));
    };

    // Calculate progress
    const completedCount = questions.filter(q => q.completed).length;
    const totalQuestions = questions.length;

    return (
        <Box sx={{ padding: 4, maxWidth: '1000px', margin: '0 auto' }}>
            <Button
                onClick={() => {
                    onBack();
                }}
                variant="outlined"
                sx={{ mb: 3, textTransform: 'none' }}
            >
                ← Back to Notes List
            </Button>

            {/* Title and Progress */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {note.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    Progress: {completedCount} / {totalQuestions} questions
                </Typography>
                <Box sx={{ mt: 2 }}>
                    <Button
                        variant="contained"
                        onClick={() => setShowNotes(!showNotes)}
                        sx={{ 
                            textTransform: 'none',
                            px: 3,
                            py: 1
                        }}
                    >
                        {showNotes ? 'Hide Notes' : 'Show Notes'}
                    </Button>
                </Box>
            </Box>

            {/* Notes Display */}
            {showNotes && (
                <Paper elevation={3} sx={{ padding: 3, mb: 4, backgroundColor: '#f5f5f5' }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
                        Notes
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {note.notes}
                    </Typography>
                </Paper>
            )}

            {/* Questions List */}
            <Paper elevation={3} sx={{ padding: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
                    Practice Questions
                </Typography>
                <List>
                    {questions.map((question) => (
                        <ListItem key={question.id} sx={{ display: 'flex', alignItems: 'flex-start', py: 2 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={question.completed}
                                        onChange={() => handleToggle(question.id)}
                                    />
                                }
                                label={
                                    <Typography 
                                        sx={{ 
                                            textDecoration: question.completed ? 'line-through' : 'none',
                                            color: question.completed ? 'text.secondary' : 'text.primary'
                                        }}
                                    >
                                        {question.question}
                                    </Typography>
                                }
                                sx={{ width: '100%' }}
                            />
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Box>
    );
};

export default NoteView;

