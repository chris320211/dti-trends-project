import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Stack,
  LinearProgress,
  Chip,
} from "@mui/material";
import {
  TrendingUp,
  School,
  CloudUpload,
  LocalFireDepartment,
  EmojiEvents,
} from "@mui/icons-material";
import { auth } from "../firebase";
import { UserStats as UserStatsType } from "../types/database";
import { API_URL } from "../config/api";

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

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  showProgress?: boolean;
  goal?: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, showProgress, goal }) => {
  const progress = goal ? Math.min((value / goal) * 100, 100) : 0;

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 2,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} mb={showProgress ? 2 : 0}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            background: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {label}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {value}
          </Typography>
        </Box>
      </Stack>
      {showProgress && goal && (
        <Box>
          <Stack direction="row" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {value}/{goal}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(0,0,0,0.08)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: color,
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
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
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        background: 'rgba(255,255,255,0.98)',
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Your Statistics
          </Typography>
          {stats.currentStreak > 0 && !loading && !error && (
            <Chip
              icon={<LocalFireDepartment />}
              label={`${stats.currentStreak} day streak!`}
              color="warning"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Stack>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={48} />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Stack spacing={2.5}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
              <StatCard
                icon={<School />}
                label="Questions Today"
                value={stats.questionsAnsweredToday}
                color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                showProgress
                goal={stats.dailyQuestionGoal}
              />
              <StatCard
                icon={<CloudUpload />}
                label="Uploads Today"
                value={stats.uploadsToday}
                color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                showProgress
                goal={stats.dailyUploadGoal}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
              <StatCard
                icon={<TrendingUp />}
                label="Total Questions"
                value={stats.lifetimeQuestionsAnswered}
                color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
              />
              <StatCard
                icon={<CloudUpload />}
                label="Total Uploads"
                value={stats.lifetimeUploads}
                color="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
              <StatCard
                icon={<LocalFireDepartment />}
                label="Current Streak"
                value={stats.currentStreak}
                color="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
              />
              <StatCard
                icon={<EmojiEvents />}
                label="Goals Achieved"
                value={stats.daysGoalsMet}
                color="linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
              />
            </Box>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default UserStats;