// src/components/ProfileSetup/ProgressBar.jsx
import React from 'react';
import '../../styles/components/ProgressBar.css';

const ProgressBar = ({ currentStep, totalSteps }) => {
  // Calculate progress percentage
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="progress-section">
      <div className="progress-header">
        <span className="progress-text">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="progress-text">
          {Math.round(progress)}% Complete
        </span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;