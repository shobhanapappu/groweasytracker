import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useTheme } from '../contexts/ThemeContext';
import { PieChart, TrendingUp, BarChart3, Smile } from 'lucide-react';

export const About: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-dark-950 dark:to-dark-900">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            About GrowEasy Tracker
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Our mission is to make money management simple, visual, and accessible for everyone.
          </p>
        </section>

        {/* Visual Features Section */}
        <section className="py-12 px-8">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-teal-800/30">
              <PieChart className="w-12 h-12 text-primary-500 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Visualize Your Finances</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Interactive charts and graphs help you see where your money goes, so you can make smarter decisions at a glance.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-teal-800/30">
              <TrendingUp className="w-12 h-12 text-primary-500 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Track with Ease</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Add income, expenses, and goals in seconds. Our app is designed for busy people who want results, not spreadsheets.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-teal-800/30">
              <BarChart3 className="w-12 h-12 text-primary-500 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">User-Friendly Design</h2>
              <p className="text-gray-600 dark:text-gray-300">
                No jargon, no clutter. Just a clean, intuitive interface that makes managing your money feel effortless.
              </p>
            </div>
          </div>
        </section>

        {/* Why We Built This Section */}
        <section className="py-16 px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <Smile className="w-12 h-12 text-primary-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why GrowEasy Tracker?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              We believe everyone deserves financial clarity. Whether you're a freelancer, business owner, or just want to save more, GrowEasy Tracker gives you the tools to succeed—without the overwhelm.
            </p>
            <a
              href="/features"
              className="inline-block bg-gradient-to-r from-primary-500 to-teal-500 text-white px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Explore Features
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}; 