import React, { useState, useEffect } from 'react';
import { RobotState } from '../../types';

interface AthenyxRobotProps {
  state?: RobotState;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  onClick?: () => void;
  showStatusBadge?: boolean;
}

export const AthenyxRobot: React.FC<AthenyxRobotProps> = ({
  state = 'idle',
  size = 'md',
  className = '',
  onClick,
  showStatusBadge = false,
}) => {
  const [internalBlink, setInternalBlink] = useState(false);
  const [isWaving, setIsWaving] = useState(false);

  useEffect(() => {
    if (state === 'sleeping' || state === 'thinking') return;

    const blinkInterval = setInterval(() => {
      setInternalBlink(true);
      setTimeout(() => setInternalBlink(false), 150);
    }, 4000 + Math.random() * 2500);

    return () => clearInterval(blinkInterval);
  }, [state]);

  const handleClick = () => {
    setIsWaving(true);
    setTimeout(() => setIsWaving(false), 1200);
    onClick?.();
  };

  const sizeMap = {
    sm: { width: 100, height: 120 },
    md: { width: 150, height: 180 },
    lg: { width: 210, height: 250 },
    hero: { width: 260, height: 300 },
  };

  const currentSize = sizeMap[size];

  const isListening = state === 'listening';
  const isThinking = state === 'thinking';
  const isSpeaking = state === 'speaking';
  const isHappy = state === 'happy' || isWaving;
  const isCelebrating = state === 'celebrating';
  const isEncouraging = state === 'encouraging';
  const isSleeping = state === 'sleeping';
  const shouldBlink = (internalBlink || state === 'blinking') && !isSleeping && !isThinking;

  const eyeGlowColor = isListening
    ? '#38bdf8' // Cyan
    : isThinking
    ? '#fbbf24' // Warm amber
    : isCelebrating
    ? '#f43f5e' // Rose
    : isEncouraging
    ? '#818cf8' // Soft Indigo
    : '#06b6d4'; // Clean cyan

  const statusTextMap: Record<RobotState, string> = {
    idle: 'Online & Ready',
    blinking: 'Observing',
    listening: 'Listening to your voice...',
    thinking: 'Synthesizing explanation...',
    speaking: 'Explaining concept...',
    happy: 'Great answer!',
    celebrating: 'Brilliant work! 🌟',
    encouraging: 'Try again, you can do it!',
    sleeping: 'Resting (Zzz)',
  };

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Robot SVG Container */}
      <div
        onClick={handleClick}
        className={`cursor-pointer transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98] ${
          !isSleeping ? 'animate-float' : ''
        }`}
        style={{ width: currentSize.width, height: currentSize.height }}
        title="Tap Athenyx to wave!"
      >
        <svg
          viewBox="0 0 240 280"
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Premium Ceramic Body Gradient */}
            <linearGradient id="ceramicBody" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>

            {/* Pearlescent Lavender Rim */}
            <linearGradient id="lavenderRim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c4b5fd" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>

            {/* Deep Glass OLED Visor */}
            <linearGradient id="oledVisor" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#090d16" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>

            {/* Soft Ambient Glow Filter */}
            <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Visor Specular Glass Sheen */}
            <linearGradient id="visorGlassSheen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
              <stop offset="35%" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Levitation Pod Ground Reflection */}
          {!isSleeping && (
            <ellipse
              cx="120"
              cy="264"
              rx={isCelebrating ? 48 : 34}
              ry="6"
              fill={isCelebrating ? '#f43f5e' : '#38bdf8'}
              opacity={isCelebrating ? 0.35 : 0.22}
              className="animate-pulse"
            />
          )}

          {/* Magnetic Jet Base Ring */}
          <g transform="translate(120, 244)">
            <ellipse cx="0" cy="4" rx="18" ry="4" fill="#cbd5e1" />
            <path
              d="M -14,0 Q 0,8 14,0"
              stroke="#94a3b8"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Left Magnetic Hand */}
          <g
            className={`transition-all duration-300 origin-bottom-right ${
              isHappy || isCelebrating
                ? 'animate-wiggle'
                : isListening
                ? '-translate-x-1 -translate-y-1'
                : ''
            }`}
          >
            <ellipse
              cx={isHappy || isCelebrating ? 26 : 38}
              cy={isHappy || isCelebrating ? 134 : 162}
              rx="10"
              ry="14"
              fill="url(#ceramicBody)"
              stroke="#e2e8f0"
              strokeWidth="2.5"
            />
            <circle
              cx={isHappy || isCelebrating ? 26 : 38}
              cy={isHappy || isCelebrating ? 134 : 162}
              r="3.5"
              fill="#818cf8"
            />
          </g>

          {/* Right Magnetic Hand (Waving) */}
          <g
            className={`transition-all duration-300 origin-bottom-left ${
              isHappy || isCelebrating || isWaving
                ? 'animate-wiggle'
                : isListening
                ? 'translate-x-1 -translate-y-1'
                : ''
            }`}
          >
            <ellipse
              cx={isHappy || isCelebrating || isWaving ? 214 : 202}
              cy={isHappy || isCelebrating || isWaving ? 128 : 162}
              rx="10"
              ry="14"
              fill="url(#ceramicBody)"
              stroke="#e2e8f0"
              strokeWidth="2.5"
            />
            <circle
              cx={isHappy || isCelebrating || isWaving ? 214 : 202}
              cy={isHappy || isCelebrating || isWaving ? 128 : 162}
              r="3.5"
              fill="#818cf8"
            />
          </g>

          {/* Sleek Antenna */}
          <g transform="translate(120, 36)">
            <rect x="-2.5" y="-18" width="5" height="18" rx="2.5" fill="#cbd5e1" />
            <circle
              cx="0"
              cy="-20"
              r="7.5"
              fill={
                isListening
                  ? '#38bdf8'
                  : isThinking
                  ? '#fbbf24'
                  : isCelebrating
                  ? '#f43f5e'
                  : '#818cf8'
              }
              className={isListening || isThinking || isCelebrating ? 'animate-pulse' : ''}
              filter="url(#softGlow)"
            />
            <circle cx="-2" cy="-22" r="2.5" fill="#ffffff" opacity="0.85" />
          </g>

          {/* Minimalist Side Ear Audio Sensors */}
          <rect x="34" y="90" width="8" height="26" rx="4" fill="#94a3b8" />
          <rect x="198" y="90" width="8" height="26" rx="4" fill="#94a3b8" />

          {/* Unibody Ceramic Chassis */}
          <rect
            x="42"
            y="44"
            width="156"
            height="182"
            rx="64"
            fill="url(#ceramicBody)"
            stroke="#e2e8f0"
            strokeWidth="2"
          />

          {/* Subtle Ambient Chassis Seam */}
          <path
            d="M 54,182 Q 120,198 186,182"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Chest Optical Emblem Core */}
          <g transform="translate(120, 202)">
            <circle cx="0" cy="0" r="11" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
            {isCelebrating ? (
              <polygon
                points="0,-6 2,-2 6.5,-2 3,1 4.5,5.5 0,3 -4.5,5.5 -3,1 -6.5,-2 -2,-2"
                fill="#fbbf24"
              />
            ) : isEncouraging ? (
              <circle cx="0" cy="0" r="4.5" fill="#818cf8" />
            ) : (
              <circle cx="0" cy="0" r="4.5" fill="#38bdf8" className="animate-pulse" />
            )}
          </g>

          {/* OLED Digital Face Visor */}
          <rect
            x="56"
            y="64"
            width="128"
            height="94"
            rx="32"
            fill="url(#oledVisor)"
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* Visor Specular Glass Diagonal Sheen */}
          <path
            d="M 58,66 Q 120,62 182,66 L 160,110 Q 120,96 74,124 Z"
            fill="url(#visorGlassSheen)"
            pointerEvents="none"
          />

          {/* ================= EYES ================= */}
          {isSleeping ? (
            <g stroke="#64748b" strokeWidth="3" strokeLinecap="round" fill="none">
              <path d="M 84,106 Q 95,111 106,106" />
              <path d="M 134,106 Q 145,111 156,106" />
            </g>
          ) : isCelebrating || isHappy ? (
            /* Joyful crescents (^ ^) */
            <g stroke={eyeGlowColor} strokeWidth="4.5" strokeLinecap="round" fill="none">
              <path d="M 82,107 Q 95,95 108,107" />
              <path d="M 132,107 Q 145,95 158,107" />
            </g>
          ) : isThinking ? (
            /* Concentrating radar rings */
            <g transform="translate(120, 104)">
              <circle cx="-25" cy="0" r="13" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="5 3" className="animate-spin" />
              <circle cx="-25" cy="0" r="5" fill="#fbbf24" />
              <circle cx="25" cy="0" r="13" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="5 3" className="animate-spin" />
              <circle cx="25" cy="0" r="5" fill="#fbbf24" />
            </g>
          ) : shouldBlink ? (
            /* Natural blinking slit */
            <g stroke={eyeGlowColor} strokeWidth="3.5" strokeLinecap="round">
              <line x1="84" y1="104" x2="106" y2="104" />
              <line x1="134" y1="104" x2="156" y2="104" />
            </g>
          ) : isEncouraging ? (
            /* Gentle warm round eyes */
            <g>
              <ellipse cx="95" cy="103" rx="12" ry="14" fill={eyeGlowColor} />
              <ellipse cx="145" cy="103" rx="12" ry="14" fill={eyeGlowColor} />
              <circle cx="92" cy="99" r="4.5" fill="#ffffff" />
              <circle cx="142" cy="99" r="4.5" fill="#ffffff" />
              <circle cx="98" cy="107" r="2" fill="#ffffff" />
              <circle cx="148" cy="107" r="2" fill="#ffffff" />
            </g>
          ) : (
            /* Default Large Bright Digital Eyes */
            <g>
              <ellipse
                cx="95"
                cy="102"
                rx={isListening ? 14 : 12.5}
                ry={isListening ? 16 : 14.5}
                fill={eyeGlowColor}
                filter="url(#softGlow)"
              />
              <circle cx="91" cy="98" r="4.5" fill="#ffffff" />
              <circle cx="98" cy="106" r="2" fill="#ffffff" />

              <ellipse
                cx="145"
                cy="102"
                rx={isListening ? 14 : 12.5}
                ry={isListening ? 16 : 14.5}
                fill={eyeGlowColor}
                filter="url(#softGlow)"
              />
              <circle cx="141" cy="98" r="4.5" fill="#ffffff" />
              <circle cx="148" cy="106" r="2" fill="#ffffff" />
            </g>
          )}

          {/* ================= MOUTH ================= */}
          {isSleeping ? (
            <line x1="115" y1="134" x2="125" y2="134" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
          ) : isSpeaking ? (
            /* Audio waveform mouth */
            <g transform="translate(120, 134)" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round">
              <line x1="-12" y1="-2" x2="-12" y2="2" className="animate-pulse" />
              <line x1="-6" y1="-5" x2="-6" y2="5" className="animate-pulse" />
              <line x1="0" y1="-7" x2="0" y2="7" className="animate-pulse" />
              <line x1="6" y1="-5" x2="6" y2="5" className="animate-pulse" />
              <line x1="12" y1="-2" x2="12" y2="2" className="animate-pulse" />
            </g>
          ) : isHappy || isCelebrating ? (
            /* Smile arc */
            <path
              d="M 108,129 Q 120,143 132,129"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          ) : isEncouraging ? (
            <path
              d="M 110,130 Q 120,138 130,130"
              fill="none"
              stroke="#818cf8"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M 112,130 Q 120,137 128,130"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}

          {/* Sleeping Floating "Zzz" */}
          {isSleeping && (
            <g fill="#94a3b8" className="font-semibold text-xs select-none">
              <text x="178" y="70" className="animate-pulse" fontSize="14">Z</text>
              <text x="190" y="56" className="animate-pulse" fontSize="10">z</text>
            </g>
          )}
        </svg>

        {/* Soft ground levitation shadow */}
        <div className="w-20 h-2.5 bg-slate-400/20 rounded-full mx-auto mt-1 blur-xs transition-all duration-300" />
      </div>

      {/* Clean Typographic State Indicator */}
      {showStatusBadge && (
        <div className="mt-3 text-xs text-slate-500 font-medium tracking-tight flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          <span>{statusTextMap[state]}</span>
        </div>
      )}
    </div>
  );
};
