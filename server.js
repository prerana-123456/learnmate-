import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve website files
app.use(express.static('.'));

if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is missing!');
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const MODE_INSTRUCTIONS = {
  tutor:
    'You are LearnMate, a friendly AI tutor. Explain topics step by step using simple language and examples.',

  summarize:
    'You are LearnMate. Summarize the given text into clear bullet points and important definitions.',

  quiz:
    'You are LearnMate Quiz Generator. Create 3 multiple-choice questions with 4 options each. Provide answers and brief explanations at the end.',

  flashcards:
    'You are LearnMate Flashcard Creator. Create 4 to 6 flashcards with Front (question) and Back (answer).'
};

app.post('/api/study', async (req, res) => {
  const { prompt, mode = 'tutor' } = req.body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Please enter a question or topic.'
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction:
          MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.tutor,
        temperature: 0.6
      }
    });

    res.json({
      success: true,
      reply