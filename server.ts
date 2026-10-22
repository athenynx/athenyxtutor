import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini Client server-side
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Child-safe safety filter
const FORBIDDEN_WORDS = [
  'kill', 'murder', 'gun', 'weapon', 'knife', 'stab', 'bomb', 'suicide', 'die', 'dead',
  'blood', 'gore', 'sex', 'sexual', 'porn', 'nude', 'naked', 'erotic', 'hate',
  'racist', 'terror', 'drugs', 'cocaine', 'marijuana', 'weed', 'vape', 'cigarette',
  'alcohol', 'beer', 'vodka', 'whiskey', 'gambling', 'casino', 'betting', 'curse', 'swear',
  'hack', 'exploit', 'password', 'credit card', 'ssn', 'social security'
];

function isSafeText(text: string): boolean {
  const normalized = text.toLowerCase();
  for (const word of FORBIDDEN_WORDS) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(normalized)) {
      return false;
    }
  }
  return true;
}

// /api/tutor endpoint
app.post('/api/tutor', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, grade = 2, subject = 'general', conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message text is required.' });
      return;
    }

    const validatedGrade = Math.min(5, Math.max(1, Number(grade) || 2));

    // Child-safe validation
    if (!isSafeText(message)) {
      res.json({
        reply: "Let's focus on fun, safe learning topics! Athenyx loves exploring space, science, animals, math mysteries, and great stories. What would you like to discover?",
        suggestedFollowUps: [
          'How do rocket engines work?',
          'Why do animals have tails?',
          'Can we solve a fun math puzzle?'
        ]
      });
      return;
    }

    // System instruction tailored for selected grade level
    const gradeGuidance = {
      1: "The student is 6-7 years old in Grade 1. Use very simple, short sentences (under 10 words). Use playful analogies with toys, animals, fruits. Keep explanations lively, encouraging, and easy to read.",
      2: "The student is 7-8 years old in Grade 2. Use simple vocabulary, step-by-step numbers, clear visual examples, and cheerful curiosity.",
      3: "The student is 8-9 years old in Grade 3. Provide structured 2-3 step explanations, engaging real-world facts, and friendly follow-up questions.",
      4: "The student is 9-10 years old in Grade 4. Introduce proper elementary scientific and mathematical concepts clearly. Break multi-step problems down sequentially.",
      5: "The student is 10-11 years old in Grade 5. Encourage analytical reasoning, hypothesis testing, and conceptual depth while keeping the tone warm and supportive."
    }[validatedGrade as 1 | 2 | 3 | 4 | 5];

    const systemInstruction = `You are Athenyx, an adorable, enthusiastic, knowledgeable AI robot teacher and learning companion for children in Grades 1–5.
Your role is to help children understand school subjects, develop reasoning skills, and love learning.

Target Grade Level: Grade ${validatedGrade}
Subject Area: ${subject}
Grade Context: ${gradeGuidance}

Instructions:
1. Speak in a warm, encouraging, child-friendly tone.
2. Adapt vocabulary and sentence length strictly to Grade ${validatedGrade}.
3. Break concepts down into small, bite-sized steps. Use relatable everyday examples (pizza slices, pets, parks, playgrounds).
4. If the child is asking for homework help, guide them with hints and steps rather than spoon-feeding raw answers immediately.
5. End with ONE short, friendly follow-up question or encouragement to verify their understanding.
6. Never shame, criticize, or pressure the student.
7. Keep responses concise (around 2 to 4 friendly paragraphs max).
8. If asked an inappropriate or dangerous question, gently redirect to an exciting educational topic.
9. Never pretend to be a human, parent, or medical professional. Never ask for the child's last name, address, or personal data.`;

    let replyText = '';

    if (ai) {
      try {
        const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

        if (Array.isArray(conversationHistory)) {
          for (const turn of conversationHistory.slice(-4)) {
            if (turn && turn.text && isSafeText(turn.text)) {
              contents.push({
                role: turn.role === 'model' ? 'model' : 'user',
                parts: [{ text: turn.text }],
              });
            }
          }
        }

        contents.push({
          role: 'user',
          parts: [{ text: message }],
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        replyText = response.text || '';
      } catch (geminiError: any) {
        console.warn('Gemini API call returned error, using smart educational fallback:', geminiError?.message || geminiError);
      }
    }

    if (!replyText) {
      replyText = getSmartEducationalResponse(message, validatedGrade, subject);
    }

    res.json({
      reply: replyText,
      grade: validatedGrade,
      subject,
      suggestedFollowUps: [
        'Can you show me an example?',
        'Explain it even simpler!',
        'Give me a mini quiz question!'
      ]
    });
  } catch (error: any) {
    console.error('Tutor API Error:', error);
    res.json({
      reply: "Hello explorer! I am Athenyx. In learning, every question is a great step forward! What would you like to explore next?",
      grade: 2,
      subject: 'general',
      suggestedFollowUps: ['Tell me a fun science fact', 'Help me with math', 'Give me a riddle']
    });
  }
});

function getSmartEducationalResponse(question: string, grade: number, subject: string): string {
  const q = question.toLowerCase();

  if (q.includes('addition') || q.includes('add') || q.includes('plus')) {
    if (grade === 1) {
      return "Addition means putting numbers together! 🍎 Imagine you have 2 apples and I give you 3 more. Let's count them together: 1, 2, 3, 4, 5. So, 2 + 3 = 5! Can you try adding 1 + 4?";
    } else {
      return "Addition combines groups of items into one larger total! For example, if you have 25 building blocks and find 15 more, you group the tens (20 + 10 = 30) and ones (5 + 5 = 10) to make 40 blocks. Would you like to practice a carrying problem?";
    }
  }

  if (q.includes('multiply') || q.includes('times') || q.includes('multiplication')) {
    return "Multiplication is super-speedy addition of equal groups! 🌟 Think of 3 boxes with 4 cupcakes each: instead of adding 4 + 4 + 4, we multiply 3 × 4 = 12! What times table are you practicing in class?";
  }

  if (q.includes('sky') && q.includes('blue')) {
    return "The sky looks blue because of how sunlight travels through Earth's atmosphere! Sunlight has all colors of the rainbow, but blue light scatters across the sky like bouncing bouncy balls. Have you ever noticed the sky change colors at sunset?";
  }

  if (q.includes('moon') || q.includes('space') || q.includes('planet')) {
    return "The Moon does not actually change shape! As the Moon orbits around Earth, the Sun shines on different parts of it. The lit portions we see from our backyards are called the phases of the Moon. What phase is your favorite?";
  }

  if (q.includes('plant') || q.includes('tree') || q.includes('flower')) {
    return "Plants are like green solar power stations! Their roots drink water from soil, their leaves absorb sunlight, and they create fresh oxygen for us to breathe through photosynthesis. Isn't nature amazing?";
  }

  if (q.includes('noun') || q.includes('verb') || q.includes('adjective')) {
    return "In English, every word has a special job! A NOUN is a person, animal, place, or thing (like 'dolphin' or 'school'). A VERB is an action word (like 'jump' or 'laugh'). And an ADJECTIVE describes things (like 'shiny' or 'fluffy'). Can you spot the noun in 'The dog ran'?";
  }

  return `That is a wonderful Grade ${grade} question! In ${subject}, we learn by exploring step by step. When we look closely at how things work and test our ideas, we discover amazing patterns. Would you like me to give you a fun everyday example or a practice question?`;
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', app: 'Athenyx Tutor', version: '1.0.0' });
});

// Server-side routing for Vite dev vs production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Athenyx Tutor server running at http://localhost:${PORT}`);
  });
}

startServer();
