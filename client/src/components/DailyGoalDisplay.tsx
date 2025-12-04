import React from "react";
import { Typography, Stack, Button, Box, Divider } from "@mui/material";
import { Edit, School, CloudUpload, Flag } from "@mui/icons-material";
import type { Goals } from "./DailyGoalPanel";

type DailyGoalDisplayProps = {
  goals: Goals;
  onEdit: () => void;
};

const DailyGoalDisplay: React.FC<DailyGoalDisplayProps> = ({ goals, onEdit }) => {
  return (
    <Stack spacing={3}>
      <Box>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <Flag sx={{ color: '#1976d2', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Daily Goals
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Set your daily targets to stay motivated
        </Typography>
      </Box>

      <Divider />

      <Stack spacing={2.5}>
        <Box
          sx={{
            p: 2.5,
            borderRadius: 2,
            background: 'rgba(25, 118, 210, 0.08)',
            border: '2px solid',
            borderColor: 'rgba(25, 118, 210, 0.2)',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: '#1976d2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <School />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Questions per day
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2' }}>
                {goals.questionsPerDay}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            p: 2.5,
            borderRadius: 2,
            background: 'rgba(25, 118, 210, 0.08)',
            border: '2px solid',
            borderColor: 'rgba(25, 118, 210, 0.2)',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: '#1976d2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <CloudUpload />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Uploads per day
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2' }}>
                {goals.uploadsPerDay}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Stack>

      <Button
        variant="contained"
        startIcon={<Edit />}
        onClick={onEdit}
        fullWidth
        sx={{
          mt: 2,
          py: 1.5,
          borderRadius: 2,
          background: '#1976d2',
          fontWeight: 600,
          textTransform: 'none',
          fontSize: '1rem',
        }}
      >
        Edit Goals
      </Button>
    </Stack>
  );
};

export default DailyGoalDisplay;