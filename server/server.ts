import express, { Express, Request, Response } from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import { initializeFirebase, admin } from './src/config/firebase';
import { verifyFirebaseToken } from './src/middleware/auth';

dotenv.config();

initializeFirebase();

const app: Express = express();
const port = 1010;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'DTI Trends Project API is running!' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Anthropic Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Claude API Endpoint
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

// Generate Practice Questions from Study Notes
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

    // Create a comprehensive prompt for Claude to generate questions and summary
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

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    // Create questions array with IDs, answers, and completed status
    const questionsArray = parsedResponse.questions.map((q: any, index: number) => ({
      id: `${Date.now()}-${index}`,
      question: q.question,
      answer: q.answer,
      completed: false
    }));

    // Save to Firestore
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

// Get all study notes for a user
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

// Update question completion status
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

    questions[questionIndex].completed = completed;

    await noteRef.update({
      questions,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

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

// Delete a study note
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