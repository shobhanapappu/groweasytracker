import React, { useEffect, useState } from 'react';

interface ProgressBarProps {
  percentage: number;
  label: string;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  percentage, 
  label, 
  animated = true 
}) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedPercentage(percentage);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setAnimatedPercentage(percentage);
    }
  }, [percentage, animated]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
          {animatedPercentage}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-lg h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg transition-all duration-1000 ease-out"
          style={{ width: `${animatedPercentage}%` }}
        />
      </div>
    </div>
  );
};