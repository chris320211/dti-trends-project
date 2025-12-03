import React from 'react';
import { Box, Typography, Container, Stack } from "@mui/material";
import UserStats from "../components/UserStats";
import DailyGoals from "../components/DailyGoalPanel";

const StatsPage: React.FC = () => {
  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 6,
    }}>
      <Container maxWidth="lg">
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
          Your Progress Dashboard
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255,255,255,0.9)',
            mb: 5,
            textAlign: 'center'
          }}
        >
          Track your learning journey and achieve your goals
        </Typography>

        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={4}
          sx={{ justifyContent: 'center' }}
        >
          <Box sx={{ flex: { xs: 1, lg: 2 } }}>
            <UserStats />
          </Box>
          <Box sx={{ flex: { xs: 1, lg: 1 } }}>
            <DailyGoals />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default StatsPage;

