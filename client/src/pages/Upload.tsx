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
    Alert,
    Container,
    Stack,
    Chip,
    Divider,
    Card,
    CardContent,
    Tab,
    Tabs,
} from '@mui/material';
import {
    CloudUpload,
    Description,
    PictureAsPdf,
    Send,
    AutoAwesome,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const API_URL = 'http://localhost:1010';

const UploadPage: React.FC = () => {
    const [uploadMode, setUploadMode] = useState<'text' | 'pdf'>('text');
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [questionOption, setQuestionOption] = useState('10');
    const [customQuestionCount, setCustomQuestionCount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                setError('Please upload a PDF file');
                return;
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                setError('File size must be less than 10MB');
                return;
            }
            setPdfFile(file);
            if (!title) {
                setTitle(file.name.replace('.pdf', ''));
            }
            setError('');
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        let numQuestions = 10;
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

        if (uploadMode === 'pdf' && !pdfFile) {
            setError('Please select a PDF file');
            return;
        }

        if (uploadMode === 'text' && !notes.trim()) {
            setError('Please enter your notes');
            return;
        }

        try {
            setLoading(true);

            const user = auth.currentUser;
            if (!user) {
                setError('You must be logged in to upload notes');
                setLoading(false);
                return;
            }

            const token = await user.getIdToken();

            let response;

            if (uploadMode === 'pdf' && pdfFile) {
                const formData = new FormData();
                formData.append('pdf', pdfFile);
                formData.append('title', title);
                formData.append('numQuestions', numQuestions.toString());

                response = await fetch(`${API_URL}/api/notes/generate-from-pdf`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });
            } else {
                response = await fetch(`${API_URL}/api/notes/generate`, {
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
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate practice questions');
            }

            setSuccess(true);
            setTitle('');
            setNotes('');
            setPdfFile(null);
            setQuestionOption('10');
            setCustomQuestionCount('');

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
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            py: 6,
        }}>
            <Container maxWidth="md">
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
                    Upload Study Materials
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        color: 'rgba(255,255,255,0.9)',
                        mb: 4,
                        textAlign: 'center'
                    }}
                >
                    Generate AI-powered practice questions from your notes or PDFs
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert
                        severity="success"
                        sx={{ mb: 3, borderRadius: 2 }}
                        icon={<AutoAwesome />}
                    >
                        Practice questions generated successfully! Redirecting to Practice page...
                    </Alert>
                )}

                <Card sx={{
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    background: 'rgba(255,255,255,0.98)',
                }}>
                    <CardContent sx={{ p: 4 }}>
                        <Box component="form" onSubmit={handleUpload}>
                            {/* Upload Mode Tabs */}
                            <Box sx={{ mb: 4 }}>
                                <Tabs
                                    value={uploadMode}
                                    onChange={(_, value) => {
                                        setUploadMode(value);
                                        setError('');
                                        setPdfFile(null);
                                        setNotes('');
                                    }}
                                    sx={{
                                        '& .MuiTabs-indicator': {
                                            backgroundColor: '#667eea',
                                        },
                                    }}
                                >
                                    <Tab
                                        value="text"
                                        icon={<Description />}
                                        iconPosition="start"
                                        label="Text Notes"
                                        sx={{
                                            textTransform: 'none',
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            '&.Mui-selected': {
                                                color: '#667eea',
                                            },
                                        }}
                                    />
                                    <Tab
                                        value="pdf"
                                        icon={<PictureAsPdf />}
                                        iconPosition="start"
                                        label="PDF Upload"
                                        sx={{
                                            textTransform: 'none',
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            '&.Mui-selected': {
                                                color: '#667eea',
                                            },
                                        }}
                                    />
                                </Tabs>
                            </Box>

                            <Divider sx={{ mb: 4 }} />

                            {/* Title Field */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Description sx={{ color: '#667eea' }} />
                                    Title
                                </Typography>
                                <TextField
                                    fullWidth
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter a title for your study material"
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#667eea',
                                            },
                                        },
                                    }}
                                />
                            </Box>

                            {/* Content Input - Text or PDF */}
                            {uploadMode === 'text' ? (
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Description sx={{ color: '#667eea' }} />
                                        Study Notes
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        required
                                        multiline
                                        rows={10}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Paste your study notes here... The AI will analyze your content and generate comprehensive practice questions."
                                        variant="outlined"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#667eea',
                                                },
                                            },
                                            '& .MuiInputBase-root': {
                                                minHeight: '250px',
                                                fontFamily: 'monospace',
                                            }
                                        }}
                                    />
                                </Box>
                            ) : (
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PictureAsPdf sx={{ color: '#667eea' }} />
                                        Upload PDF
                                    </Typography>
                                    <Box
                                        sx={{
                                            border: '2px dashed',
                                            borderColor: pdfFile ? '#667eea' : 'rgba(0,0,0,0.23)',
                                            borderRadius: 2,
                                            p: 4,
                                            textAlign: 'center',
                                            background: pdfFile ? 'rgba(102, 126, 234, 0.05)' : 'transparent',
                                            transition: 'all 0.2s ease-in-out',
                                            '&:hover': {
                                                borderColor: '#667eea',
                                                background: 'rgba(102, 126, 234, 0.05)',
                                            },
                                        }}
                                    >
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={handleFileChange}
                                            style={{ display: 'none' }}
                                            id="pdf-upload"
                                        />
                                        <label htmlFor="pdf-upload">
                                            {pdfFile ? (
                                                <Stack spacing={2} alignItems="center">
                                                    <PictureAsPdf sx={{ fontSize: 48, color: '#667eea' }} />
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                        {pdfFile.name}
                                                    </Typography>
                                                    <Chip
                                                        label={`${(pdfFile.size / 1024 / 1024).toFixed(2)} MB`}
                                                        size="small"
                                                        sx={{ background: '#667eea', color: 'white' }}
                                                    />
                                                    <Button
                                                        variant="outlined"
                                                        component="span"
                                                        sx={{
                                                            borderColor: '#667eea',
                                                            color: '#667eea',
                                                            '&:hover': {
                                                                borderColor: '#5568d3',
                                                                background: 'rgba(102, 126, 234, 0.08)',
                                                            },
                                                        }}
                                                    >
                                                        Change File
                                                    </Button>
                                                </Stack>
                                            ) : (
                                                <Stack spacing={2} alignItems="center">
                                                    <CloudUpload sx={{ fontSize: 64, color: 'rgba(0,0,0,0.3)' }} />
                                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                        Drop your PDF here or click to browse
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Maximum file size: 10MB
                                                    </Typography>
                                                    <Button
                                                        variant="contained"
                                                        component="span"
                                                        startIcon={<CloudUpload />}
                                                        sx={{
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            '&:hover': {
                                                                background: 'linear-gradient(135deg, #5568d3 0%, #65408b 100%)',
                                                            },
                                                        }}
                                                    >
                                                        Select PDF File
                                                    </Button>
                                                </Stack>
                                            )}
                                        </label>
                                    </Box>
                                </Box>
                            )}

                            {/* Question Count Options */}
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AutoAwesome sx={{ color: '#667eea' }} />
                                    Number of Questions (max 40)
                                </Typography>
                                <FormControl component="fieldset">
                                    <RadioGroup
                                        value={questionOption}
                                        onChange={(e) => setQuestionOption(e.target.value)}
                                        sx={{ gap: 1 }}
                                    >
                                        <FormControlLabel
                                            value="5"
                                            control={<Radio sx={{ '&.Mui-checked': { color: '#667eea' } }} />}
                                            label={<Typography sx={{ fontWeight: 500 }}>5 questions - Quick review</Typography>}
                                            sx={{
                                                border: '2px solid',
                                                borderColor: questionOption === '5' ? '#667eea' : 'rgba(0,0,0,0.12)',
                                                borderRadius: 2,
                                                px: 2,
                                                py: 1,
                                                mx: 0,
                                                background: questionOption === '5' ? 'rgba(102, 126, 234, 0.05)' : 'transparent',
                                            }}
                                        />
                                        <FormControlLabel
                                            value="10"
                                            control={<Radio sx={{ '&.Mui-checked': { color: '#667eea' } }} />}
                                            label={<Typography sx={{ fontWeight: 500 }}>10 questions - Standard practice</Typography>}
                                            sx={{
                                                border: '2px solid',
                                                borderColor: questionOption === '10' ? '#667eea' : 'rgba(0,0,0,0.12)',
                                                borderRadius: 2,
                                                px: 2,
                                                py: 1,
                                                mx: 0,
                                                background: questionOption === '10' ? 'rgba(102, 126, 234, 0.05)' : 'transparent',
                                            }}
                                        />
                                        <FormControlLabel
                                            value="20"
                                            control={<Radio sx={{ '&.Mui-checked': { color: '#667eea' } }} />}
                                            label={<Typography sx={{ fontWeight: 500 }}>20 questions - Deep dive</Typography>}
                                            sx={{
                                                border: '2px solid',
                                                borderColor: questionOption === '20' ? '#667eea' : 'rgba(0,0,0,0.12)',
                                                borderRadius: 2,
                                                px: 2,
                                                py: 1,
                                                mx: 0,
                                                background: questionOption === '20' ? 'rgba(102, 126, 234, 0.05)' : 'transparent',
                                            }}
                                        />
                                        <FormControlLabel
                                            value="custom"
                                            control={<Radio sx={{ '&.Mui-checked': { color: '#667eea' } }} />}
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography sx={{ fontWeight: 500 }}>Custom:</Typography>
                                                    {questionOption === 'custom' && (
                                                        <TextField
                                                            type="number"
                                                            value={customQuestionCount}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 40)) {
                                                                    setCustomQuestionCount(value);
                                                                }
                                                            }}
                                                            slotProps={{
                                                                input: {
                                                                    inputProps: { min: 1, max: 40 }
                                                                }
                                                            }}
                                                            sx={{
                                                                width: '100px',
                                                                '& .MuiOutlinedInput-root': {
                                                                    '&.Mui-focused fieldset': {
                                                                        borderColor: '#667eea',
                                                                    },
                                                                },
                                                            }}
                                                            size="small"
                                                            required={questionOption === 'custom'}
                                                        />
                                                    )}
                                                </Box>
                                            }
                                            sx={{
                                                border: '2px solid',
                                                borderColor: questionOption === 'custom' ? '#667eea' : 'rgba(0,0,0,0.12)',
                                                borderRadius: 2,
                                                px: 2,
                                                py: 1,
                                                mx: 0,
                                                background: questionOption === 'custom' ? 'rgba(102, 126, 234, 0.05)' : 'transparent',
                                            }}
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </Box>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={loading}
                                startIcon={loading ? null : <Send />}
                                sx={{
                                    py: 2,
                                    borderRadius: 2,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    fontWeight: 600,
                                    fontSize: '1.1rem',
                                    textTransform: 'none',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #5568d3 0%, #65408b 100%)',
                                        boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                                    },
                                    '&:disabled': {
                                        background: 'rgba(0,0,0,0.12)',
                                    },
                                }}
                            >
                                {loading ? (
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <CircularProgress size={24} sx={{ color: 'white' }} />
                                        <span>Generating AI-Powered Questions...</span>
                                    </Stack>
                                ) : (
                                    `Generate Practice Questions`
                                )}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default UploadPage;

