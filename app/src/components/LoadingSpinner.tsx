import React from 'react';
import '../styles/LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  text = 'Loading...', 
  overlay = false 
}) => {
  const spinnerClass = `loading-spinner loading-spinner--${size}`;
  const containerClass = overlay ? 'loading-container loading-container--overlay' : 'loading-container';

  return (
    <div className={containerClass}>
      <div className={spinnerClass}>
        <div className="loading-spinner__circle"></div>
        <div className="loading-spinner__circle"></div>
        <div className="loading-spinner__circle"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner; 