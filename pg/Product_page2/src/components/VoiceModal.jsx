import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Volume2 } from 'lucide-react';
import { useSpeechRecognition } from '../useSpeechRecognition';
import { useTextToSpeech } from '../useTextToSpeech';

const VoiceModal = ({ isOpen, onClose, onResult, language = 'en' }) => {
  const [transcript, setTranscript] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  
  const {
    isListening,
    startListening,
    stopListening,
    transcript: liveTranscript,
    error
  } = useSpeechRecognition();

  const { speak } = useTextToSpeech();

  // Update transcript when live transcript changes
  useEffect(() => {
    if (liveTranscript) {
      setTranscript(liveTranscript);
    }
  }, [liveTranscript]);

  // Voice guidance when modal opens
  useEffect(() => {
    if (isOpen) {
      const message = language === 'en' 
        ? "Please speak your product description. Click the microphone to start recording."
        : "कृपया अपने उत्पाद का विवरण बताएं। रिकॉर्डिंग शुरू करने के लिए माइक्रोफोन पर क्लिक करें।";
      
      setTimeout(() => speak(message, language), 500);
    }
  }, [isOpen, language, speak]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setIsComplete(false);
    }
  }, [isOpen]);

  const handleStartStop = () => {
    if (isListening) {
      stopListening();
      setIsComplete(true);
    } else {
      startListening(language);
      setIsComplete(false);
    }
  };

  const handleConfirm = () => {
    if (transcript.trim()) {
      onResult(transcript, language);
      onClose();
    }
  };

  const handleClose = () => {
    if (isListening) {
      stopListening();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            {language === 'en' ? 'Voice Input' : 'आवाज़ इनपुट'}
          </h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Language Indicator */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            {language === 'en' ? 'Speaking in: English' : 'बोल रहे हैं: हिंदी'}
          </p>
        </div>

        {/* Microphone Control */}
        <div className="text-center mb-6">
          <button
            onClick={handleStartStop}
            className={`
              w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4
              transition-all transform hover:scale-105 active:scale-95
              ${isListening 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-blue-500 hover:bg-blue-600'
              }
              text-white shadow-lg
            `}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
          
          <p className="text-sm text-gray-600">
            {isListening 
              ? (language === 'en' ? 'Listening... Click to stop' : 'सुन रहा हूं... रोकने के लिए क्लिक करें')
              : (language === 'en' ? 'Click to start recording' : 'रिकॉर्डिंग शुरू करने के लिए क्लिक करें')
            }
          </p>
        </div>

        {/* Visual Feedback */}
        {isListening && (
          <div className="flex justify-center mb-4">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 bg-blue-500 rounded animate-bounce"
                  style={{
                    height: `${Math.random() * 20 + 10}px`,
                    animationDelay: `${i * 0.1}s`
                  }}
                ></div>
              ))}
            </div>
          </div>
        )}

        {/* Transcript Display */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === 'en' ? 'Transcript:' : 'लिखित रूप:'}
          </label>
          <div className="p-4 border border-gray-300 rounded-lg bg-gray-50 min-h-[100px] max-h-[200px] overflow-y-auto">
            {transcript ? (
              <p className="text-gray-800 whitespace-pre-wrap">{transcript}</p>
            ) : (
              <p className="text-gray-400 italic">
                {language === 'en' 
                  ? 'Your speech will appear here...' 
                  : 'आपकी आवाज़ यहां दिखाई देगी...'
                }
              </p>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              {language === 'en' ? 'Error: ' : 'त्रुटि: '}{error}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleClose}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {language === 'en' ? 'Cancel' : 'रद्द करें'}
          </button>
          
          {transcript && (
            <button
              onClick={() => speak(transcript, language)}
              className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <Volume2 className="w-4 h-4" />
              <span>{language === 'en' ? 'Play' : 'सुनें'}</span>
            </button>
          )}
          
          <button
            onClick={handleConfirm}
            disabled={!transcript.trim()}
            className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {language === 'en' ? 'Confirm' : 'पुष्टि करें'}
          </button>
        </div>

        {/* Tips */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            {language === 'en' 
              ? '💡 Tip: Speak clearly and pause between sentences for better accuracy.'
              : '💡 सुझाव: बेहतर सटीकता के लिए स्पष्ट रूप से बोलें और वाक्यों के बीच रुकें।'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceModal;