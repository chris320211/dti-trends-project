import React from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  CloudUpload,
  School,
  TrendingUp,
  AssignmentTurnedIn,
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthUserProvider';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const username = user?.displayName || user?.email || "Student";

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
          Welcome, {username}!
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255,255,255,0.9)',
            mb: 4,
            textAlign: 'center'
          }}
        >
          Your AI-powered study companion
        </Typography>

        <Card sx={{
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          background: 'rgba(255,255,255,0.98)',
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                mb: 3,
                color: '#667eea',
              }}
            >
              About Bear Study Buddy
            </Typography>

            <List>
              <ListItem sx={{ py: 2 }}>
                <ListItemIcon>
                  <CloudUpload sx={{ color: '#667eea', fontSize: 32 }} />
                </ListItemIcon>
                <ListItemText
                  primary="Upload Notes"
                  secondary="Upload your study notes or PDFs and let our AI generate practice questions to help you learn better."
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '1.1rem' }}
                />
              </ListItem>

              <ListItem sx={{ py: 2 }}>
                <ListItemIcon>
                  <School sx={{ color: '#667eea', fontSize: 32 }} />
                </ListItemIcon>
                <ListItemText
                  primary="View Practice Questions"
                  secondary="The Practice tab shows all your uploaded notes and their corresponding practice questions. Click on any note to see its questions."
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '1.1rem' }}
                />
              </ListItem>

              <ListItem sx={{ py: 2 }}>
                <ListItemIcon>
                  <AssignmentTurnedIn sx={{ color: '#667eea', fontSize: 32 }} />
                </ListItemIcon>
                <ListItemText
                  primary="Track Your Progress"
                  secondary="Mark each question as done using checkboxes to keep track of what you've completed."
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '1.1rem' }}
                />
              </ListItem>

              <ListItem sx={{ py: 2 }}>
                <ListItemIcon>
                  <TrendingUp sx={{ color: '#667eea', fontSize: 32 }} />
                </ListItemIcon>
                <ListItemText
                  primary="View Stats"
                  secondary="Check the Stats page to see your study streak, daily goals, total questions answered, and other progress metrics."
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '1.1rem' }}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default HomePage;