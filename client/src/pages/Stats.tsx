import React from 'react';
import { Box, Grid } from "@mui/material";
import UserStats from "../components/UserStats";
import DailyGoals from "../components/DailyGoalPanel";

const StatsPage: React.FC = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={4} justifyContent="center">
        <Grid>
            <UserStats />
        </Grid>
        <Grid>
            <DailyGoals />
        </Grid>
      </Grid>
    </Box>
  );
};

export default StatsPage;

