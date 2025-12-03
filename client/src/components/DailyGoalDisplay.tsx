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
          <Flag sx={{ color: '#667eea', fontSize: 28 }} />
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
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
            border: '2px solid',
            borderColor: 'rgba(102, 126, 234, 0.2)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: 'rgba(102, 126, 234, 0.4)',
              transform: 'translateX(4px)',
            },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#667eea' }}>
                {goals.questionsPerDay}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            p: 2.5,
            borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.08) 0%, rgba(245, 87, 108, 0.08) 100%)',
            border: '2px solid',
            borderColor: 'rgba(240, 147, 251, 0.2)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: 'rgba(240, 147, 251, 0.4)',
              transform: 'translateX(4px)',
            },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#f5576c' }}>
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          fontWeight: 600,
          textTransform: 'none',
          fontSize: '1rem',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5568d3 0%, #65408b 100%)',
            boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
          },
        }}
      >
        Edit Goals
      </Button>
    </Stack>
  );
};

export default DailyGoalDisplay;