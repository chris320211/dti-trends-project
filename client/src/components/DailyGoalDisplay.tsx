import React from "react";
import { Typography, Stack, Button } from "@mui/material";
import type { Goals } from "./DailyGoalPanel";

type DailyGoalDisplayProps = {
  goals: Goals;
  onEdit: () => void;
};

const DailyGoalDisplay: React.FC<DailyGoalDisplayProps> = ({ goals, onEdit }) => {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        Daily Goal
      </Typography>

      <Stack spacing={1} sx={{ mb: 2 }}>
        <Typography>{goals.uploadsPerDay} uploads</Typography>
        <Typography>{goals.questionsPerDay} questions answered</Typography>
      </Stack>

      <Button variant="outlined" onClick={onEdit}>
        Edit
      </Button>
    </>
  );
};

export default DailyGoalDisplay;