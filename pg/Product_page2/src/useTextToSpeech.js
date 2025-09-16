import { useState, useRef, useCallback, useEffect } from 'react';

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState([]);
  
  const utteranceRef = useRef(null);

  // Check if speech synthesis is supported and load voices
  useEffect(() => {
    const synth = window.speechSynthesis;
    setIsSupported(!!synth);

    if (synth) {
      // Load voices
      const loadVoices = () => {
        const availableVoices = synth.getVoices();
        setVoices(availableVoices);
      };

      // Load voices immediately
      loadVoices();
      
      // Load voices when they change (some browsers load them asynchronously)
      synth.onvoiceschanged = loadVoices;
      
      return () => {
        synth.onvoiceschanged = null;
      };
    }
  }, []);

  const speak = useCallback((text, language = 'en', options = {}) => {
    if (!isSupported || !text.trim()) {
      return;
    }

    const synth = window.speechSynthesis;
    
    // Stop any ongoing speech
    if (synth.speaking) {
      synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    
    // Configure utterance
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    // Find appropriate voice
    const preferredVoice = voices.find(voice => {
      if (language === 'hi') {
        return voice.lang.includes('hi') || voice.name.includes('Hindi');
      } else {
        return voice.lang.includes('en') && (voice.name.includes('US') || voice.name.includes('UK'));
      }
    });

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    try {
      synth.speak(utterance);
    } catch (error) {
      console.error('Failed to start speech synthesis:', error);
      setIsSpeaking(false);
    }
  }, [isSupported, voices]);

  const stop = useCallback(() => {
    if (isSupported && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported && window.speechSynthesis && isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (isSupported && window.speechSynthesis && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isSupported, isPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported,
    voices
  };
};