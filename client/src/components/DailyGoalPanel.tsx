import React, { useEffect, useState } from "react";
import { Card, CardContent, CircularProgress, Alert } from "@mui/material";
import DailyGoalDisplay from "./DailyGoalDisplay";
import DailyGoalEditor from "./DailyGoalEditor";
import { auth } from "../firebase";

export type Goals = {
  uploadsPerDay: number;
  questionsPerDay: number;
};

const API_URL = "http://localhost:1010";
const defaultGoals: Goals = {
  uploadsPerDay: 2,
  questionsPerDay: 5,
};

const DailyGoalPanel: React.FC = () => {
  const [goals, setGoals] = useState<Goals>(defaultGoals);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError("");

      const user = auth.currentUser;
      if (!user) {
        setError("You must be logged in to view your goals.");
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch(`${API_URL}/api/user/goals`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load goals.");
      }

      setGoals({
        questionsPerDay: data.goals.dailyQuestionGoal ?? defaultGoals.questionsPerDay,
        uploadsPerDay: data.goals.dailyUploadGoal ?? defaultGoals.uploadsPerDay,
      });
    } catch (err: any) {
      console.error("Failed to load goals:", err);
      setError(err.message || "Failed to load goals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSave = (newGoals: Goals) => {
    const sanitized: Goals = {
      questionsPerDay: newGoals.questionsPerDay < 0 ? 0 : newGoals.questionsPerDay,
      uploadsPerDay: newGoals.uploadsPerDay < 0 ? 0 : newGoals.uploadsPerDay,
    };
    void saveGoals(sanitized);
  };

  const saveGoals = async (draft: Goals) => {
    try {
      setError("");
      setSuccess("");

      const user = auth.currentUser;
      if (!user) {
        setError("You must be logged in to update goals.");
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch(`${API_URL}/api/user/goals`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dailyQuestionGoal: draft.questionsPerDay,
          dailyUploadGoal: draft.uploadsPerDay,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update goals.");
      }

      setGoals({
        questionsPerDay: data.goals.dailyQuestionGoal,
        uploadsPerDay: data.goals.dailyUploadGoal,
      });
      setSuccess("Goals updated!");
      setIsEditing(false);

      // Ask UserStats (and any listeners) to refetch data
      window.dispatchEvent(new Event("userstats:refresh"));
    } catch (err: any) {
      console.error("Failed to save goals:", err);
      setError(err.message || "Failed to update goals.");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <Card>
      <CardContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            {!error && (
              <>
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
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyGoalPanel;