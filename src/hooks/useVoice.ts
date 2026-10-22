import { useState, useEffect, useRef, useCallback } from 'react';

interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export interface UseVoiceOptions {
  onTranscript?: (transcript: string) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  pitch?: number;
  rate?: number;
}

export function useVoice({
  onTranscript,
  onSpeechStart,
  onSpeechEnd,
  pitch = 1.1, // Warm, friendly kid tutor pitch
  rate = 0.95,  // Clear, comfortable pacing for young learners
}: UseVoiceOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const recognitionRef = useRef<any>(null);
  const autoStopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const onTranscriptRef = useRef(onTranscript);
  const onSpeechStartRef = useRef(onSpeechStart);
  const onSpeechEndRef = useRef(onSpeechEnd);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
    onSpeechStartRef.current = onSpeechStart;
    onSpeechEndRef.current = onSpeechEnd;
  }, [onTranscript, onSpeechStart, onSpeechEnd]);

  // Load available voices & check feature support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const win = window as unknown as IWindow;
      const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
      setRecognitionSupported(Boolean(SpeechRec));
      setSpeechSupported(Boolean('speechSynthesis' in window));

      if ('speechSynthesis' in window) {
        const updateVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            setAvailableVoices(voices);
          }
        };

        updateVoices();
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }
  }, []);

  // Voice speech recognition
  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;
    const win = window as unknown as IWindow;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      setVoiceError("Microphone recognition is not supported in this browser. You can type your question!");
      return;
    }

    // Stop speaking if currently talking
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
        setTranscript('');

        // Safety timeout: auto-stop after 14 seconds
        if (autoStopTimeoutRef.current) clearTimeout(autoStopTimeoutRef.current);
        autoStopTimeoutRef.current = setTimeout(() => {
          stopListening();
        }, 14000);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        if (event.results[0] && event.results[0].isFinal) {
          onTranscriptRef.current?.(currentTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setVoiceError('Microphone permission was not allowed. Please enable microphone permissions in your browser.');
        } else if (event.error === 'no-speech') {
          setVoiceError("I didn't hear you clearly. Tap the microphone to try again!");
        } else {
          setVoiceError(`Voice issue: ${event.error}. You can also type!`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (autoStopTimeoutRef.current) clearTimeout(autoStopTimeoutRef.current);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setVoiceError('Could not start microphone. You can type your question easily!');
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (autoStopTimeoutRef.current) clearTimeout(autoStopTimeoutRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  // Text-To-Speech (Child-Friendly Spoken AI Output)
  const speakText = useCallback((text: string, overridePitch?: number, overrideRate?: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser environment.');
      return;
    }

    try {
      // Chrome audio unlock resume
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();

      // Clean text for natural, conversational speech
      const cleanText = text
        .replace(/[*_#`~[\]()]/g, '') // remove markdown symbols
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // remove emojis
        .replace(/([0-9]+)\s*\+\s*([0-9]+)/g, '$1 plus $2')
        .replace(/([0-9]+)\s*×\s*([0-9]+)/g, '$1 times $2')
        .replace(/([0-9]+)\s*-\s*([0-9]+)/g, '$1 minus $2')
        .replace(/([0-9]+)\s*=\s*([0-9]+)/g, '$1 equals $2')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      currentUtteranceRef.current = utterance; // Prevent Chrome garbage collection bug

      utterance.pitch = overridePitch ?? pitch;
      utterance.rate = overrideRate ?? rate;
      utterance.lang = 'en-US';

      // Pick the best natural English voice
      const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
      const friendlyVoice =
        voices.find(v => (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Jenny') || v.name.includes('Karen')) && v.lang.startsWith('en')) ||
        voices.find(v => v.lang === 'en-US') ||
        voices.find(v => v.lang.startsWith('en'));

      if (friendlyVoice) {
        utterance.voice = friendlyVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        onSpeechStartRef.current?.();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        currentUtteranceRef.current = null;
        onSpeechEndRef.current?.();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        setIsSpeaking(false);
        currentUtteranceRef.current = null;
        onSpeechEndRef.current?.();
      };

      // Slight timeout to let cancel finish in Chrome
      setTimeout(() => {
        if (window.speechSynthesis) {
          window.speechSynthesis.speak(utterance);
        }
      }, 50);
    } catch (err) {
      console.warn('Could not speak response:', err);
      setIsSpeaking(false);
    }
  }, [pitch, rate, availableVoices]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
      onSpeechEndRef.current?.();
    }
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    setTranscript,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    recognitionSupported,
    speechSupported,
    voiceError,
    clearVoiceError: () => setVoiceError(null),
    availableVoices,
  };
}
