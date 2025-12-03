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
          <Flag sx={{ color: '#667eea', fontSize: 28 }} />
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                  borderColor: 'rgba(102, 126, 234, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(102, 126, 234, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
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
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
                  borderColor: 'rgba(240, 147, 251, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(240, 147, 251, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#f093fb',
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
            '&:hover': {
              borderColor: 'rgba(0,0,0,0.4)',
              backgroundColor: 'rgba(0,0,0,0.04)',
            },
          }}
        >
          Cancel
        </Button>
      </Stack>
    </Stack>
  );
};

export default DailyGoalEditor;