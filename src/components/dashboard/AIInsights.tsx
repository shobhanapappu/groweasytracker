import React, { useEffect, useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export const AIInsights: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Mock insights - will be replaced with real AI logic later
  const insights = [
    {
      type: 'warning',
      icon: AlertTriangle,
      message: 'You spent 20% more on expenses this month—consider adjusting your budget.',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800',
    },
    {
      type: 'success',
      icon: CheckCircle,
      message: 'Great job! You\'re on track to meet your savings goal by the deadline.',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
    },
    {
      type: 'info',
      icon: TrendingUp,
      message: 'Your investment portfolio has grown 8% this quarter. Consider diversifying.',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
  ];

  const currentInsight = insights[0]; // For now, show the first insight

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-700 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          AI Insights
        </h3>
      </div>

      <div className={`p-4 rounded-lg border ${currentInsight.bgColor} ${currentInsight.borderColor}`}>
        <div className="flex items-start gap-3">
          <currentInsight.icon className={`w-5 h-5 mt-0.5 ${currentInsight.color}`} />
          <p className={`text-sm font-medium ${currentInsight.color}`}>
            {currentInsight.message}
          </p>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        Powered by AI • Updated just now
      </div>
    </div>
  );
};