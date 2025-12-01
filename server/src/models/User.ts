import { Timestamp } from 'firebase-admin/firestore';

export interface IUser {
  firebaseUid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  provider: 'email' | 'google' | 'other';
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
  loginCount: number;
  noteIds?: string[];
  questionsAnsweredToday: number;
  lifetimeQuestionsAnswered: number;
  uploadsToday: number;
  lifetimeUploads: number;
  currentStreak: number;
  daysGoalsMet: number;
  dailyQuestionGoal: number;
  dailyUploadGoal: number;
  questionsAnsweredTodayDate?: Timestamp | null;
  lastGoalMetDate?: Timestamp | null;
  uploadsTodayDate?: Timestamp | null;
}
