import { GoogleGenAI } from '@google/genai';
import { getTutorFallback } from '../src/lib/tutorFallback';

interface ServerlessRequest {
  method?: string;
  body?: any;
}

interface ServerlessResponse {
  status: (statusCode: number) => ServerlessResponse;
  json: (data: any) => void;
}

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

const CONFIGURATION_ERROR =
  'The tutor AI is not configured yet. Ask an adult to add GEMINI_API_KEY in the Vercel project settings.';
const UNAVAILABLE_ERROR =
  'I cannot verify an answer right now because the tutor service is unavailable. Please try again shortly.';

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

export default async function handler(req: ServerlessRequest, res: ServerlessResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, grade = 2, subject = 'general', conversationHistory = [] } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    const validatedGrade = Math.min(5, Math.max(1, Number(grade) || 2));

    if (!isSafeText(message)) {
      return res.json({
        reply: "Let's focus on fun, safe learning topics! Athenyx loves exploring space, science, animals, math mysteries, and great stories. What would you like to discover?",
        suggestedFollowUps: [
          'How do rocket engines work?',
          'Why do animals have tails?',
          'Can we solve a fun math puzzle?'
        ]
      });
    }

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
    const accuracyGuidance = `
10. Prioritize correctness over speed or confidence. Check every calculation before answering.
11. Do not invent facts. If you are unsure or the answer may have changed, say so and suggest checking a reliable source with an adult.`;

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
            systemInstruction: `${systemInstruction}${accuracyGuidance}`,
            temperature: 0.2,
          },
        });

        replyText = response.text || '';
      } catch (geminiError: any) {
        console.error('Gemini API request failed:', geminiError?.message || geminiError);
      }
    }

    if (!replyText) {
      replyText = getTutorFallback(message, validatedGrade, subject) || '';
    }

    if (!replyText) {
      return res.status(503).json({
        error: ai ? UNAVAILABLE_ERROR : CONFIGURATION_ERROR,
      });
    }

    return res.json({
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
    console.error('Vercel Tutor API Error:', error);
    return res.status(500).json({
      error: 'I could not process that question right now. Please try again.',
    });
  }
}
