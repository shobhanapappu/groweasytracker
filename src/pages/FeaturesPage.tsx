import React from 'react';
import { TrendingUp, PieChart, Target, BarChart3, Shield, Zap, Clock, Users } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useTheme } from '../contexts/ThemeContext';

const mainFeatures = [
  {
    icon: TrendingUp,
    title: 'Smart Financial Insights',
    description: 'Get intelligent analysis of your financial patterns with automated categorization and spending insights.',
    details: [
      'AI-powered expense categorization',
      'Personalized spending recommendations',
      'Real-time financial health score',
      'Customizable budget alerts'
    ]
  },
  {
    icon: PieChart,
    title: 'Investment Tracking',
    description: 'Monitor your portfolio performance and track investment returns across multiple asset classes.',
    details: [
      'Multi-asset portfolio tracking',
      'Performance analytics and reporting',
      'Investment goal setting',
      'Market trend analysis'
    ]
  },
  {
    icon: Target,
    title: 'Savings Goals',
    description: 'Set and achieve financial goals with progress tracking and personalized recommendations.',
    details: [
      'Customizable savings targets',
      'Progress visualization',
      'Automated savings suggestions',
      'Goal achievement rewards'
    ]
  },
  {
    icon: BarChart3,
    title: 'Interactive Charts',
    description: 'Visualize your financial data with beautiful, interactive charts and comprehensive reports.',
    details: [
      'Real-time data visualization',
      'Customizable dashboard views',
      'Exportable reports',
      'Trend analysis tools'
    ]
  }
];

const additionalFeatures = [
  {
    icon: Shield,
    title: 'Bank-Level Security',
    description: 'Your data is protected with enterprise-grade encryption and security measures.'
  },
  {
    icon: Zap,
    title: 'Real-Time Updates',
    description: 'Get instant notifications and updates on your financial activities and goals.'
  },
  {
    icon: Clock,
    title: 'Automated Tracking',
    description: 'Save time with automatic transaction categorization and financial tracking.'
  },
  {
    icon: Users,
    title: 'Multi-User Support',
    description: 'Collaborate with family members or business partners on shared financial goals.'
  }
];

export const FeaturesPage: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-dark-950 dark:to-dark-900">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 px-8 text-center overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>

          <div className="relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Powerful Features for{' '}
              <span className="bg-gradient-to-r from-primary-400 to-teal-400 bg-clip-text text-transparent">
                Financial Success
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Discover how our comprehensive suite of tools can help you take control of your finances and achieve your goals.
            </p>
          </div>
        </section>

        {/* Main Features Section */}
        <section className="py-20 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {mainFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-teal-800/30 rounded-2xl p-8 hover:border-primary-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-primary-500/10"
                >
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-teal-500 rounded-2xl shadow-lg">
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {feature.description}
                      </p>
                      <ul className="space-y-3">
                        {feature.details.map((detail, idx) => (
                          <li key={idx} className="flex items-center text-gray-600 dark:text-gray-300">
                            <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Features Section */}
        <section className="py-20 px-8 bg-gray-50 dark:bg-dark-800/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-16">
              And So Much More...
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {additionalFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="text-center p-6 rounded-xl bg-white dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-teal-800/30 hover:border-primary-500/50 transition-all duration-300"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-500 to-teal-500 rounded-xl mb-4 shadow-lg">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Transform Your Financial Journey?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Join thousands of users who are already taking control of their finances with GrowEasy Tracker.
            </p>
            <button className="bg-gradient-to-r from-primary-500 to-teal-500 text-white px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-200 shadow-lg">
              Get Started Now
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
 