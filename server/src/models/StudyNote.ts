import mongoose from 'mongoose';

const { Schema, model } = mongoose;

export interface IQuestion {
  id: string;
  question: string;
  completed: boolean;
}

export interface IStudyNote {
  userId: string;
  title: string;
  notes: string;
  summary: string;
  questions: IQuestion[];
  dateAdded: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const StudyNoteSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    notes: { type: String, required: true },
    summary: { type: String, required: true },
    questions: [{
      id: String,
      question: String,
      completed: { type: Boolean, default: false },
      _id: false
    }],
    dateAdded: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

export const StudyNote = model('StudyNote', StudyNoteSchema);
