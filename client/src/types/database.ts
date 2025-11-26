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

