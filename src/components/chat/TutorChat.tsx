import React, { useState, useRef, useEffect } from 'react';
import { GradeLevel, SubjectId, ChatMessage, RobotState } from '../../types';
import { SUBJECTS } from '../../lib/curriculum';
import { evaluateStudentInput } from '../../lib/safety';
import { playSound } from '../../lib/sound';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Play,
  Square,
  Radio
} from 'lucide-react';

interface TutorChatProps {
  grade: GradeLevel;
  subject: SubjectId;
  onSubjectChange: (subject: SubjectId) => void;
  robotState: RobotState;
  setRobotState: (state: RobotState) => void;
  onVoiceStart: () => void;
  onVoiceStop: () => void;
  isListening: boolean;
  isSpeaking: boolean;
  voiceTranscript: string;
  onSpeakText: (text: string) => void;
  onStopSpeaking: () => void;
  voiceError: string | null;
  onStartListening: () => void;
  onStopListening: () => void;
  soundEnabled: boolean;
  autoSpeakDefault?: boolean;
}

export const TutorChat: React.FC<TutorChatProps> = ({
  grade,
  subject,
  onSubjectChange,
  robotState,
  setRobotState,
  onVoiceStart,
  onVoiceStop,
  isListening,
  isSpeaking,
  voiceTranscript,
  onSpeakText,
  onStopSpeaking,
  voiceError,
  onStartListening,
  onStopListening,
  soundEnabled,
  autoSpeakDefault = true,
}) => {
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(autoSpeakDefault);
  const [activeSpeakingMsgId, setActiveSpeakingMsgId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`athenyx_chat_g${grade}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return [
      {
        id: 'welcome-msg',
        sender: 'robot',
        text: `Hello, Explorer! I'm Athenyx, your AI learning companion. Ask me any question aloud or by typing below. What concept would you like to explore in Grade ${grade}?`,
        timestamp: Date.now(),
        grade,
        suggestedPrompts: [
          'Why is the sky blue?',
          'Teach me a fun multiplication trick',
          'What is a noun in English?',
          'How do plants drink water?'
        ]
      }
    ];
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (voiceTranscript) {
      setInputText(voiceTranscript);
    }
  }, [voiceTranscript]);

  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        localStorage.setItem(`athenyx_chat_g${grade}`, JSON.stringify(messages.slice(-30)));
      } catch {
        // ignore
      }
    }
  }, [messages, grade]);

  // Keep track of speaking state for message cards
  useEffect(() => {
    if (!isSpeaking) {
      setActiveSpeakingMsgId(null);
    }
  }, [isSpeaking]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Play audio for a specific message
  const handlePlayMessageAudio = (msgId: string, text: string) => {
    if (activeSpeakingMsgId === msgId && isSpeaking) {
      onStopSpeaking();
      setActiveSpeakingMsgId(null);
    } else {
      setActiveSpeakingMsgId(msgId);
      onSpeakText(text);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    // Pre-unlock speech synthesis on user interaction event
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }

    const safety = evaluateStudentInput(text);
    if (!safety.isSafe) {
      if (soundEnabled) playSound.encourage();
      setRobotState('encouraging');
      const warningMsg: ChatMessage = {
        id: `warn-${Date.now()}`,
        sender: 'robot',
        text: safety.reason || "Let's explore exciting and safe educational topics together!",
        timestamp: Date.now(),
        grade,
        suggestedPrompts: [
          'How does a caterpillar become a butterfly?',
          'What is gravity in space?',
          'Can we solve a fun math riddle?'
        ]
      };
      setMessages((prev) => [...prev, warningMsg]);
      setInputText('');
      if (autoSpeakEnabled) {
        setActiveSpeakingMsgId(warningMsg.id);
        onSpeakText(warningMsg.text);
      }
      setTimeout(() => setRobotState('idle'), 3000);
      return;
    }

    const childMsg: ChatMessage = {
      id: `child-${Date.now()}`,
      sender: 'child',
      text,
      timestamp: Date.now(),
      grade,
      subject,
    };

    setMessages((prev) => [...prev, childMsg]);
    setInputText('');
    setIsLoading(true);
    setRobotState('thinking');

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          grade,
          subject,
          conversationHistory: messages.slice(-6).map((m) => ({
            role: m.sender === 'child' ? 'user' : 'model',
            text: m.text,
          })),
        }),
      });

      const data = await response.json();
      const replyText = data.reply || "Let me explain this step by step for you.";

      const robotMsg: ChatMessage = {
        id: `robot-${Date.now()}`,
        sender: 'robot',
        text: replyText,
        timestamp: Date.now(),
        grade,
        subject,
        suggestedPrompts: data.suggestedFollowUps || [
          'Can you show me an example?',
          'Explain it even simpler',
          'Test me with a quiz question'
        ],
      };

      setMessages((prev) => [...prev, robotMsg]);
      setRobotState('speaking');
      if (soundEnabled) playSound.robotChirp();

      // Automatically speak the response aloud
      if (autoSpeakEnabled) {
        setActiveSpeakingMsgId(robotMsg.id);
        onSpeakText(replyText);
      }
    } catch (err: any) {
      console.warn('Network issue, using client tutor engine:', err);
      const fallbackReply = generateFallbackReply(text, grade, subject);

      const robotMsg: ChatMessage = {
        id: `robot-fb-${Date.now()}`,
        sender: 'robot',
        text: fallbackReply.text,
        timestamp: Date.now(),
        grade,
        subject,
        suggestedPrompts: fallbackReply.prompts,
      };

      setMessages((prev) => [...prev, robotMsg]);
      setRobotState('speaking');
      if (autoSpeakEnabled) {
        setActiveSpeakingMsgId(robotMsg.id);
        onSpeakText(fallbackReply.text);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Start a fresh conversation with Athenyx?')) {
      const resetMsg: ChatMessage = {
        id: `reset-${Date.now()}`,
        sender: 'robot',
        text: `Fresh workspace ready. What would you like to explore in Grade ${grade}?`,
        timestamp: Date.now(),
        grade,
        suggestedPrompts: [
          'Explain how rainbows form',
          'Solve a math word problem',
          'Tell a story about astronomy'
        ]
      };
      setMessages([resetMsg]);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`athenyx_chat_g${grade}`);
      }
    }
  };

  const currentSubjectMeta = SUBJECTS.find((s) => s.id === subject) || SUBJECTS[0];

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Top Header Bar */}
      <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-700">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <span>Athenyx Tutor</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500 font-normal">Grade {grade}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500 font-normal">{currentSubjectMeta.title}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Spoken voice auto toggle */}
          <button
            type="button"
            onClick={() => {
              const nextState = !autoSpeakEnabled;
              setAutoSpeakEnabled(nextState);
              if (!nextState && isSpeaking) {
                onStopSpeaking();
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              autoSpeakEnabled
                ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
            title="Toggle whether Athenyx reads replies aloud automatically"
          >
            {autoSpeakEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Voice: Active</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span>Voice: Muted</span>
              </>
            )}
          </button>

          {/* Active Speaking Indicator with waveform */}
          {isSpeaking && (
            <button
              onClick={onStopSpeaking}
              type="button"
              className="px-3 py-1 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1.5 animate-pulse"
              title="Stop speaking"
            >
              <span className="flex items-center gap-0.5">
                <span className="w-0.5 h-2.5 bg-rose-500 animate-bounce" />
                <span className="w-0.5 h-3.5 bg-rose-500 animate-bounce [animation-delay:0.1s]" />
                <span className="w-0.5 h-2 bg-rose-500 animate-bounce [animation-delay:0.2s]" />
              </span>
              <span>Stop Audio</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleClearChat}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Start fresh conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Voice Status Alert */}
      {isListening && (
        <div className="bg-sky-50 text-sky-800 border-b border-sky-100 px-6 py-2.5 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-sky-500 rounded-full animate-ping" />
            <span>Athenyx is listening to you... Speak clearly into your microphone.</span>
          </div>
          <button
            onClick={onStopListening}
            className="text-xs bg-white text-sky-700 font-semibold px-2.5 py-1 rounded-md border border-sky-200 hover:bg-sky-50"
          >
            Finished Speaking
          </button>
        </div>
      )}

      {voiceError && (
        <div className="bg-amber-50 text-amber-900 border-b border-amber-200 px-6 py-2 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{voiceError}</span>
          </div>
          <button
            onClick={() => inputRef.current?.focus()}
            className="text-indigo-700 underline font-semibold ml-2"
          >
            Use Keyboard
          </button>
        </div>
      )}

      {/* Subject Filter Bar (Segmented Interactive Controls) */}
      <div className="px-6 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-xs font-medium text-slate-400 shrink-0">Subject:</span>
        <div className="flex items-center gap-1">
          {SUBJECTS.map((s) => {
            const isActive = s.id === subject;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSubjectChange(s.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => {
          const isRobot = message.sender === 'robot';
          const isCurrentlySpeakingThis = activeSpeakingMsgId === message.id && isSpeaking;

          return (
            <div
              key={message.id}
              className={`flex flex-col ${isRobot ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`flex gap-3 max-w-[88%] sm:max-w-[80%] ${
                  isRobot ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                {/* Clean avatar */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-medium select-none ${
                    isRobot ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  {isRobot ? '🤖' : '👤'}
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed transition-all ${
                    isRobot
                      ? `bg-slate-50/90 text-slate-800 border rounded-tl-sm ${
                          isCurrentlySpeakingThis
                            ? 'border-indigo-300 ring-2 ring-indigo-100 shadow-xs'
                            : 'border-slate-200/70'
                        }`
                      : 'bg-slate-900 text-white rounded-tr-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>

                  {/* Audio Controls for Robot Messages */}
                  {isRobot && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        {isCurrentlySpeakingThis ? (
                          <span className="flex items-center gap-1 text-indigo-600 font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
                            <span>Speaking now</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-400">Athenyx Voice</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePlayMessageAudio(message.id, message.text)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          isCurrentlySpeakingThis
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                            : 'bg-white hover:bg-indigo-50 text-indigo-600 border border-slate-200/80 shadow-2xs'
                        }`}
                        title={isCurrentlySpeakingThis ? 'Pause speaking' : 'Have Athenyx read this aloud'}
                      >
                        {isCurrentlySpeakingThis ? (
                          <>
                            <Square className="w-3 h-3 fill-rose-600" />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Read Aloud</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Follow-up Prompts */}
              {isRobot && message.suggestedPrompts && message.suggestedPrompts.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5 ml-10">
                  {message.suggestedPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(prompt)}
                      className="text-xs bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-medium px-3 py-1 rounded-lg border border-slate-200 shadow-2xs transition-colors text-left"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 text-slate-500 text-xs ml-1">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs">
              🤖
            </div>
            <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/60 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-slate-500 font-medium ml-1">Athenyx is preparing an explanation...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sleek Input Dock */}
      <div className="p-4 bg-slate-50/70 border-t border-slate-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Microphone Button */}
          <button
            type="button"
            onClick={isListening ? onStopListening : onStartListening}
            className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center shrink-0 ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-100'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
            }`}
            title={isListening ? 'Stop listening' : 'Talk to Athenyx using your voice'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening
                ? 'Listening to your voice...'
                : `Ask any Grade ${grade} question...`
            }
            className="flex-1 px-4 py-2.5 bg-white rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-sm text-slate-900 placeholder:text-slate-400 shadow-2xs"
            disabled={isLoading}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            title="Send your question"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between mt-2.5 px-1 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-500" />
            <span>Spoken speech synthesis ready</span>
          </span>
          <span>Press Enter to send</span>
        </div>
      </div>
    </div>
  );
};

function generateFallbackReply(
  question: string,
  grade: GradeLevel,
  subject: SubjectId
): { text: string; prompts: string[] } {
  const q = question.toLowerCase();

  if (q.includes('sky') && q.includes('blue')) {
    return {
      text: "Sunlight is composed of every color of the rainbow! Blue light travels in short, smaller waves. When it enters Earth's atmosphere, it bounces off gas molecules in all directions. This scattering fills our sky with blue!",
      prompts: ['Why is the sunset red?', 'What are clouds made of?', 'Tell me a space riddle'],
    };
  }

  if (q.includes('plant') || q.includes('tree')) {
    return {
      text: "Plants are nature's solar power factories! Roots drink water from the soil, leaves absorb sunlight, and they transform carbon dioxide into energy while releasing clean oxygen for us to breathe.",
      prompts: ['Why are leaves green?', 'What is photosynthesis?', 'How do seeds grow?'],
    };
  }

  if (q.includes('math') || q.includes('add') || q.includes('multiply')) {
    return {
      text: "Math becomes easy when we break problems down into small steps. Multiplication is simply repeated addition of equal groups: 4 groups of 3 is 4 × 3 = 12. Which problem shall we solve together?",
      prompts: ['Teach me the 9 times table', 'What is a fraction?', 'Help with a word problem'],
    };
  }

  return {
    text: `That is an excellent question for Grade ${grade}. In ${subject}, we understand concepts by examining step-by-step examples. Would you like me to walk you through a real-world scenario or try a practice challenge?`,
    prompts: [
      'Give me a step-by-step example',
      'Explain it in simple words',
      'Give me a quiz question'
    ],
  };
}
