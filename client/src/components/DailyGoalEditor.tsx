import React, { useState } from "react";
import { Typography, Stack, TextField, Button, Box, Divider } from "@mui/material";
import { Save, Cancel, Flag, School, CloudUpload } from "@mui/icons-material";
import type { Goals } from "./DailyGoalPanel";

type DailyGoalEditorProps = {
  goals: Goals;
  onSave: (newGoals: Goals) => void;
  onCancel: () => void;
};

const DailyGoalEditor: React.FC<DailyGoalEditorProps> = ({
  goals,
  onSave,
  onCancel,
}) => {
  const [draft, setDraft] = useState<Goals>(goals);

  const handleChange =
    (field: keyof Goals) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setDraft((prev) => ({
        ...prev,
        [field]: Number(e.target.value),
      }));
    };

  const handleSaveClick = () => {
    onSave(draft);
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <Flag sx={{ color: '#1976d2', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Edit Daily Goals
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Adjust your targets to match your learning pace
        </Typography>
      </Box>

      <Divider />

      <Stack spacing={3}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: '#1976d2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <School sx={{ fontSize: 20 }} />
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Questions per day
            </Typography>
          </Stack>
          <TextField
            type="number"
            value={draft.questionsPerDay}
            onChange={handleChange("questionsPerDay")}
            fullWidth
            inputProps={{ min: 0, max: 100 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': {
                  borderColor: 'rgba(25, 118, 210, 0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1976d2',
                },
              },
            }}
          />
        </Box>

        <Box>
          <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: '#1976d2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <CloudUpload sx={{ fontSize: 20 }} />
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Uploads per day
            </Typography>
          </Stack>
          <TextField
            type="number"
            value={draft.uploadsPerDay}
            onChange={handleChange("uploadsPerDay")}
            fullWidth
            inputProps={{ min: 0, max: 50 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': {
                  borderColor: 'rgba(25, 118, 210, 0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1976d2',
                },
              },
            }}
          />
        </Box>
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSaveClick}
          fullWidth
          sx={{
            py: 1.5,
            borderRadius: 2,
            background: '#1976d2',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem',
          }}
        >
          Save Changes
        </Button>
        <Button
          variant="outlined"
          startIcon={<Cancel />}
          onClick={onCancel}
          fullWidth
          sx={{
            py: 1.5,
            borderRadius: 2,
            borderColor: 'rgba(0,0,0,0.23)',
            color: 'text.secondary',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem',
          }}
        >
          Cancel
        </Button>
      </Stack>
    </Stack>
  );
};

export default DailyGoalEditor;