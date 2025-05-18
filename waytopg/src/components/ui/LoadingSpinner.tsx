import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  text = 'Loading...'
}) => {
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`${sizeClasses[size]} animate-spin`}>
        <div className="h-full w-full rounded-full border-4 border-t-primary-600 border-r-primary-400 border-b-primary-300 border">
        </div>
      </div>
      <p className="mt-4 text-gray-600 font-medium">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
