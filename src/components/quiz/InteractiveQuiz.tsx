import React, { useState, useEffect } from 'react';
import { GradeLevel, SubjectId, QuizQuestion, RobotState } from '../../types';
import { CURATED_QUIZZES, SUBJECTS } from '../../lib/curriculum';
import { playSound } from '../../lib/sound';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Star,
  ChevronRight,
  Lightbulb,
  BookOpen
} from 'lucide-react';

interface InteractiveQuizProps {
  grade: GradeLevel;
  subject: SubjectId;
  onSubjectChange: (s: SubjectId) => void;
  setRobotState: (state: RobotState) => void;
  onEarnStar: () => void;
  soundEnabled: boolean;
  onAskTutorAboutQuestion?: (questionText: string) => void;
}

export const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({
  grade,
  subject,
  onSubjectChange,
  setRobotState,
  onEarnStar,
  soundEnabled,
  onAskTutorAboutQuestion,
}) => {
  const getQuestions = () => {
    let matches = CURATED_QUIZZES.filter(
      (q) => q.grade === grade && q.subject === subject
    );
    if (matches.length === 0) {
      matches = CURATED_QUIZZES.filter((q) => q.grade === grade);
    }
    if (matches.length === 0) {
      matches = CURATED_QUIZZES;
    }
    return matches;
  };

  const [questions, setQuestions] = useState<QuizQuestion[]>(getQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [incorrectList, setIncorrectList] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    const newQuestions = getQuestions();
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowHint(false);
    setScore(0);
    setQuizFinished(false);
    setIncorrectList([]);
  }, [grade, subject]);

  const currentQ = questions[currentIndex] || CURATED_QUIZZES[0];

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 40,
        spread: 55,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#38bdf8', '#f59e0b', '#10b981'],
      });
    } catch {
      // ignore
    }
  };

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    const correct = index === currentQ.correctIndex;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 1);
      setRobotState('celebrating');
      if (soundEnabled) {
        playSound.correct();
        playSound.star();
      }
      onEarnStar();
      triggerConfetti();
      setTimeout(() => setRobotState('happy'), 2000);
    } else {
      setRobotState('encouraging');
      if (soundEnabled) playSound.encourage();
      setIncorrectList((prev) => [...prev, currentQ]);
      setTimeout(() => setRobotState('idle'), 2500);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowHint(false);
      setRobotState('idle');
    } else {
      setQuizFinished(true);
      setRobotState('celebrating');
      triggerConfetti();
    }
  };

  const handleTryAgain = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setShowHint(false);
    setRobotState('idle');
  };

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowHint(false);
    setScore(0);
    setQuizFinished(false);
    setIncorrectList([]);
    setRobotState('idle');
  };

  const currentSubjectMeta = SUBJECTS.find((s) => s.id === subject) || SUBJECTS[0];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-full">
      {/* Top Header Bar */}
      <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-700">
            🎯
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <span>Practice & Play</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500 font-normal">Grade {grade}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500 font-normal">{currentSubjectMeta.title}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 tabular-nums">
          <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span>{score} / {questions.length} Correct</span>
        </div>
      </div>

      {/* Subject Filter Bar */}
      <div className="px-6 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-xs font-medium text-slate-400 shrink-0">Subject:</span>
        <div className="flex items-center gap-1">
          {SUBJECTS.slice(0, 6).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSubjectChange(s.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                s.id === subject
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span>{s.icon}</span>
              <span>{s.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Quiz Content */}
      <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
        {!quizFinished ? (
          <div>
            {/* Stage Progress Bar */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium text-slate-600">{currentQ.topic}</span>
              <span className="tabular-nums">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>

            <div className="w-full bg-slate-100 h-1.5 rounded-full mb-8 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question Text */}
            <div className="mb-8">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {currentQ.question}
              </h3>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrectOption = idx === currentQ.correctIndex;

                let cardStyle = 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50/70';

                if (isAnswered) {
                  if (isCorrectOption) {
                    cardStyle = 'bg-emerald-50/70 text-emerald-900 border-emerald-400 font-semibold';
                  } else if (isSelected && !isCorrect) {
                    cardStyle = 'bg-rose-50/60 text-rose-800 border-rose-300 line-through';
                  } else {
                    cardStyle = 'bg-slate-50 text-slate-400 border-slate-100 opacity-50';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-4 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between ${cardStyle}`}
                  >
                    <span>{option}</span>
                    {isAnswered && isCorrectOption && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Hint Drawer */}
            {!isAnswered && (
              <div className="mb-4">
                {!showHint ? (
                  <button
                    type="button"
                    onClick={() => setShowHint(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>View helpful hint</span>
                  </button>
                ) : (
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Hint: </span>
                      {currentQ.hint}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Explanation on Answer */}
            {isAnswered && (
              <div
                className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed mb-4 ${
                  isCorrect
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="font-semibold mb-1">
                  {isCorrect ? 'Correct! 🌟' : 'Concept Explanation:'}
                </div>
                <p className="text-slate-600">{currentQ.explanation}</p>

                {onAskTutorAboutQuestion && (
                  <button
                    type="button"
                    onClick={() =>
                      onAskTutorAboutQuestion(
                        `Can you explain this question further: "${currentQ.question}"?`
                      )
                    }
                    className="mt-3 inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Discuss this topic with Athenyx in chat →</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Finished State */
          <div className="text-center py-8 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl mb-4">
              🏆
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              Set Completed
            </h3>
            <p className="text-xs text-slate-500 mb-6 tabular-nums">
              You answered <span className="font-bold text-slate-900">{score}</span> of{' '}
              <span className="font-bold text-slate-900">{questions.length}</span> questions correctly.
            </p>

            {incorrectList.length > 0 && (
              <div className="w-full text-left bg-slate-50 p-4 rounded-xl border border-slate-200/70 mb-6 text-xs text-slate-700">
                <span className="font-semibold text-slate-900 block mb-2">Review Topics:</span>
                <ul className="space-y-1 list-disc list-inside text-slate-600">
                  {incorrectList.map((item, i) => (
                    <li key={i}>
                      <span className="font-medium text-slate-800">{item.topic}:</span> {item.explanation}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              onClick={handleRestartQuiz}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Quiz</span>
            </button>
          </div>
        )}

        {/* Action Controls */}
        {!quizFinished && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {isAnswered && !isCorrect ? (
              <button
                type="button"
                onClick={handleTryAgain}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Question Again</span>
              </button>
            ) : (
              <div />
            )}

            {isAnswered && (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>{currentIndex + 1 === questions.length ? 'Complete Quiz' : 'Next Question'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
