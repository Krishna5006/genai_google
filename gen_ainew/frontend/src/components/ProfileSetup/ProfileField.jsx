// src/components/ProfileSetup/ProfileField.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Mic, MicOff, Sparkles } from 'lucide-react';
import { isValidPhone, validateRequired } from '../../utils/validation';
import '../../styles/components/ProfileField.css';

const ProfileField = ({
  label,
  field,
  placeholder,
  type = "input",
  htmlType = "text",
  disableVoice = false,
  profileData,
  handleInputChange,
  voiceEnabled,
  speechSupported,
  isListening,
  isProcessing,
  startListening,
  stopListening,
  detectedLanguage,
  enhancedDescription,
  geminiSuggestions,
  setProfileData
}) => {
  const [isAutoEnhancing, setIsAutoEnhancing] = useState(false);
  const [hasBeenEnhanced, setHasBeenEnhanced] = useState(false);
  const previousIsListening = useRef(isListening);
  const enhancementTimeoutRef = useRef(null);

  // Auto-enhance when user stops speaking (voice input) or stops typing
  useEffect(() => {
    // Check if user just stopped speaking (voice input ended)
    const justStoppedSpeaking = previousIsListening.current && !isListening;
    previousIsListening.current = isListening;

    if (field === 'description' && 
        profileData[field] && 
        profileData[field].length > 10 && 
        !hasBeenEnhanced &&
        !profileData[field].includes('With expertise in cutting-edge technologies')) {
      
      // Clear any existing timeout
      if (enhancementTimeoutRef.current) {
        clearTimeout(enhancementTimeoutRef.current);
      }

      // If user just stopped speaking, enhance immediately
      // Otherwise, wait for them to stop typing
      const delay = justStoppedSpeaking ? 500 : 2000;
      
      enhancementTimeoutRef.current = setTimeout(() => {
        setIsAutoEnhancing(true);
        
        // Mock auto-enhancement - replace with actual API call
        setTimeout(() => {
          const originalText = profileData[field];
          const enhancedText = `${originalText} With expertise in cutting-edge technologies and a passion for innovation, bringing unique value to every project through creative problem-solving and collaborative leadership.`;
          
          // Automatically update the description with enhanced version
          setProfileData(prev => ({ 
            ...prev, 
            [field]: enhancedText 
          }));
          
          setIsAutoEnhancing(false);
          setHasBeenEnhanced(true); // Mark as enhanced to prevent multiple enhancements
        }, 1500); // Simulate API delay
      }, delay);
    }

    return () => {
      if (enhancementTimeoutRef.current) {
        clearTimeout(enhancementTimeoutRef.current);
      }
    };
  }, [profileData[field], field, setProfileData, isListening, hasBeenEnhanced]);

  // Reset enhancement flag when description is cleared or significantly changed
  useEffect(() => {
    if (field === 'description' && (!profileData[field] || profileData[field].length < 10)) {
      setHasBeenEnhanced(false);
    }
  }, [profileData[field], field]);

  // Get validation error for current field
  const getValidationError = () => {
    const value = profileData[field];
    
    // Required field validation
    const requiredFields = ['name', 'phone', 'description'];
    if (requiredFields.includes(field) && !validateRequired(value)) {
      return `${label} is required`;
    }
    
    // Phone specific validation
    if (field === 'phone' && value) {
      if (!isValidPhone(value)) {
        return 'Phone number must be exactly 10 digits';
      }
    }
    
    return null;
  };

  const validationError = getValidationError();
  const hasError = !!validationError;

  return (
    <div className="form-group">
      {/* Only show label for name field */}
      {field === "name" && (
        <label htmlFor={field} className="form-label">
          {label} <span className="required">*</span>
        </label>
      )}

      <div className="input-container">
        {type === "input" ? (
          <input
            id={field}
            type={htmlType}
            inputMode={htmlType === 'tel' ? 'numeric' : undefined}
            pattern={htmlType === 'tel' ? '[0-9+ -]+' : undefined}
            value={profileData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholder}
            className={`form-input ${hasError ? 'error' : ''}`}
          />
        ) : (
          <textarea
            id={field}
            value={profileData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholder}
            className={`form-textarea ${hasError ? 'error' : ''}`}
          />
        )}

        {voiceEnabled && speechSupported && !disableVoice && (
          <button
            onClick={() => isListening ? stopListening() : startListening(field)}
            className={`voice-button ${isListening ? 'listening' : ''}`}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
        )}

        {(isProcessing || isAutoEnhancing) && (
          <div className="ai-indicator">
            <Sparkles size={12} />
            AI
          </div>
        )}
      </div>

      {/* Validation/Error feedback space to prevent layout shift */}
      <div className="field-feedback">
        {hasError && field !== 'name' && field !== 'description' && (
          <div className="error-message">
            {validationError}
          </div>
        )}
      </div>

      {/* Auto-enhancement indicator for description field */}
      {isAutoEnhancing && field === 'description' && (
        <div className="auto-enhancing-indicator">
          <Sparkles size={12} />
          AI is enhancing your description...
        </div>
      )}

      {/* Listening Indicator */}
      {isListening && !disableVoice && (
        <div className="listening-indicator">
          <div className="listening-dot"></div>
          🎤 Listening... Speak clearly into your microphone
        </div>
      )}
    </div>
  );
};

export default ProfileField;