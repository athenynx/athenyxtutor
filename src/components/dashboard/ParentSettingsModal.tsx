import React, { useState } from 'react';
import { ParentSettings } from '../../types';
import {
  ShieldCheck,
  Lock,
  Volume2,
  Trash2,
  X,
  CheckCircle2
} from 'lucide-react';

interface ParentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ParentSettings;
  onUpdateSettings: (newSettings: ParentSettings) => void;
  onClearAllData: () => void;
}

export const ParentSettingsModal: React.FC<ParentSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearAllData,
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [parentAnswer, setParentAnswer] = useState('');
  const [gateError, setGateError] = useState(false);

  const [dailyGoal, setDailyGoal] = useState(settings.dailyGoalMinutes);
  const [voiceSpeed, setVoiceSpeed] = useState(settings.voiceSpeed);
  const [voicePitch, setVoicePitch] = useState(settings.voicePitch);
  const [soundEffects, setSoundEffects] = useState(settings.soundEffectsEnabled);
  const [autoSpeak, setAutoSpeak] = useState(settings.autoSpeakResponses);
  const [nickname, setNickname] = useState(settings.studentNickname);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (parentAnswer.trim() === '56') {
      setIsUnlocked(true);
      setGateError(false);
    } else {
      setGateError(true);
    }
  };

  const handleSave = () => {
    onUpdateSettings({
      ...settings,
      dailyGoalMinutes: dailyGoal,
      voiceSpeed,
      voicePitch,
      soundEffectsEnabled: soundEffects,
      autoSpeakResponses: autoSpeak,
      studentNickname: nickname.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-sm text-slate-900">Parent & Guardian Controls</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
          {!isUnlocked ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center mx-auto">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Guardian Check</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  To prevent accidental adjustments by young students, please answer this prompt:
                </p>
              </div>

              <form onSubmit={handleUnlock} className="max-w-xs mx-auto space-y-3">
                <div className="text-sm font-semibold text-slate-800 bg-slate-50 py-2.5 rounded-xl border border-slate-200">
                  Calculate: 7 × 8 = ?
                </div>
                <input
                  type="number"
                  value={parentAnswer}
                  onChange={(e) => setParentAnswer(e.target.value)}
                  placeholder="Enter 56"
                  className="w-full text-center px-4 py-2 border border-slate-200 rounded-xl font-bold focus:border-indigo-600 focus:outline-none"
                  autoFocus
                />
                {gateError && (
                  <p className="text-xs text-rose-600 font-medium">
                    Incorrect. Please calculate 7 multiplied by 8.
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 text-white font-semibold rounded-xl text-xs hover:bg-slate-800 transition-colors"
                >
                  Verify & Unlock
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Privacy statement */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
                <div className="font-semibold text-slate-900">Child Privacy & Family Safety</div>
                <ul className="list-disc list-inside space-y-1 text-slate-600 leading-relaxed text-[11px]">
                  <li>Strict educational AI guardrails filter all queries and responses.</li>
                  <li>No personal identifiers (PII), home addresses, or phone numbers are requested.</li>
                  <li>Microphone audio is processed entirely in-memory and is never stored.</li>
                </ul>
              </div>

              {/* Student Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Student First Name or Nickname (Optional):
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:border-indigo-600 focus:outline-none"
                  maxLength={20}
                />
              </div>

              {/* Daily Target */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-800 mb-1">
                  <span>Daily Learning Target:</span>
                  <span className="text-indigo-600 tabular-nums">{dailyGoal} mins</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Audio adjustments */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Voice & Sound Preferences
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs text-slate-700 mb-1">
                    <span>Reading Pace (Speed):</span>
                    <span className="font-semibold text-indigo-600 tabular-nums">{voiceSpeed.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.75"
                    max="1.25"
                    step="0.05"
                    value={voiceSpeed}
                    onChange={(e) => setVoiceSpeed(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={autoSpeak}
                      onChange={(e) => setAutoSpeak(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Auto-Speak Responses</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={soundEffects}
                      onChange={(e) => setSoundEffects(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Audio Chimes</span>
                  </label>
                </div>
              </div>

              {/* Reset Data */}
              <div className="pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Clear all local browser conversation history and reset score?')) {
                      onClearAllData();
                      onClose();
                    }
                  }}
                  className="w-full py-2 px-3 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset Conversation & Learning History</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {isUnlocked && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved</span>
                </>
              ) : (
                <span>Save Preferences</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
