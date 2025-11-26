import express, { Express, Request, Response } from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import mongoose from 'mongoose';
import { initializeFirebase } from './src/config/firebase';
import { StudyNote } from './src/models/StudyNote';
import { verifyToken } from './src/middleware/auth';

dotenv.config();

initializeFirebase();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || '')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

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
app.post('/api/notes/generate', verifyToken, async (req: Request, res: Response) => {
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
2. Provide a concise summary (2-3 sentences) of the main topics covered

Study Notes:
${notes}

Please respond in the following JSON format:
{
  "summary": "Your 2-3 sentence summary here",
  "questions": [
    "Question 1",
    "Question 2",
    ...
  ]
}

Make sure the questions are:
- Clear and specific
- Test understanding, not just memorization
- Cover different aspects of the material
- Progressively challenging from basic to advanced concepts

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

    // Create questions array with IDs and completed status
    const questionsArray = parsedResponse.questions.map((q: string, index: number) => ({
      id: `${Date.now()}-${index}`,
      question: q,
      completed: false
    }));

    // Save to database
    const studyNote = new StudyNote({
      userId,
      title,
      notes,
      summary: parsedResponse.summary,
      questions: questionsArray,
      dateAdded: new Date()
    });

    await studyNote.save();

    res.json({
      success: true,
      note: {
        id: studyNote._id,
        title: studyNote.title,
        dateAdded: studyNote.dateAdded,
        notes: studyNote.notes,
        summary: studyNote.summary,
        questions: studyNote.questions
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
app.get('/api/notes', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.uid;

    const notes = await StudyNote.find({ userId })
      .sort({ dateAdded: -1 })
      .select('_id title dateAdded notes summary questions');

    const formattedNotes = notes.map(note => ({
      id: note._id,
      title: note.title,
      dateAdded: note.dateAdded.toISOString().split('T')[0],
      notes: note.notes,
      summary: note.summary,
      questions: note.questions
    }));

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
app.patch('/api/notes/:noteId/questions/:questionId', verifyToken, async (req: Request, res: Response) => {
  try {
    const { noteId, questionId } = req.params;
    const { completed } = req.body;
    const userId = (req as any).user.uid;

    const note = await StudyNote.findOne({ _id: noteId, userId });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const question = note.questions.find(q => q.id === questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    question.completed = completed;
    await note.save();

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
app.delete('/api/notes/:noteId', verifyToken, async (req: Request, res: Response) => {
  try {
    const { noteId } = req.params;
    const userId = (req as any).user.uid;

    const result = await StudyNote.deleteOne({ _id: noteId, userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

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