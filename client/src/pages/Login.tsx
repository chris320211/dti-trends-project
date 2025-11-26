import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Container } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmail, signInWithGoogle } from '../auth/auth';
import { useAuth } from '../auth/AuthUserProvider';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    React.useEffect(() => {
        if (user) {
            navigate('/home');
        }
    }, [user, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await signInWithEmail(email, password);
            if (result) {
                console.log("Email sign-in successful");
            } else {
                console.error("Email sign-in failed - no result returned");
            }
        } catch (error) {
            console.error("Email sign-in error:", error);
        }
    };

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
                    <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{ mb: 3 }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{
                                py: 1.5,
                                fontSize: '1rem',
                                textTransform: 'none',
                                mb: 2,
                            }}
                        >
                            Sign In
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={handleGoogleLogin}
                            sx={{
                                py: 1.5,
                                fontSize: '1rem',
                                textTransform: 'none',
                                mb: 2,
                            }}
                        >
                            Sign in with Google
                        </Button>
                        <Button
                            component={Link}
                            to="/register"
                            fullWidth
                            variant="outlined"
                            sx={{
                                py: 1.5,
                                fontSize: '1rem',
                                textTransform: 'none',
                            }}
                        >
                            Create Account
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default LoginPage;

