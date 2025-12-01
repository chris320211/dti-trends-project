import { db } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

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

export const createNote = async (userId: string, title: string, notes: string, questions: Question[]) => {
  const notesRef = collection(db, "notes");
  const noteRef = doc(notesRef);
  const noteId = noteRef.id;

  await setDoc(noteRef, {
    userId,
    title,
    notes,
    dateAdded: serverTimestamp(),
  });

  const questionsRef = collection(db, "questions");
  for (const question of questions) {
    const questionRef = doc(questionsRef);
    await setDoc(questionRef, {
      noteId,
      question: question.question,
      completed: question.completed || false,
    });
  }

  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const userData = userSnap.data();
    const noteIds = userData.noteIds || [];
    await updateDoc(userRef, {
      noteIds: [...noteIds, noteId],
    });
  }

  return noteId;
};

export const getUserNotes = async (userId: string): Promise<Note[]> => {
  const notesQuery = query(collection(db, "notes"), where("userId", "==", userId));
  const notesSnapshot = await getDocs(notesQuery);

  const notes: Note[] = [];

  for (const noteDoc of notesSnapshot.docs) {
    const noteData = noteDoc.data();
    const questionsQuery = query(collection(db, "questions"), where("noteId", "==", noteDoc.id));
    const questionsSnapshot = await getDocs(questionsQuery);

    const questions: Question[] = questionsSnapshot.docs.map((qDoc) => ({
      id: qDoc.id,
      question: qDoc.data().question,
      completed: qDoc.data().completed || false,
    }));

    notes.push({
      id: noteDoc.id,
      userId: noteData.userId,
      title: noteData.title,
      notes: noteData.notes,
      dateAdded: noteData.dateAdded?.toDate() || new Date(),
      questions,
    });
  }

  return notes;
};

export const getNoteById = async (noteId: string): Promise<Note | null> => {
  const noteRef = doc(db, "notes", noteId);
  const noteSnap = await getDoc(noteRef);

  if (!noteSnap.exists()) {
    return null;
  }

  const noteData = noteSnap.data();
  const questionsQuery = query(collection(db, "questions"), where("noteId", "==", noteId));
  const questionsSnapshot = await getDocs(questionsQuery);

  const questions: Question[] = questionsSnapshot.docs.map((qDoc) => ({
    id: qDoc.id,
    question: qDoc.data().question,
    completed: qDoc.data().completed || false,
  }));

  return {
    id: noteSnap.id,
    userId: noteData.userId,
    title: noteData.title,
    notes: noteData.notes,
    dateAdded: noteData.dateAdded?.toDate() || new Date(),
    questions,
  };
};

export const updateQuestionCompletion = async (questionId: string, completed: boolean) => {
  const questionRef = doc(db, "questions", questionId);
  await updateDoc(questionRef, {
    completed,
  });
};

export const deleteNote = async (userId: string, noteId: string) => {
  const questionsQuery = query(collection(db, "questions"), where("noteId", "==", noteId));
  const questionsSnapshot = await getDocs(questionsQuery);

  for (const questionDoc of questionsSnapshot.docs) {
    await deleteDoc(doc(db, "questions", questionDoc.id));
  }

  await deleteDoc(doc(db, "notes", noteId));

  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const userData = userSnap.data();
    const noteIds = (userData.noteIds || []).filter((id: string) => id !== noteId);
    await updateDoc(userRef, {
      noteIds,
    });
  }
};

