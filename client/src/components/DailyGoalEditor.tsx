// DailyGoalEditor.tsx
import React, { useState } from "react";
import { Typography, Stack, TextField, Button } from "@mui/material";
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
    <Stack spacing={2}>
      <Typography variant="h4">Daily Goal</Typography>
      <Typography variant="h6">Edit goals</Typography>

      <TextField
        label="Uploads per day"
        type="number"
        value={draft.uploadsPerDay}
        onChange={handleChange("uploadsPerDay")}
        size="small"
      />

      <TextField
        label="Questions per day"
        type="number"
        value={draft.questionsPerDay}
        onChange={handleChange("questionsPerDay")}
        size="small"
      />

      <Stack direction="row" spacing={1}>
        <Button variant="contained" onClick={handleSaveClick}>
          Save
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </Stack>
    </Stack>
  );
};

export default DailyGoalEditor;