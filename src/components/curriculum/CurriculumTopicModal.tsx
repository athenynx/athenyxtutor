import React from 'react';
import { SubjectMeta, GradeLevel } from '../../types';
import { X, Play, MessageSquare, ArrowRight } from 'lucide-react';

interface CurriculumTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: SubjectMeta | null;
  grade: GradeLevel;
  onStartChatWithPrompt: (prompt: string) => void;
  onStartPractice: () => void;
}

export const CurriculumTopicModal: React.FC<CurriculumTopicModalProps> = ({
  isOpen,
  onClose,
  subject,
  grade,
  onStartChatWithPrompt,
  onStartPractice,
}) => {
  if (!isOpen || !subject) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 rounded-xl bg-slate-50 border border-slate-100">
              {subject.icon}
            </span>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span>Curriculum Guide</span>
                <span className="text-slate-300">·</span>
                <span>Grade {grade}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">{subject.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Core Learning Focus
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              In {subject.title}, students explore core concepts through step-by-step reasoning, clear everyday analogies, and interactive questions.
            </p>
          </div>

          {/* Topics List */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Curriculum Topics:
            </h4>
            {subject.topics.map((topic, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div>
                  <h5 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {topic.title}
                  </h5>
                  <p className="text-xs text-slate-500 mt-0.5">{topic.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onStartChatWithPrompt(topic.sampleQuestion);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors shrink-0 self-start sm:self-auto"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask Athenyx</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onStartPractice();
            }}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start Practice Set</span>
          </button>
        </div>
      </div>
    </div>
  );
};
