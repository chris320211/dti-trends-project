import React, { useState } from "react";
import { Card, CardContent } from "@mui/material";
import DailyGoalDisplay from "./DailyGoalDisplay";
import DailyGoalEditor from "./DailyGoalEditor";

export type Goals = {
  uploadsPerDay: number;
  questionsPerDay: number;
};

const DailyGoalPanel: React.FC = () => {
  const [goals, setGoals] = useState<Goals>({
    uploadsPerDay: 2,
    questionsPerDay: 4,
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (newGoals: Goals) => {
    newGoals.questionsPerDay = newGoals.questionsPerDay < 0 ? 0 : newGoals.questionsPerDay;
    newGoals.uploadsPerDay = newGoals.uploadsPerDay < 0 ? 0 : newGoals.uploadsPerDay;
    setGoals(newGoals);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <Card>
      <CardContent>
        {isEditing ? (
          <DailyGoalEditor
            goals={goals}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <DailyGoalDisplay
            goals={goals}
            onEdit={() => setIsEditing(true)}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default DailyGoalPanel;