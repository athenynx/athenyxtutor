import React from 'react';
import { GradeLevel } from '../../types';

interface GradeSelectorProps {
  selectedGrade: GradeLevel;
  onSelectGrade: (grade: GradeLevel) => void;
  className?: string;
  compact?: boolean;
}

const GRADE_DATA: Record<GradeLevel, { label: string; ageRange: string }> = {
  1: { label: 'Grade 1', ageRange: 'Ages 6–7' },
  2: { label: 'Grade 2', ageRange: 'Ages 7–8' },
  3: { label: 'Grade 3', ageRange: 'Ages 8–9' },
  4: { label: 'Grade 4', ageRange: 'Ages 9–10' },
  5: { label: 'Grade 5', ageRange: 'Ages 10–11' },
};

export const GradeSelector: React.FC<GradeSelectorProps> = ({
  selectedGrade,
  onSelectGrade,
  className = '',
  compact = false,
}) => {
  const grades: GradeLevel[] = [1, 2, 3, 4, 5];

  if (compact) {
    return (
      <div className={`inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 ${className}`}>
        {grades.map((grade) => {
          const isSelected = selectedGrade === grade;
          return (
            <button
              key={grade}
              type="button"
              onClick={() => onSelectGrade(grade)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-200 ${
                isSelected
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              G{grade}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-3 px-1 text-xs text-slate-500">
        <span className="font-semibold text-slate-700 tracking-tight">Active Curriculum Level</span>
        <span className="font-normal text-slate-400">Vocabulary & reasoning automatically calibrated</span>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:gap-3 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/70">
        {grades.map((grade) => {
          const isSelected = selectedGrade === grade;
          const info = GRADE_DATA[grade];

          return (
            <button
              key={grade}
              type="button"
              onClick={() => onSelectGrade(grade)}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-center transition-all duration-200 ${
                isSelected
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className="text-xs sm:text-sm font-bold tracking-tight">
                {info.label}
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 font-medium tabular-nums">
                {info.ageRange}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
