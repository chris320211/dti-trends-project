import express, { Express, Request, Response } from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import { initializeFirebase } from './src/config/firebase';

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