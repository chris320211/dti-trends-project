import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
} from "@mui/material";
import { auth } from "../firebase";
import { UserStats as UserStatsType } from "../types/database";

const API_URL = "http://localhost:1010";

const defaultStats: UserStatsType = {
  questionsAnsweredToday: 0,
  lifetimeQuestionsAnswered: 0,
  uploadsToday: 0,
  lifetimeUploads: 0,
  currentStreak: 0,
  daysGoalsMet: 0,
  dailyQuestionGoal: 5,
  dailyUploadGoal: 2,
  questionsAnsweredTodayDate: null,
  lastGoalMetDate: null,
  uploadsTodayDate: null,
};

const UserStats = () => {
  const [stats, setStats] = useState<UserStatsType>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");

        const user = auth.currentUser;
        if (!user) {
          setError("You must be logged in to view your stats.");
          setLoading(false);
          return;
        }

        const token = await user.getIdToken();
        const response = await fetch(`${API_URL}/api/user/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to load stats.");
        }

        setStats(data.stats);
      } catch (err: any) {
        console.error("Failed to load stats:", err);
        setError(err.message || "Failed to load stats.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    const handler = () => {
      void fetchStats();
    };

    window.addEventListener("userstats:refresh", handler);

    return () => {
      window.removeEventListener("userstats:refresh", handler);
    };
  }, []);

  return (
    <Card sx={{ minWidth: 320 }}>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          User Stats
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <List>
            <ListItem>
              <ListItemText
                primary="# questions answered today"
                secondary={stats.questionsAnsweredToday}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="# lifetime answered questions"
                secondary={stats.lifetimeQuestionsAnswered}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="# uploads today"
                secondary={stats.uploadsToday}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="# lifetime uploads"
                secondary={stats.lifetimeUploads}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="# day streak"
                secondary={stats.currentStreak}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="# days where goals met"
                secondary={stats.daysGoalsMet}
              />
            </ListItem>
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default UserStats;