export type GradeLevel = 1 | 2 | 3 | 4 | 5;

export type SubjectId =
  | 'math'
  | 'english'
  | 'science'
  | 'evs'
  | 'reading'
  | 'logic'
  | 'gk'
  | 'homework';

export type RobotState =
  | 'idle'
  | 'blinking'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'happy'
  | 'celebrating'
  | 'encouraging'
  | 'sleeping';

export interface ChatMessage {
  id: string;
  sender: 'child' | 'robot';
  text: string;
  timestamp: number;
  subject?: SubjectId;
  grade?: GradeLevel;
  suggestedPrompts?: string[];
}

export interface QuizQuestion {
  id: string;
  grade: GradeLevel;
  subject: SubjectId;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;
  difficulty?: 'easy' | 'medium' | 'challenge';
}

export interface SubjectMeta {
  id: SubjectId;
  title: string;
  icon: string;
  shortDesc: string;
  badge: string;
  gradient: string;
  topics: {
    title: string;
    description: string;
    sampleQuestion: string;
  }[];
}

export interface StudentProgress {
  starsEarned: number;
  quizzesCompleted: number;
  questionsAnswered: number;
  correctAnswers: number;
  completedLessons: string[];
  masteredTopics: string[];
  needsPractice: string[];
  minutesSpentToday: number;
  dailyGoalMinutes: number;
  lastActiveDate: string;
}

export interface ParentSettings {
  dailyGoalMinutes: number;
  voiceSpeed: number; // 0.8 - 1.2
  voicePitch: number; // 0.9 - 1.4
  soundEffectsEnabled: boolean;
  autoSpeakResponses: boolean;
  strictSafetyFilter: boolean;
  studentNickname: string;
}
