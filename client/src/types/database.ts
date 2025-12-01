export interface Question {
  id: string;
  question: string;
  completed: boolean;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  notes: string;
  dateAdded: Date;
  questions: Question[];
}

export interface UserStats {
  questionsAnsweredToday: number;
  lifetimeQuestionsAnswered: number;
  uploadsToday: number;
  lifetimeUploads: number;
  currentStreak: number;
  daysGoalsMet: number;
  dailyQuestionGoal: number;
  dailyUploadGoal: number;
  questionsAnsweredTodayDate?: string | null;
  lastGoalMetDate?: string | null;
  uploadsTodayDate?: string | null;
}

