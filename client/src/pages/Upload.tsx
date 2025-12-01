import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    Paper,
    CircularProgress,
    Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const API_URL = 'http://localhost:1010';

const UploadPage: React.FC = () => {
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [questionOption, setQuestionOption] = useState('5');
    const [customQuestionCount, setCustomQuestionCount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        let numQuestions = 5;
        if (questionOption === 'custom') {
            numQuestions = parseInt(customQuestionCount) || 0;
        } else {
            numQuestions = parseInt(questionOption);
        }

        if (numQuestions > 40) {
            setError('Max 40 questions allowed');
            return;
        }

        if (numQuestions < 1) {
            setError('Please enter a valid number of questions');
            return;
        }

        try {
            setLoading(true);

            // Get Firebase auth token
            const user = auth.currentUser;
            if (!user) {
                setError('You must be logged in to upload notes');
                setLoading(false);
                return;
            }

            const token = await user.getIdToken();

            // Call backend API to generate questions
            const response = await fetch(`${API_URL}/api/notes/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    notes,
                    numQuestions
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate practice questions');
            }

            setSuccess(true);
            setTitle('');
            setNotes('');
            setQuestionOption('5');
            setCustomQuestionCount('');

            // Redirect to practice page after 2 seconds
            setTimeout(() => {
                navigate('/practice');
            }, 2000);

        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to upload notes. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ padding: 4, maxWidth: '800px', margin: '0 auto' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Upload
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    Practice questions generated successfully! Redirecting to Practice page...
                </Alert>
            )}

            <Paper elevation={3} sx={{ padding: 4 }}>
                <Box component="form" onSubmit={handleUpload}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body1" sx={{ mb: 1, fontWeight: 'medium' }}>
                            Title:
                        </Typography>
                        <TextField
                            fullWidth
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter a title for your notes"
                            variant="outlined"
                        />
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body1" sx={{ mb: 1, fontWeight: 'medium' }}>
                            Notes:
                        </Typography>
                        <TextField
                            fullWidth
                            required
                            multiline
                            rows={6}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Enter your study notes here..."
                            variant="outlined"
                            sx={{
                                '& .MuiInputBase-root': {
                                    minHeight: '150px',
                                }
                            }}
                        />
                    </Box>

                    <Box sx={{ mb: 4 }}>
                        <Typography variant="body1" sx={{ mb: 2, fontWeight: 'medium' }}>
                            Number of Questions to Generate (max 40)
                        </Typography>
                        <FormControl component="fieldset">
                            <RadioGroup
                                value={questionOption}
                                onChange={(e) => setQuestionOption(e.target.value)}
                            >
                                <FormControlLabel value="5" control={<Radio />} label="5" />
                                <FormControlLabel value="10" control={<Radio />} label="10" />
                                <FormControlLabel value="20" control={<Radio />} label="20" />
                                <FormControlLabel 
                                    value="custom" 
                                    control={<Radio />} 
                                    label={
                                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                            custom:
                                            {questionOption === 'custom' && (
                                                <TextField
                                                    type="number"
                                                    value={customQuestionCount}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        // Limit to max 40
                                                        if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 40)) {
                                                            setCustomQuestionCount(value);
                                                        }
                                                    }}
                                                    inputProps={{ min: 1, max: 40 }}
                                                    sx={{ width: '80px', ml: 1 }}
                                                    variant="outlined"
                                                    size="small"
                                                    required={questionOption === 'custom'}
                                                />
                                            )}
                                        </span>
                                    }
                                />
                            </RadioGroup>
                        </FormControl>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                px: 4,
                                py: 1.5,
                                fontSize: '1rem',
                                textTransform: 'none',
                            }}
                        >
                            {loading ? (
                                <>
                                    <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                                    Generating Questions...
                                </>
                            ) : (
                                'Upload'
                            )}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default UploadPage;

