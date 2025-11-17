import React from "react";
import { Card, CardContent, Typography, List, ListItem, ListItemText } from "@mui/material";

const UserStats = () => {
  const stats = {
    questionsToday: "test",
    lifetimeQuestions: "test",
    dayStreak: "test",
    daysGoalsMet: "test",
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          User Stats
        </Typography>

        <List>
          <ListItem>
            <ListItemText
              primary={`# questions answered today`}
              secondary={stats.questionsToday}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={`# lifetime answered questions`}
              secondary={stats.lifetimeQuestions}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={`# day streak`}
              secondary={stats.dayStreak}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={`# days where goals met`}
              secondary={stats.daysGoalsMet}
            />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};

export default UserStats;