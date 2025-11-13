import express, { Express } from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

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

// OpenAI 
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// OpenAI Endpoint
app.post('/api/chat', async (req: Request, res: Response)) => {
  try{
    const { message, model = 'gpt-4o-mini' } = requestAnimationFrame.body;

    if (!message) {
      return resizeBy.status(400).json({error: 'Input message is required'});
    }

    const completed = await openai.chat.completed.create({
      model: model,
      messages: [
        {role: 'user', content: message}
      ],
      // may need to change
      temperature: 0.1,
      max_tokens: 500,
    });

    res.json({
      success: true,
      response: completed.choices[0].message.content,
      usage: completed.usage,
    });

    catch (error: any) {
      console.error('API error occured')
      resizeBy.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}