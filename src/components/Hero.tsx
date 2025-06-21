import React from 'react';
import { ArrowRight, TrendingUp, DollarSign, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Hero: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <section className="relative bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center py-20 px-8 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Smart Finance
              <span className="block bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Track income, expenses & investments with ease. 
              <span className="text-blue-600 dark:text-blue-400 font-semibold"> Perfect for freelancers & small businesses.</span>
            </p>

            {/* Trust Stats */}
            <div className="flex flex-wrap gap-6 mb-8 justify-center lg:justify-start">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">10K+</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">$2M+</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">99%</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Satisfied</div>
              </div>
            </div>
            
            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
              <button
                onClick={handleGetStarted}
                className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-4 justify-center lg:justify-start text-sm text-gray-500 dark:text-gray-400">
              <span>✓ Free Forever</span>
              <span>✓ No Credit Card</span>
              <span>✓ 2-min Setup</span>
            </div>
          </div>

          {/* Right Side - Dashboard Preview */}
          <div className="relative">
            <div className="relative group">
              {/* Main Dashboard Card */}
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700 transform group-hover:scale-105 group-hover:-rotate-1 transition-all duration-500">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-900 dark:text-white font-semibold">FinanceTracker</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                    <div className="text-green-600 dark:text-green-400 text-sm font-medium">Income</div>
                    <div className="text-gray-900 dark:text-white text-2xl font-bold">$12,450</div>
                    <div className="text-green-600 dark:text-green-400 text-xs">+15% this month</div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <div className="text-blue-600 dark:text-blue-400 text-sm font-medium">Savings</div>
                    <div className="text-gray-900 dark:text-white text-2xl font-bold">$3,280</div>
                    <div className="text-blue-600 dark:text-blue-400 text-xs">Goal: $5,000</div>
                  </div>
                </div>

                {/* Chart Area */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                  <div className="text-gray-900 dark:text-white text-sm font-medium mb-3">Monthly Overview</div>
                  <div className="flex items-end gap-2 h-16">
                    {[40, 65, 45, 80, 60, 90, 75].map((height, i) => (
                      <div
                        key={i}
                        className="bg-gradient-to-t from-blue-600 to-teal-600 rounded-t flex-1 transition-all duration-1000 hover:from-blue-500 hover:to-teal-500"
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-3 shadow-lg transform rotate-12 group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
                <DollarSign className="w-5 h-5 text-white" />
              </div>

              <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-3 shadow-lg transform -rotate-12 group-hover:-rotate-6 group-hover:scale-110 transition-all duration-500">
                <Target className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};