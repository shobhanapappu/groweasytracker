import React from 'react';
import { TrendingUp, PieChart, Target, BarChart3 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const features = [
  {
    icon: TrendingUp,
    title: 'Smart Financial Insights',
    description: 'Get intelligent analysis of your financial patterns with automated categorization and spending insights.'
  },
  {
    icon: PieChart,
    title: 'Investment Tracking',
    description: 'Monitor your portfolio performance and track investment returns across multiple asset classes.'
  },
  {
    icon: Target,
    title: 'Savings Goals',
    description: 'Set and achieve financial goals with progress tracking and personalized recommendations.'
  },
  {
    icon: BarChart3,
    title: 'Interactive Charts',
    description: 'Visualize your financial data with beautiful, interactive charts and comprehensive reports.'
  }
];

export const Features: React.FC = () => {
  const { theme } = useTheme();

  return (
    <section className="py-20 px-8 bg-gray-50 dark:bg-dark-950">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-16">
          Everything You Need to{' '}
          <span className="bg-gradient-to-r from-primary-400 to-teal-400 bg-clip-text text-transparent">
            Master Your Finances
          </span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-8 rounded-2xl bg-white dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-teal-800/30 hover:border-primary-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-primary-500/10 hover:scale-105"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-teal-500 rounded-2xl mb-6 shadow-lg">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};