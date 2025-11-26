import React, { useState } from 'react';
import { Box, Typography, Checkbox, FormControlLabel, Button, Paper, List, ListItem } from '@mui/material';
import { Note } from '../constants/consts';
import { auth } from '../firebase';

const API_URL = 'http://localhost:1010';

interface NoteViewProps {
    note: Note;
    onBack: () => void;
}

const NoteView: React.FC<NoteViewProps> = ({ note, onBack }) => {
    const [questions, setQuestions] = useState(note.questions);
    const [showNotes, setShowNotes] = useState(false);
    const [visibleAnswers, setVisibleAnswers] = useState<Set<string>>(new Set());

    const handleToggle = async (questionId: string) => {
        const updatedQuestions = questions.map(q =>
            q.id === questionId ? { ...q, completed: !q.completed } : q
        );
        setQuestions(updatedQuestions);

        try {
            const user = auth.currentUser;
            if (!user) return;

            const token = await user.getIdToken();
            const question = updatedQuestions.find(q => q.id === questionId);

            await fetch(`${API_URL}/api/notes/${note.id}/questions/${questionId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    completed: question?.completed
                })
            });
        } catch (error) {
            console.error('Failed to update question status:', error);
        }
    };

    const toggleAnswer = (questionId: string) => {
        setVisibleAnswers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
    };

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

            <Paper elevation={3} sx={{ padding: 3, mb: 4, backgroundColor: '#e3f2fd' }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
                    Summary
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {note.summary}
                </Typography>
            </Paper>

            {showNotes && (
                <Paper elevation={3} sx={{ padding: 3, mb: 4, backgroundColor: '#f5f5f5' }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
                        Original Notes
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {note.notes}
                    </Typography>
                </Paper>
            )}

            <Paper elevation={3} sx={{ padding: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
                    Practice Questions
                </Typography>
                <List>
                    {questions.map((question) => (
                        <ListItem
                            key={question.id}
                            sx={{
                                display: 'block',
                                py: 2,
                                borderBottom: '1px solid #e0e0e0',
                                '&:last-child': { borderBottom: 'none' }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
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
                                                color: question.completed ? 'text.secondary' : 'text.primary',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            {question.question}
                                        </Typography>
                                    }
                                    sx={{ flex: 1, mr: 2 }}
                                />
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => toggleAnswer(question.id)}
                                    sx={{
                                        textTransform: 'none',
                                        minWidth: '120px'
                                    }}
                                >
                                    {visibleAnswers.has(question.id) ? 'Hide Answer' : 'Show Answer'}
                                </Button>
                            </Box>
                            {visibleAnswers.has(question.id) && (
                                <Box
                                    sx={{
                                        mt: 2,
                                        ml: 5,
                                        p: 2,
                                        backgroundColor: '#f0f7ff',
                                        borderRadius: 1,
                                        borderLeft: '4px solid #1976d2'
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 'bold',
                                            color: '#1976d2',
                                            mb: 1
                                        }}
                                    >
                                        Answer:
                                    </Typography>
                                    <Typography variant="body2">
                                        {question.answer}
                                    </Typography>
                                </Box>
                            )}
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Box>
    );
};

export default NoteView;

