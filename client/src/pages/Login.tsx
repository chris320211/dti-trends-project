import React from 'react';
import { Box, Button, Typography, Paper, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../auth/auth';
import { useAuth } from '../auth/AuthUserProvider';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    React.useEffect(() => {
        if (user) {
            navigate('/home');
        }
    }, [user, navigate]);

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithGoogle();
            if (result) {
                console.log("Google sign-in successful");
            } else {
                console.error("Google sign-in failed - no result returned");
            }
        } catch (error) {
            console.error("Google sign-in error:", error);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        borderRadius: 2,
                    }}
                >
                    <Typography component="h1" variant="h3" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
                        Bear Study Buddy
                    </Typography>
                    <Box sx={{ width: '100%' }}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleGoogleLogin}
                            sx={{
                                py: 1.5,
                                fontSize: '1rem',
                                textTransform: 'none',
                            }}
                        >
                            Sign in with Google
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default LoginPage;

