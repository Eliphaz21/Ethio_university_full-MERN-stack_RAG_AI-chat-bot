import { useState, useEffect, useRef, useCallback } from 'react';
import { Language } from '../i18n/translations';

interface UseVoiceReturn {
  isListening: boolean;
  hasRecognitionSupport: boolean;
  hasSynthesisSupport: boolean;
  speakingIndex: number | null;
  voiceError: string | null;
  startListening: (lang: Language, onResult: (text: string) => void) => void;
  stopListening: () => void;
  speakText: (text: string, lang: Language, index?: number) => void;
  stopSpeaking: () => void;
  clearVoiceError: () => void;
}

export const useVoice = (): UseVoiceReturn => {
  const [isListening, setIsListening] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  // Check feature availability
  const hasRecognitionSupport = typeof window !== 'undefined' && 
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  const hasSynthesisSupport = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Language mapping to BCP 47 tags for speech APIs
  const getLanguageTag = useCallback((lang: Language): string => {
    switch (lang) {
      case 'am': return 'am-ET';
      case 'om': return 'om-ET';
      case 'ti': return 'ti-ET';
      case 'so': return 'so-ET';
      case 'en': default: return 'en-US';
    }
  }, []);

  const clearVoiceError = () => setVoiceError(null);

  // Initialize Speech Recognition
  const startListening = useCallback((lang: Language, onResult: (text: string) => void) => {
    if (!hasRecognitionSupport) {
      setVoiceError('Speech recognition is not supported in your browser.');
      return;
    }

    try {
      // Stop any existing speech synthesis or recognition first
      if (hasSynthesisSupport && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setSpeakingIndex(null);
      }

      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionClass();

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = getLanguageTag(lang);

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          onResult(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setVoiceError('Microphone permission was denied. Please allow microphone access in your browser.');
        } else if (event.error !== 'no-speech') {
          setVoiceError(`Voice recognition notice: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      setVoiceError(err?.message || 'Failed to start speech recognition.');
    }
  }, [hasRecognitionSupport, hasSynthesisSupport, getLanguageTag]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      setIsListening(false);
    }
  }, []);

  // Text-to-Speech (TTS) Synthesis
  const speakText = useCallback((text: string, lang: Language, index: number = 0) => {
    if (!hasSynthesisSupport) {
      setVoiceError('Text-to-Speech is not supported in your browser.');
      return;
    }

    try {
      // Cancel ongoing audio speech
      window.speechSynthesis.cancel();

      // Strip markdown symbols for natural speech playback
      const cleanText = text
        .replace(/[*_#`~\[\]()]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const targetLang = getLanguageTag(lang);
      utterance.lang = targetLang;
      utterance.rate = 0.95; // Slightly clear and natural speed
      utterance.pitch = 1.0;

      // Try finding suitable voice in browser
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(v => v.lang.startsWith(targetLang.split('-')[0])) ||
                            voices.find(v => v.lang.includes('en'));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onstart = () => {
        setSpeakingIndex(index);
      };

      utterance.onend = () => {
        setSpeakingIndex(null);
      };

      utterance.onerror = () => {
        setSpeakingIndex(null);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err: any) {
      setSpeakingIndex(null);
      setVoiceError('Failed to play text-to-speech audio.');
    }
  }, [hasSynthesisSupport, getLanguageTag]);

  const stopSpeaking = useCallback(() => {
    if (hasSynthesisSupport) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
    }
  }, [hasSynthesisSupport]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      if (hasSynthesisSupport) {
        window.speechSynthesis.cancel();
      }
    };
  }, [hasSynthesisSupport]);

  return {
    isListening,
    hasRecognitionSupport,
    hasSynthesisSupport,
    speakingIndex,
    voiceError,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    clearVoiceError
  };
};

export default useVoice;
