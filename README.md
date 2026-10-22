# Athenyx Tutor 🤖✨
> **"Learn Anything. One Question at a Time."**

An AI-powered learning companion designed specifically for elementary school children in **Grades 1 through 5**. Built with an expressive animated robot teacher named **Athenyx**, real-time voice conversations, grade-adapted educational explanations, interactive practice quizzes, and strict child safety guardrails.

---

## 🌟 Key Features

### 1. Adorable Animated Robot (Athenyx)
- **Original Character Design**: Rounded white chassis, soft lavender accents, cyan visor, glowing antenna orb, and magnetic levitation thrusters.
- **Dynamic Emotional States**:
  - `idle`: Gently floats up and down with periodic natural eye blinks.
  - `listening`: Eyes and antenna pulse with glowing cyan aura as the child speaks.
  - `thinking`: Concentrating radar / rotating spirals on visor while AI prepares the answer.
  - `speaking`: Animated audio waveform mouth synchronized with spoken speech.
  - `happy`: Arms wave with joyful crescent eyes (`^ ^`) and bright smiles.
  - `celebrating`: Confetti explosion and golden stars on correct answers!
  - `encouraging`: Warm, gentle expressions when a child needs a second try.
  - `sleeping`: Peaceful resting state when inactive.
- **Interactive**: Children can tap Athenyx anytime to receive friendly waves and cheerful robot chirps.

### 2. Child-Safe AI Tutor Chat & Voice Integration
- **Voice-First Learning**: Speak questions aloud using browser speech recognition; Athenyx replies via friendly, unhurried text-to-speech.
- **Grade-Adapted Explanations**: Vocabulary, sentence complexity, and analogies automatically scale between Grade 1 (ages 6–7) and Grade 5 (ages 10–11).
- **Step-by-Step Socratic Guidance**: Helps with homework questions without merely spoon-feeding answers.
- **Instant Audio Controls**: Replay any message aloud, mute playback, or start fresh conversations.

### 3. Starter Curriculum for Grades 1–5
Includes dedicated modules across 8 core elementary subjects:
1. **Mathematics**: Counting, addition, subtraction, multiplication, fractions, decimals, geometry, and PEMDAS.
2. **English & Grammar**: Phonics, nouns, verbs, adjectives, punctuation, and creative story building.
3. **Curious Science**: Plant kingdom, animal habitats, human body marvels, states of matter, and solar system wonders.
4. **Nature & EVS**: Water cycle, seasons, community helpers, recycling, and planet conservation.
5. **Reading & Writing**: Comprehension passages, rhyming poetry, story starters, and book reviews.
6. **Brain Teasers & Logic**: Patterns, deduction, spatial puzzles, and riddles.
7. **World Wonder (GK)**: Continents, oceans, world records, and historic inventions.
8. **Homework Guide**: Safe hints, proofreading checklists, and study habits.

### 4. Interactive Quiz & Practice Mode
- Grade-tailored multiple-choice questions with hints and step-by-step explanations.
- Real-time celebration confetti (`canvas-confetti`) and synthesized Web Audio chimes (no external assets needed).
- "Try Again" mode after incorrect answers so children learn fearlessly from mistakes.
- Star reward system (no high-pressure leaderboards or predatory streaks).

### 5. Learning Progress & Parent Center
- **Student Dashboard**: Tracks daily learning goal (e.g., 15 mins), total stars collected, quizzes completed, and mastered topics.
- **Parental Verification Gate**: Math verification lock prevents accidental changes by young children.
- **Guardian Settings**: Adjust speech pace, voice pitch, daily goals, sound effects, and clear data anytime.
- **COPPA & Family Privacy**: No collection of PII, no audio storage, no ads or tracking.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Audio & Voice**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) + Web Audio API synthesizer.
- **Backend / API**: Express 4 server with Vite dev middleware + Google Gemini 3.8 Flash (`@google/genai`).
- **Serverless Compatibility**: Ready for deployment on Vercel with `/api/tutor.ts`.

---

## 🚀 Running Locally

1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (copy `.env.example` to `.env`):
   ```bash
   GEMINI_API_KEY="your-gemini-api-key"
   ```
   Without this key, the app can answer simple arithmetic and a few curated facts. Other tutor questions require the AI service and will display a setup message instead of an unverified answer.
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deployment on Vercel

The application is pre-configured for one-click deployment on **Vercel**:

1. Push your repository to GitHub / GitLab.
2. Import the project in the [Vercel Dashboard](https://vercel.com).
3. The build settings are auto-detected via `vercel.json`:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In Vercel Project Settings > **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Gemini API Key
   - Apply it to Production (and Preview/Development if needed), then redeploy.
5. Click **Deploy**. Vercel will host the frontend and execute the serverless function in `/api/tutor.ts`.
