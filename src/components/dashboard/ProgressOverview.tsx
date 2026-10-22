import React from 'react';
import { StudentProgress, GradeLevel } from '../../types';
import {
  Star,
  CheckCircle2,
  Target,
  Trophy,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ProgressOverviewProps {
  progress: StudentProgress;
  grade: GradeLevel;
  onSelectTopicToPractice?: (subjectId: string) => void;
}

export const ProgressOverview: React.FC<ProgressOverviewProps> = ({
  progress,
  grade,
  onSelectTopicToPractice,
}) => {
  const goalPercent = Math.min(
    100,
    Math.round((progress.minutesSpentToday / (progress.dailyGoalMinutes || 15)) * 100)
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-8 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Student Dashboard</span>
            <span className="text-slate-300">·</span>
            <span>Grade {grade} Explorer</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Learning Progress & Milestones
          </h2>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-800 self-start sm:self-auto tabular-nums">
          <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span>{progress.starsEarned} Stars Earned</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/60">
          <div className="text-xs font-medium text-slate-500 mb-1">Stars Collected</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
            {progress.starsEarned}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Quiz excellence</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/60">
          <div className="text-xs font-medium text-slate-500 mb-1">Quizzes Completed</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
            {progress.quizzesCompleted}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Full review sets</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/60">
          <div className="text-xs font-medium text-slate-500 mb-1">Questions Solved</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
            {progress.questionsAnswered}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Practiced challenges</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/60">
          <div className="text-xs font-medium text-slate-500 mb-1">Learning Time</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
            {progress.minutesSpentToday}m
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Active today</div>
        </div>
      </div>

      {/* Daily Goal Bar */}
      <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/60">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-800">Daily Study Target</span>
          <span className="text-slate-500 tabular-nums">
            {progress.minutesSpentToday} of {progress.dailyGoalMinutes} mins ({goalPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${goalPercent}%` }}
          />
        </div>
      </div>

      {/* Two-Column Deep Dive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl border border-slate-200/80">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
            Mastered Concepts
          </h3>
          {progress.masteredTopics.length > 0 ? (
            <div className="space-y-2">
              {progress.masteredTopics.map((topic, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{topic}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">Complete quizzes to record topic mastery.</p>
          )}
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
            Recommended Practice Topics
          </h3>
          <div className="space-y-2">
            {[
              { title: 'Multiplication Tables', subj: 'math' },
              { title: 'Plant Kingdom & Photosynthesis', subj: 'science' },
              { title: 'English Adjectives & Sentences', subj: 'english' }
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => onSelectTopicToPractice?.(item.subj)}
                className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-slate-700"
              >
                <span>{item.title}</span>
                <span className="text-indigo-600 font-semibold flex items-center gap-1">
                  Practice <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
