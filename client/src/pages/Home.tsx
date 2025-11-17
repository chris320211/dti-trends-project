import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText } from "@mui/material";

const HomePage: React.FC = () => {
  // For now, we'll use a placeholder username
  // Later, this will come from your authentication system
  const username = "Student"; // TODO: Get from auth context/state

  return (
    <Box sx={{ padding: 4 }}>
      {/* Welcome Message - Biggest Font */}
      <Typography 
        variant="h2" 
        component="h1" 
        sx={{ 
          fontWeight: 'bold', 
          mb: 4,
          textAlign: 'center'
        }}
      >
        Welcome, {username}!
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ width: '100%', maxWidth: '800px', justifyContent: 'center' }}>
          <Paper elevation={3} sx={{ padding: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 'bold', justifyContent: 'center' }}>
              About Bear Study Buddy
            </Typography>
            
            <List>
              <ListItem>
                <ListItemText 
                  primary="📚 Upload Your Notes"
                  secondary="Upload your study notes and let our AI generate practice questions to help you learn better."
                />
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="❓ Practice Questions"
                  secondary="The Practice tab shows all your uploaded notes and their corresponding practice questions. Click on any note to see its questions."
                />
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="✅ Track Your Progress"
                  secondary="Mark each question as done using checkboxes to keep track of what you've completed."
                />
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="📊 View Your Stats"
                  secondary="Check your Stats page to see your study streak, total questions answered, and other progress metrics."
                />
              </ListItem>
            </List>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;