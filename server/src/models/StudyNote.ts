import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  id: string;
  question: string;
  completed: boolean;
}

export interface IStudyNote extends Document {
  userId: string;
  title: string;
  notes: string;
  summary: string;
  questions: IQuestion[];
  dateAdded: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  id: { type: String, required: true },
  question: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

const StudyNoteSchema = new Schema<IStudyNote>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    notes: { type: String, required: true },
    summary: { type: String, required: true },
    questions: [QuestionSchema],
    dateAdded: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

export const StudyNote = mongoose.model<IStudyNote>('StudyNote', StudyNoteSchema);
