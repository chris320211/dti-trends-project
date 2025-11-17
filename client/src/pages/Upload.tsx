import React, { useState } from 'react';
import { 
    Box, 
    TextField, 
    Button, 
    Typography, 
    FormControl, 
    FormLabel, 
    RadioGroup, 
    FormControlLabel, 
    Radio,
    Paper
} from '@mui/material';

const UploadPage: React.FC = () => {
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [questionOption, setQuestionOption] = useState('5'); 
    const [customQuestionCount, setCustomQuestionCount] = useState('');

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        
        let numQuestions = 5;
        if (questionOption === 'custom') {
            numQuestions = parseInt(customQuestionCount) || 0;
        } else {
            numQuestions = parseInt(questionOption);
        }

        if (numQuestions > 40) {
            alert('max 40 questions allowed');
            return;
        }

        console.log('Uploading:', {
            title,
            notes,
            numQuestions
        });
    };

    return (
        <Box sx={{ padding: 4, maxWidth: '800px', margin: '0 auto' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                Upload
            </Typography>

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
                            sx={{
                                px: 4,
                                py: 1.5,
                                fontSize: '1rem',
                                textTransform: 'none',
                            }}
                        >
                            Upload
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default UploadPage;

