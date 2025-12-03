import express, { Express, Request, Response } from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import multer from 'multer';
import { initializeFirebase, admin } from './src/config/firebase';
import { verifyFirebaseToken } from './src/middleware/auth';
import { PDFParse } from 'pdf-parse';

dotenv.config();

initializeFirebase();

const app: Express = express();
const port = 1010;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

const allowedOrigins = [
  'http://localhost:2020',
  'http://localhost:5173',
  process.env.FRONTEND_URL || 'https://your-vercel-app.vercel.app'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }

    if (allowedOrigins.some(allowedOrigin => origin.startsWith(allowedOrigin as string))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'DTI Trends Project API is running!' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const defaultUserMetrics = {
  questionsAnsweredToday: 0,
  lifetimeQuestionsAnswered: 0,
  uploadsToday: 0,
  lifetimeUploads: 0,
  currentStreak: 0,
  daysGoalsMet: 0,
  dailyQuestionGoal: 5,
  dailyUploadGoal: 2,
  questionsAnsweredTodayDate: null,
  uploadsTodayDate: null,
  lastGoalMetDate: null,
  noteIds: [],
};

const ensureUserDocument = async (
  userRef: FirebaseFirestore.DocumentReference,
  userId: string
) => {
  let userDoc = await userRef.get();
  if (!userDoc.exists) {
    await userRef.set(
      {
        firebaseUid: userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
        loginCount: 1,
        provider: 'email',
        email: '',
        ...defaultUserMetrics,
      },
      { merge: true }
    );
    userDoc = await userRef.get();
  }
  return userDoc;
};

const isSameDayUTC = (a: Date, b: Date) =>
  a.getUTCFullYear() === b.getUTCFullYear() &&
  a.getUTCMonth() === b.getUTCMonth() &&
  a.getUTCDate() === b.getUTCDate();

const isYesterdayUTC = (a: Date, b: Date) => {
  const aDay = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const bDay = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  const diff = bDay - aDay;
  return diff === 24 * 60 * 60 * 1000;
};

const maybeRecordDailyGoalMet = async (
  userRef: FirebaseFirestore.DocumentReference
) => {
  const userDoc = await userRef.get();
  if (!userDoc.exists) {
    return;
  }

  const data = userDoc.data() || {};
  const questionsGoal =
    typeof data.dailyQuestionGoal === 'number'
      ? data.dailyQuestionGoal
      : defaultUserMetrics.dailyQuestionGoal;
  const uploadsGoal =
    typeof data.dailyUploadGoal === 'number'
      ? data.dailyUploadGoal
      : defaultUserMetrics.dailyUploadGoal;

  const hasMetQuestions = (data.questionsAnsweredToday || 0) >= questionsGoal;
  const hasMetUploads = (data.uploadsToday || 0) >= uploadsGoal;

  if (!hasMetQuestions || !hasMetUploads) {
    return;
  }

  const today = new Date();
  const lastGoalDate = data.lastGoalMetDate?.toDate
    ? data.lastGoalMetDate.toDate()
    : null;

  if (lastGoalDate && isSameDayUTC(lastGoalDate, today)) {
    return;
  }

  let newStreak = 1;
  if (lastGoalDate && isYesterdayUTC(lastGoalDate, today)) {
    newStreak = (data.currentStreak || 0) + 1;
  }

  await userRef.set(
    {
      daysGoalsMet: (data.daysGoalsMet || 0) + 1,
      currentStreak: newStreak,
      lastGoalMetDate: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
};

app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, model = 'claude-3-5-haiku-20241022' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Input message is required' });
    }

    const completed = await anthropic.messages.create({
      model: model,
      max_tokens: 500,
      temperature: 0.1,
      messages: [
        {role: 'user', content: message}
      ],
    });

    res.json({
      success: true,
      response: completed.content[0].type === 'text' ? completed.content[0].text : '',
      usage: completed.usage,
    });

  } catch (error: any) {
    console.error('API error occurred:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/notes/generate', verifyFirebaseToken, async (req: Request, res: Response) => {
  try {
    const { title, notes, numQuestions } = req.body;
    const userId = (req as any).user.uid;

    if (!title || !notes || !numQuestions) {
      return res.status(400).json({ error: 'Title, notes, and numQuestions are required' });
    }

    if (numQuestions < 1 || numQuestions > 40) {
      return res.status(400).json({ error: 'Number of questions must be between 1 and 40' });
    }

    const prompt = `You are an expert educational assistant specializing in creating challenging, thought-provoking practice questions.

Given the following study notes, please:
1. Generate exactly ${numQuestions} practice questions that test deep understanding and critical thinking
2. Provide comprehensive, detailed answers for each question
3. Provide a concise summary (2-3 sentences) of the main topics covered

Study Notes:
${notes}

Please respond in the following JSON format:
{
  "summary": "Your 2-3 sentence summary here",
  "questions": [
    {
      "question": "Question 1 here",
      "answer": "Comprehensive answer to question 1"
    },
    {
      "question": "Question 2 here",
      "answer": "Comprehensive answer to question 2"
    }
  ]
}

IMPORTANT - Make the questions MORE COMPLEX and CHALLENGING:
- Focus on application, analysis, synthesis, and evaluation (higher-order thinking)
- Include scenario-based questions that require applying concepts to new situations
- Ask "why" and "how" questions, not just "what" questions
- Create questions that connect multiple concepts together
- Include questions that require critical thinking and problem-solving
- Mix question types: conceptual understanding, practical application, compare/contrast, cause/effect
- Progressively increase difficulty from foundational to advanced concepts
- For technical content, include questions about edge cases, limitations, and trade-offs

Make the answers:
- Thorough and educational (2-4 sentences)
- Include reasoning and explanations, not just facts
- Reference specific concepts from the material
- Help students understand the "why" behind the answer

Respond ONLY with valid JSON, no additional text.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    const questionsArray = parsedResponse.questions.map((q: any, index: number) => ({
      id: `${Date.now()}-${index}`,
      question: q.question,
      answer: q.answer,
      completed: false
    }));

    const db = admin.firestore();
    const noteData = {
      userId,
      title,
      notes,
      summary: parsedResponse.summary,
      questions: questionsArray,
      dateAdded: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('studyNotes').add(noteData);

    const userRef = db.collection('users').doc(userId);
    const userDoc = await ensureUserDocument(userRef, userId);
    const userData = userDoc.data() || {};
    const existingUploadDate = userData.uploadsTodayDate?.toDate
      ? userData.uploadsTodayDate.toDate()
      : null;
    const today = new Date();
    const sameUploadDay =
      existingUploadDate &&
      existingUploadDate.getUTCFullYear() === today.getUTCFullYear() &&
      existingUploadDate.getUTCMonth() === today.getUTCMonth() &&
      existingUploadDate.getUTCDate() === today.getUTCDate();

    const uploadsToday = sameUploadDay ? userData.uploadsToday || 0 : 0;

    await userRef.set(
      {
        uploadsToday: uploadsToday + 1,
        uploadsTodayDate: admin.firestore.FieldValue.serverTimestamp(),
        lifetimeUploads: (userData.lifetimeUploads || 0) + 1,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await maybeRecordDailyGoalMet(userRef);

    res.json({
      success: true,
      note: {
        id: docRef.id,
        title,
        dateAdded: new Date().toISOString().split('T')[0],
        notes,
        summary: parsedResponse.summary,
        questions: questionsArray
      }
    });

  } catch (error: any) {
    console.error('Error generating practice questions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/notes/generate-from-pdf', verifyFirebaseToken, upload.single('pdf'), async (req: Request, res: Response) => {
  try {
    const { title, numQuestions } = req.body;
    const userId = (req as any).user.uid;

    if (!title || !numQuestions) {
      return res.status(400).json({ error: 'Title and numQuestions are required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required' });
    }

    const questionCount = parseInt(numQuestions);
    if (questionCount < 1 || questionCount > 40) {
      return res.status(400).json({ error: 'Number of questions must be between 1 and 40' });
    }

    let pdfText: string;
    try {
      const parser = new PDFParse({ data: req.file.buffer });
      const result = await parser.getText();
      pdfText = result.text;

      if (!pdfText || pdfText.trim().length === 0) {
        return res.status(400).json({ error: 'Could not extract text from PDF. Please ensure the PDF contains readable text.' });
      }
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      return res.status(400).json({ error: 'Failed to parse PDF file. Please ensure it is a valid PDF.' });
    }

    const prompt = `You are an expert educational assistant specializing in creating challenging, thought-provoking practice questions.

Given the following study material extracted from a PDF document, please:
1. Generate exactly ${questionCount} practice questions that test deep understanding and critical thinking
2. Provide comprehensive, detailed answers for each question
3. Provide a concise summary (2-3 sentences) of the main topics covered

Study Material:
${pdfText}

Please respond in the following JSON format:
{
  "summary": "Your 2-3 sentence summary here",
  "questions": [
    {
      "question": "Question 1 here",
      "answer": "Comprehensive answer to question 1"
    },
    {
      "question": "Question 2 here",
      "answer": "Comprehensive answer to question 2"
    }
  ]
}

IMPORTANT - Make the questions MORE COMPLEX and CHALLENGING:
- Focus on application, analysis, synthesis, and evaluation (higher-order thinking)
- Include scenario-based questions that require applying concepts to new situations
- Ask "why" and "how" questions, not just "what" questions
- Create questions that connect multiple concepts together
- Include questions that require critical thinking and problem-solving
- Mix question types: conceptual understanding, practical application, compare/contrast, cause/effect
- Progressively increase difficulty from foundational to advanced concepts
- For technical content, include questions about edge cases, limitations, and trade-offs

Make the answers:
- Thorough and educational (2-4 sentences)
- Include reasoning and explanations, not just facts
- Reference specific concepts from the material
- Help students understand the "why" behind the answer

Respond ONLY with valid JSON, no additional text.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    const questionsArray = parsedResponse.questions.map((q: any, index: number) => ({
      id: `${Date.now()}-${index}`,
      question: q.question,
      answer: q.answer,
      completed: false
    }));

    const db = admin.firestore();
    const noteData = {
      userId,
      title,
      notes: pdfText.substring(0, 5000), // Store first 5000 chars of PDF text
      summary: parsedResponse.summary,
      questions: questionsArray,
      sourceType: 'pdf',
      originalFileName: req.file.originalname,
      dateAdded: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('studyNotes').add(noteData);

    const userRef = db.collection('users').doc(userId);
    const userDoc = await ensureUserDocument(userRef, userId);
    const userData = userDoc.data() || {};
    const existingUploadDate = userData.uploadsTodayDate?.toDate
      ? userData.uploadsTodayDate.toDate()
      : null;
    const today = new Date();
    const sameUploadDay =
      existingUploadDate &&
      existingUploadDate.getUTCFullYear() === today.getUTCFullYear() &&
      existingUploadDate.getUTCMonth() === today.getUTCMonth() &&
      existingUploadDate.getUTCDate() === today.getUTCDate();

    const uploadsToday = sameUploadDay ? userData.uploadsToday || 0 : 0;

    await userRef.set(
      {
        uploadsToday: uploadsToday + 1,
        uploadsTodayDate: admin.firestore.FieldValue.serverTimestamp(),
        lifetimeUploads: (userData.lifetimeUploads || 0) + 1,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await maybeRecordDailyGoalMet(userRef);

    res.json({
      success: true,
      note: {
        id: docRef.id,
        title,
        dateAdded: new Date().toISOString().split('T')[0],
        summary: parsedResponse.summary,
        questions: questionsArray,
        sourceType: 'pdf'
      }
    });

  } catch (error: any) {
    console.error('Error generating questions from PDF:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process PDF and generate questions'
    });
  }
});

app.post('/api/notes/:noteId/regenerate', verifyFirebaseToken, async (req: Request, res: Response) => {
  try {
    const { noteId } = req.params;
    const { numQuestions } = req.body;
    const userId = (req as any).user.uid;
    const db = admin.firestore();

    if (!numQuestions) {
      return res.status(400).json({ error: 'numQuestions is required' });
    }

    if (numQuestions < 1 || numQuestions > 40) {
      return res.status(400).json({ error: 'Number of questions must be between 1 and 40' });
    }

    const noteRef = db.collection('studyNotes').doc(noteId);
    const noteDoc = await noteRef.get();

    if (!noteDoc.exists) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const noteData = noteDoc.data();
    if (!noteData || noteData.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to modify this note' });
    }

    const title = noteData.title;
    const notes = noteData.notes;

    const prompt = `You are an expert educational assistant helping students study effectively.

Given the following study notes, please:
1. Generate exactly ${numQuestions} practice questions that test key concepts from the material
2. Provide a clear, concise answer for each question
3. Provide a concise summary (2-3 sentences) of the main topics covered

Study Notes:
${notes}

Please respond in the following JSON format:
{
  "summary": "Your 2-3 sentence summary here",
  "questions": [
    {
      "question": "Question 1 here",
      "answer": "Clear answer to question 1"
    },
    {
      "question": "Question 2 here",
      "answer": "Clear answer to question 2"
    }
  ]
}

Make sure the questions are:
- Clear and specific
- Test understanding, not just memorization
- Cover different aspects of the material
- Progressively challenging from basic to advanced concepts

Make sure the answers are:
- Accurate and based on the study notes
- Concise but complete (1-3 sentences)
- Educational and help reinforce learning

Respond ONLY with valid JSON, no additional text.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Claude response (regenerate):', responseText);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    const questionsArray = parsedResponse.questions.map((q: any, index: number) => ({
      id: `${Date.now()}-${index}`,
      question: q.question,
      answer: q.answer,
      completed: false
    }));

    await noteRef.set(
      {
        summary: parsedResponse.summary,
        questions: questionsArray,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const userRef = db.collection('users').doc(userId);
    const userDoc = await ensureUserDocument(userRef, userId);
    const userData = userDoc.data() || {};
    const existingUploadDate = userData.uploadsTodayDate?.toDate
      ? userData.uploadsTodayDate.toDate()
      : null;
    const today = new Date();
    const sameUploadDay =
      existingUploadDate &&
      existingUploadDate.getUTCFullYear() === today.getUTCFullYear() &&
      existingUploadDate.getUTCMonth() === today.getUTCMonth() &&
      existingUploadDate.getUTCDate() === today.getUTCDate();

    const uploadsToday = sameUploadDay ? userData.uploadsToday || 0 : 0;

    await userRef.set(
      {
        uploadsToday: uploadsToday + 1,
        uploadsTodayDate: admin.firestore.FieldValue.serverTimestamp(),
        lifetimeUploads: (userData.lifetimeUploads || 0) + 1,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await maybeRecordDailyGoalMet(userRef);

    res.json({
      success: true,
      note: {
        id: noteId,
        title,
        dateAdded: noteData.dateAdded?.toDate
          ? noteData.dateAdded.toDate().toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        notes,
        summary: parsedResponse.summary,
        questions: questionsArray,
      },
    });
  } catch (error: any) {
    console.error('Error regenerating practice questions:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get('/api/notes', verifyFirebaseToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.uid;
    const db = admin.firestore();

    const snapshot = await db.collection('studyNotes')
      .where('userId', '==', userId)
      .get();

    const formattedNotes = snapshot.docs
      .map((doc: any) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          dateAdded: data.dateAdded?.toDate ? data.dateAdded.toDate().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          dateAddedTimestamp: data.dateAdded?.toDate ? data.dateAdded.toDate().getTime() : 0,
          notes: data.notes,
          summary: data.summary,
          questions: data.questions
        };
      })
      .sort((a, b) => b.dateAddedTimestamp - a.dateAddedTimestamp)
      .map(({ dateAddedTimestamp, ...note }) => note);

    res.json({
      success: true,
      notes: formattedNotes
    });

  } catch (error: any) {
    console.error('Error fetching notes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.patch('/api/notes/:noteId/questions/:questionId', verifyFirebaseToken, async (req: Request, res: Response) => {
  try {
    const { noteId, questionId } = req.params;
    const { completed } = req.body;
    const userId = (req as any).user.uid;
    const db = admin.firestore();

    const noteRef = db.collection('studyNotes').doc(noteId);
    const noteDoc = await noteRef.get();

    if (!noteDoc.exists || noteDoc.data()?.userId !== userId) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const noteData = noteDoc.data();
    const questions = noteData?.questions || [];

    const questionIndex = questions.findIndex((q: any) => q.id === questionId);
    if (questionIndex === -1) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const wasCompleted = !!questions[questionIndex].completed;
    questions[questionIndex].completed = completed;

    await noteRef.update({
      questions,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    if (!wasCompleted && completed) {
      const userRef = db.collection('users').doc(userId);
      const userDoc = await ensureUserDocument(userRef, userId);
      const userData = userDoc.data() || {};
      const existingDate = userData.questionsAnsweredTodayDate?.toDate
        ? userData.questionsAnsweredTodayDate.toDate()
        : null;
      const today = new Date();
      const sameDay =
        existingDate &&
        existingDate.getUTCFullYear() === today.getUTCFullYear() &&
        existingDate.getUTCMonth() === today.getUTCMonth() &&
        existingDate.getUTCDate() === today.getUTCDate();

      const questionsToday = sameDay ? userData.questionsAnsweredToday || 0 : 0;

      await userRef.set(
        {
          questionsAnsweredToday: questionsToday + 1,
          questionsAnsweredTodayDate: admin.firestore.FieldValue.serverTimestamp(),
          lifetimeQuestionsAnswered: (userData.lifetimeQuestionsAnswered || 0) + 1,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastQuestionDate: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      await maybeRecordDailyGoalMet(userRef);
    }

    res.json({
      success: true,
      message: 'Question updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating question:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.delete('/api/notes/:noteId', verifyFirebaseToken, async (req: Request, res: Response) => {
  try {
    const { noteId } = req.params;
    const userId = (req as any).user.uid;
    const db = admin.firestore();

    const noteRef = db.collection('studyNotes').doc(noteId);
    const noteDoc = await noteRef.get();

    if (!noteDoc.exists || noteDoc.data()?.userId !== userId) {
      return res.status(404).json({ error: 'Note not found' });
    }

    await noteRef.delete();

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting note:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/user/stats', verifyFirebaseToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.uid;
    const db = admin.firestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    const defaultStats = {
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

    if (!userDoc.exists) {
      await userRef.set(
        {
          firebaseUid: userId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
          loginCount: 1,
          provider: 'email',
          email: '',
          ...defaultStats,
        },
        { merge: true }
      );

      return res.json({
        success: true,
        stats: defaultStats,
      });
    }

    const data = userDoc.data() || {};
    const stats = {
      questionsAnsweredToday:
        typeof data.questionsAnsweredToday === 'number'
          ? data.questionsAnsweredToday
          : defaultStats.questionsAnsweredToday,
      lifetimeQuestionsAnswered:
        typeof data.lifetimeQuestionsAnswered === 'number'
          ? data.lifetimeQuestionsAnswered
          : defaultStats.lifetimeQuestionsAnswered,
      uploadsToday:
        typeof data.uploadsToday === 'number'
          ? data.uploadsToday
          : defaultStats.uploadsToday,
      lifetimeUploads:
        typeof data.lifetimeUploads === 'number'
          ? data.lifetimeUploads
          : defaultStats.lifetimeUploads,
      currentStreak:
        typeof data.currentStreak === 'number'
          ? data.currentStreak
          : typeof data.streak === 'number'
            ? data.streak
            : defaultStats.currentStreak,
      daysGoalsMet:
        typeof data.daysGoalsMet === 'number'
          ? data.daysGoalsMet
          : defaultStats.daysGoalsMet,
      dailyQuestionGoal:
        typeof data.dailyQuestionGoal === 'number'
          ? data.dailyQuestionGoal
          : defaultStats.dailyQuestionGoal,
      dailyUploadGoal:
        typeof data.dailyUploadGoal === 'number'
          ? data.dailyUploadGoal
          : defaultStats.dailyUploadGoal,
      questionsAnsweredTodayDate: data.questionsAnsweredTodayDate?.toDate
        ? data.questionsAnsweredTodayDate.toDate().toISOString()
        : defaultStats.questionsAnsweredTodayDate,
      lastGoalMetDate: data.lastGoalMetDate?.toDate
        ? data.lastGoalMetDate.toDate().toISOString()
        : defaultStats.lastGoalMetDate,
      uploadsTodayDate: data.uploadsTodayDate?.toDate
        ? data.uploadsTodayDate.toDate().toISOString()
        : defaultStats.uploadsTodayDate,
    };

    const missingUpdates: Record<string, any> = {};
    Object.entries(defaultStats).forEach(([key, defaultValue]) => {
      if (data[key] === undefined) {
        missingUpdates[key] = defaultValue;
      }
    });

    if (Object.keys(missingUpdates).length > 0) {
      await userRef.set(missingUpdates, { merge: true });
    }

    res.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

const defaultGoals = {
  dailyQuestionGoal: 5,
  dailyUploadGoal: 2,
};

app.get('/api/user/goals', verifyFirebaseToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.uid;
    const db = admin.firestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set(
        {
          firebaseUid: userId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
          loginCount: 1,
          provider: 'email',
          email: '',
          ...defaultGoals,
        },
        { merge: true }
      );

      return res.json({
        success: true,
        goals: defaultGoals,
      });
    }

    const data = userDoc.data() || {};
    const goals = {
      dailyQuestionGoal:
        typeof data.dailyQuestionGoal === 'number'
          ? data.dailyQuestionGoal
          : defaultGoals.dailyQuestionGoal,
      dailyUploadGoal:
        typeof data.dailyUploadGoal === 'number'
          ? data.dailyUploadGoal
          : defaultGoals.dailyUploadGoal,
    };

    const missingUpdates: Record<string, number> = {};
    if (data.dailyQuestionGoal === undefined) {
      missingUpdates.dailyQuestionGoal = goals.dailyQuestionGoal;
    }
    if (data.dailyUploadGoal === undefined) {
      missingUpdates.dailyUploadGoal = goals.dailyUploadGoal;
    }
    if (Object.keys(missingUpdates).length > 0) {
      await userRef.set(missingUpdates, { merge: true });
    }

    res.json({
      success: true,
      goals,
    });
  } catch (error: any) {
    console.error('Error fetching goals:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.put('/api/user/goals', verifyFirebaseToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.uid;
    const { dailyQuestionGoal, dailyUploadGoal } = req.body;

    const parsedQuestionGoal = Number(dailyQuestionGoal);
    const parsedUploadGoal = Number(dailyUploadGoal);

    if (
      Number.isNaN(parsedQuestionGoal) ||
      Number.isNaN(parsedUploadGoal) ||
      parsedQuestionGoal < 0 ||
      parsedUploadGoal < 0
    ) {
      return res.status(400).json({
        success: false,
        error: 'Goals must be non-negative numbers',
      });
    }

    const db = admin.firestore();
    const userRef = db.collection('users').doc(userId);

    await userRef.set(
      {
        dailyQuestionGoal: parsedQuestionGoal,
        dailyUploadGoal: parsedUploadGoal,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await maybeRecordDailyGoalMet(userRef);

    res.json({
      success: true,
      goals: {
        dailyQuestionGoal: parsedQuestionGoal,
        dailyUploadGoal: parsedUploadGoal,
      },
    });
  } catch (error: any) {
    console.error('Error updating goals:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});