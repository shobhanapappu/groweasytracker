import React, { useEffect, useState } from 'react';
import { Coins } from 'lucide-react';

interface FinancialHealthProps {
  totalIncome: number;
  totalExpenses: number;
}

export const FinancialHealth: React.FC<FinancialHealthProps> = ({
  totalIncome,
  totalExpenses
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);

  // Calculate financial health score
  const calculateScore = () => {
    if (totalIncome === 0) return 0;
    const ratio = (totalIncome - totalExpenses) / totalIncome;
    return Math.max(0, Math.min(100, Math.round(ratio * 100)));
  };

  const score = calculateScore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
      setShowCoinAnimation(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [score]);

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'from-green-500 to-emerald-500';
    if (score >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 bg-gradient-to-br ${getScoreColor(score)} rounded-lg relative`}>
          <Coins className={`w-5 h-5 text-white transition-transform duration-500 ${
            showCoinAnimation ? 'animate-bounce' : ''
          }`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Financial Health
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {getScoreLabel(score)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Overall Score
          </span>
          <span className={`text-lg font-bold bg-gradient-to-r ${getScoreColor(score)} bg-clip-text text-transparent`}>
            {animatedScore}%
          </span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-lg h-3 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getScoreColor(score)} rounded-lg transition-all duration-1000 ease-out`}
            style={{ width: `${animatedScore}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Income</p>
            <p className="text-sm font-semibold text-green-600 dark:text-green-400">
              ${totalIncome.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Expenses</p>
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              ${totalExpenses.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};