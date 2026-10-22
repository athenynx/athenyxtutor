import React, { useState, useEffect } from 'react';
import {
  GradeLevel,
  SubjectId,
  RobotState,
  StudentProgress,
  ParentSettings,
  SubjectMeta
} from './types';
import { SUBJECTS, GRADE_CURRICULA } from './lib/curriculum';
import { AthenyxRobot } from './components/robot/AthenyxRobot';
import { GradeSelector } from './components/ui/GradeSelector';
import { TutorChat } from './components/chat/TutorChat';
import { InteractiveQuiz } from './components/quiz/InteractiveQuiz';
import { ProgressOverview } from './components/dashboard/ProgressOverview';
import { ParentSettingsModal } from './components/dashboard/ParentSettingsModal';
import { CurriculumTopicModal } from './components/curriculum/CurriculumTopicModal';
import { useVoice } from './hooks/useVoice';
import { playSound } from './lib/sound';
import {
  MessageSquare,
  Trophy,
  BarChart3,
  Home,
  ShieldCheck,
  Volume2,
  VolumeX,
  Mic,
  Star,
  BookOpen,
  ArrowRight,
  Sparkles,
  Bot
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'quiz' | 'progress'>('home');

  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('athenyx_grade');
      if (saved) {
        const num = Number(saved);
        if (num >= 1 && num <= 5) return num as GradeLevel;
      }
    }
    return 2;
  });

  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('science');
  const [robotState, setRobotState] = useState<RobotState>('idle');
  const [isParentModalOpen, setIsParentModalOpen] = useState(false);
  const [selectedTopicSubject, setSelectedTopicSubject] = useState<SubjectMeta | null>(null);

  const [progress, setProgress] = useState<StudentProgress>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('athenyx_progress');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return {
      starsEarned: 14,
      quizzesCompleted: 3,
      questionsAnswered: 9,
      correctAnswers: 8,
      completedLessons: ['Plant Kingdom', '2-Digit Addition'],
      masteredTopics: ['Plant Roots', 'Addition Bonds'],
      needsPractice: ['Multiplication Tables'],
      minutesSpentToday: 8,
      dailyGoalMinutes: 15,
      lastActiveDate: new Date().toISOString().split('T')[0],
    };
  });

  const [parentSettings, setParentSettings] = useState<ParentSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('athenyx_parent_settings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return {
      dailyGoalMinutes: 15,
      voiceSpeed: 0.95,
      voicePitch: 1.1,
      soundEffectsEnabled: true,
      autoSpeakResponses: true,
      strictSafetyFilter: true,
      studentNickname: '',
    };
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('athenyx_grade', String(selectedGrade));
    }
  }, [selectedGrade]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('athenyx_progress', JSON.stringify(progress));
    }
  }, [progress]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('athenyx_parent_settings', JSON.stringify(parentSettings));
    }
  }, [parentSettings]);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => ({
        ...prev,
        minutesSpentToday: prev.minutesSpentToday + 1,
      }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const {
    isListening,
    isSpeaking,
    transcript: voiceTranscript,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    recognitionSupported,
    speechSupported,
    voiceError,
  } = useVoice({
    pitch: parentSettings.voicePitch,
    rate: parentSettings.voiceSpeed,
    onSpeechStart: () => {
      setRobotState('speaking');
    },
    onSpeechEnd: () => {
      setRobotState('idle');
    },
  });

  useEffect(() => {
    if (isListening) {
      setRobotState('listening');
    } else if (!isSpeaking && robotState === 'listening') {
      setRobotState('idle');
    }
  }, [isListening, isSpeaking]);

  const handleEarnStar = () => {
    setProgress((prev) => ({
      ...prev,
      starsEarned: prev.starsEarned + 1,
      questionsAnswered: prev.questionsAnswered + 1,
      correctAnswers: prev.correctAnswers + 1,
    }));
  };

  const handleHeroVoiceClick = () => {
    setActiveTab('chat');
    setTimeout(() => {
      startListening();
    }, 300);
  };

  // Speaks an introductory greeting
  const handleRobotGreetingSpeak = () => {
    const greetings = [
      `Hi there! I am Athenyx, your AI learning buddy! Ask me anything about science, math, or reading, and I'll explain it clearly for you!`,
      `Hello Explorer! Welcome to Grade ${selectedGrade}. What exciting question shall we discover together today?`,
      `Beep boop! Learning is an adventure. Tap the blue microphone to ask me any school question!`
    ];
    const phrase = greetings[Math.floor(Math.random() * greetings.length)];
    speakText(phrase);
    if (parentSettings.soundEffectsEnabled) playSound.robotChirp();
  };

  const handleClearAllData = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.reload();
    }
  };

  const gradeInfo = GRADE_CURRICULA[selectedGrade];
  const greetingName = parentSettings.studentNickname || 'Explorer';

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800">
      {/* Top Bar (Strict 3-Zone Top Bar Contract) */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between gap-8">
          {/* Zone 1: Single element brand wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2.5 hover:opacity-90 transition-opacity"
          >
            <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm shadow-2xs">
              🤖
            </span>
            <span>Athenyx Tutor</span>
          </button>

          {/* Zone 2: 4 single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className={`whitespace-nowrap shrink-0 transition-colors ${
                activeTab === 'home' ? 'text-indigo-600' : 'hover:text-slate-900'
              }`}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
                activeTab === 'chat' ? 'text-indigo-600' : 'hover:text-slate-900'
              }`}
            >
              <span>AI Tutor</span>
              {isSpeaking && (
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              className={`whitespace-nowrap shrink-0 transition-colors ${
                activeTab === 'quiz' ? 'text-indigo-600' : 'hover:text-slate-900'
              }`}
            >
              Practice
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('progress')}
              className={`whitespace-nowrap shrink-0 transition-colors ${
                activeTab === 'progress' ? 'text-indigo-600' : 'hover:text-slate-900'
              }`}
            >
              Progress
            </button>
          </nav>

          {/* Zone 3: 1 clean action cluster */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Stars counter with tabular numerals */}
            <div
              onClick={() => setActiveTab('progress')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-800 cursor-pointer hover:bg-slate-100 transition-colors tabular-nums"
              title="View collected stars"
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>{progress.starsEarned} Stars</span>
            </div>

            {/* Speech Mute/Unmute quick toggle */}
            <button
              type="button"
              onClick={() => {
                if (isSpeaking) {
                  stopSpeaking();
                } else {
                  handleRobotGreetingSpeak();
                }
              }}
              className="p-2 rounded-xl border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              title={isSpeaking ? 'Stop speech' : 'Hear Athenyx speak'}
            >
              {isSpeaking ? (
                <VolumeX className="w-4 h-4 text-rose-600 animate-pulse" />
              ) : (
                <Volume2 className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Parent center */}
            <button
              type="button"
              onClick={() => setIsParentModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Parents</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 flex flex-col">
        {/* TAB 1: HOME DASHBOARD */}
        {activeTab === 'home' && (
          <div className="space-y-10 animate-fade-in">
            {/* Architectural Hero Banner */}
            <div className="relative rounded-3xl bg-white border border-slate-200/80 p-8 sm:p-10 shadow-xs overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* Left Text */}
                <div className="md:col-span-7 space-y-4">
                  <div className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                    <span>Elementary AI Learning Companion</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-indigo-600 font-semibold">Grades 1–5</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    Hi, {greetingName}. What shall we learn today?
                  </h1>

                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
                    Athenyx is your friendly animated robot teacher. Speak with your voice, explore school subjects step-by-step, or practice with interactive quizzes.
                  </p>

                  {/* Actions */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleHeroVoiceClick}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors"
                    >
                      <Mic className="w-4 h-4 text-sky-300" />
                      <span>Talk to Athenyx</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('chat')}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-800 font-semibold text-xs sm:text-sm transition-colors shadow-2xs"
                    >
                      <MessageSquare className="w-4 h-4 text-slate-500" />
                      <span>Ask by Typing</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRobotGreetingSpeak}
                      className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors"
                      title="Hear Athenyx's voice"
                    >
                      <Volume2 className="w-4 h-4 text-indigo-600" />
                      <span>Hear Spoken Voice</span>
                    </button>
                  </div>

                  {/* Daily Target Progress Strip */}
                  <div className="pt-3 flex items-center gap-4 text-xs text-slate-500 border-t border-slate-100">
                    <span className="font-medium text-slate-700">Daily Study Target:</span>
                    <div className="flex-1 max-w-xs bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            (progress.minutesSpentToday / parentSettings.dailyGoalMinutes) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="tabular-nums">
                      {progress.minutesSpentToday} / {parentSettings.dailyGoalMinutes}m
                    </span>
                  </div>
                </div>

                {/* Right Robot Viewport */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-4">
                  <AthenyxRobot
                    state={robotState}
                    size="hero"
                    showStatusBadge
                    onClick={() => {
                      if (parentSettings.soundEffectsEnabled) playSound.robotChirp();
                      handleRobotGreetingSpeak();
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRobotGreetingSpeak}
                    className="mt-3 text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Tap Athenyx to Speak</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Grade Selector Strip */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <GradeSelector
                selectedGrade={selectedGrade}
                onSelectGrade={(g) => setSelectedGrade(g)}
              />
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium text-slate-700">{gradeInfo.tagline}</span>
                <span className="hidden sm:inline text-slate-400">
                  Focus: {gradeInfo.focusAreas.slice(0, 3).join(' · ')}
                </span>
              </div>
            </div>

            {/* Subject Exploration Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Grade {selectedGrade} Subject Adventures
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select any curriculum card to view topics, practice challenges, or ask questions.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  8 Available Subjects
                </span>
              </div>

              {/* Minimalist Subject Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {SUBJECTS.map((subj) => (
                  <div
                    key={subj.id}
                    onClick={() => {
                      setSelectedSubject(subj.id);
                      setSelectedTopicSubject(subj);
                    }}
                    className="group bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl p-2 rounded-xl bg-slate-50 group-hover:bg-slate-100 transition-colors">
                          {subj.icon}
                        </span>
                        <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-600 transition-colors">
                          {subj.badge}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {subj.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {subj.shortDesc}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-indigo-600">
                      <span>Explore Curriculum</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Practice Banner */}
            <div className="bg-slate-900 text-white rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Interactive Assessment
                </div>
                <h3 className="text-xl font-bold text-white">
                  Test Your Knowledge with Athenyx
                </h3>
                <p className="text-xs text-slate-300 max-w-lg">
                  Complete questions curated for Grade {selectedGrade}. Athenyx provides hints and step-by-step explanations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('quiz')}
                className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-xl text-xs transition-colors shrink-0"
              >
                Start Practice Set
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: AI TUTOR CHAT */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[640px]">
            {/* Robot Companion Column */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center justify-between text-center">
              <div className="w-full">
                <div className="flex items-center justify-between mb-4 text-xs font-semibold text-slate-500">
                  <span>AI Tutor Companion</span>
                  <span>Grade {selectedGrade}</span>
                </div>

                <AthenyxRobot
                  state={robotState}
                  size="lg"
                  showStatusBadge
                  onClick={() => {
                    if (parentSettings.soundEffectsEnabled) playSound.robotChirp();
                    handleRobotGreetingSpeak();
                  }}
                />

                {/* Direct voice speak test button */}
                <button
                  type="button"
                  onClick={handleRobotGreetingSpeak}
                  className="mt-3 text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center justify-center gap-1.5 w-full"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Tap to Hear Athenyx Speak</span>
                </button>
              </div>

              {/* Companion Guidelines */}
              <div className="w-full bg-slate-50/80 p-4 rounded-2xl border border-slate-100 text-left space-y-2 mt-4 text-xs">
                <div className="font-semibold text-slate-800">
                  Voice & Interaction Guide:
                </div>
                <ul className="text-slate-600 space-y-1 list-disc list-inside text-[11px] leading-relaxed">
                  <li>Athenyx reads answers aloud automatically.</li>
                  <li>Click "Read Aloud" on any response to replay.</li>
                  <li>Tap the microphone icon to speak questions aloud.</li>
                  <li>Ask for hints or examples whenever you need them.</li>
                </ul>
              </div>

              <div className="w-full mt-4">
                <GradeSelector
                  selectedGrade={selectedGrade}
                  onSelectGrade={(g) => setSelectedGrade(g)}
                  compact
                  className="w-full justify-center"
                />
              </div>
            </div>

            {/* Chat Messages Column */}
            <div className="lg:col-span-8 flex flex-col h-full min-h-[580px]">
              <TutorChat
                grade={selectedGrade}
                subject={selectedSubject}
                onSubjectChange={(s) => setSelectedSubject(s)}
                robotState={robotState}
                setRobotState={setRobotState}
                onVoiceStart={startListening}
                onVoiceStop={stopListening}
                isListening={isListening}
                isSpeaking={isSpeaking}
                voiceTranscript={voiceTranscript}
                onSpeakText={speakText}
                onStopSpeaking={stopSpeaking}
                voiceError={voiceError}
                onStartListening={startListening}
                onStopListening={stopListening}
                soundEnabled={parentSettings.soundEffectsEnabled}
                autoSpeakDefault={parentSettings.autoSpeakResponses}
              />
            </div>
          </div>
        )}

        {/* TAB 3: PRACTICE & PLAY */}
        {activeTab === 'quiz' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[600px]">
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center justify-between text-center order-2 lg:order-1">
              <div className="w-full">
                <div className="text-xs font-semibold text-slate-500 mb-2">
                  Athenyx Quiz Coach
                </div>
                <AthenyxRobot state={robotState} size="md" showStatusBadge />
              </div>

              <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left space-y-1.5 mt-4 text-xs">
                <div className="font-semibold text-slate-900">
                  Concept Mastery Mode
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Every correct response awards a star. If you answer incorrectly, Athenyx explains the concept so you can try again.
                </p>
              </div>

              <div className="w-full mt-4">
                <GradeSelector
                  selectedGrade={selectedGrade}
                  onSelectGrade={(g) => setSelectedGrade(g)}
                  compact
                  className="w-full justify-center"
                />
              </div>
            </div>

            <div className="lg:col-span-8 flex flex-col order-1 lg:order-2">
              <InteractiveQuiz
                grade={selectedGrade}
                subject={selectedSubject}
                onSubjectChange={(s) => setSelectedSubject(s)}
                setRobotState={setRobotState}
                onEarnStar={handleEarnStar}
                soundEnabled={parentSettings.soundEffectsEnabled}
                onAskTutorAboutQuestion={(questionText) => {
                  setActiveTab('chat');
                }}
              />
            </div>
          </div>
        )}

        {/* TAB 4: PROGRESS */}
        {activeTab === 'progress' && (
          <div className="animate-fade-in space-y-6">
            <ProgressOverview
              progress={progress}
              grade={selectedGrade}
              onSelectTopicToPractice={(subj) => {
                setSelectedSubject(subj as SubjectId);
                setActiveTab('quiz');
              }}
            />
          </div>
        )}
      </main>

      {/* Curriculum Modal */}
      <CurriculumTopicModal
        isOpen={Boolean(selectedTopicSubject)}
        onClose={() => setSelectedTopicSubject(null)}
        subject={selectedTopicSubject}
        grade={selectedGrade}
        onStartChatWithPrompt={() => setActiveTab('chat')}
        onStartPractice={() => {
          setSelectedTopicSubject(null);
          setActiveTab('quiz');
        }}
      />

      {/* Parent Center Modal */}
      <ParentSettingsModal
        isOpen={isParentModalOpen}
        onClose={() => setIsParentModalOpen(false)}
        settings={parentSettings}
        onUpdateSettings={(newSettings) => setParentSettings(newSettings)}
        onClearAllData={handleClearAllData}
      />

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 flex items-center justify-around text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center py-1 transition-colors ${
            activeTab === 'home' ? 'text-indigo-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center py-1 transition-colors ${
            activeTab === 'chat' ? 'text-indigo-600 font-bold' : 'text-slate-500'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Tutor</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('quiz')}
          className={`flex flex-col items-center py-1 transition-colors ${
            activeTab === 'quiz' ? 'text-indigo-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Practice</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('progress')}
          className={`flex flex-col items-center py-1 transition-colors ${
            activeTab === 'progress' ? 'text-indigo-600 font-bold' : 'text-slate-500'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Progress</span>
        </button>
      </div>

      {/* Clean Footer */}
      <footer className="mt-auto py-6 border-t border-slate-200/80 bg-white text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Athenyx Tutor · Learn Anything. One Question at a Time.</span>
          <span className="text-slate-400">COPPA compliant · Strict child-safe AI guardrails active</span>
        </div>
      </footer>
    </div>
  );
}
