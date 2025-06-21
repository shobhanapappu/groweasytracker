import React, { useState } from 'react';
import { TrendingUp, Menu, X, Moon, Sun } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg shadow-md">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <Link to="/">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              GrowEasy Tracker
            </span>
          </Link>
        </div>

        {/* Hamburger Menu for Screens < 768px */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-gray-400 hover:bg-dark-800 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Navigation for Screens >= 768px */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/features" className="text-gray-600 dark:text-teal-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200 font-medium">
            Features
          </Link>
          <Link to="/pricing" className="text-gray-600 dark:text-teal-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200 font-medium">
            Pricing
          </Link>
          <Link to="/about" className="text-gray-600 dark:text-teal-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200 font-medium">
            About
          </Link>
          <Link to="/contact" className="text-gray-600 dark:text-teal-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200 font-medium">
            Contact
          </Link>
        </nav>

        {/* Mobile Menu for Screens < 768px */}
        {isMobileMenuOpen && (
          <nav className="absolute top-16 left-0 w-full bg-white dark:bg-gray-900 shadow-lg md:hidden border-b border-gray-200 dark:border-gray-700 overflow-y-auto max-h-[calc(100vh-4rem)]">
            {/* Navigation Links */}
            <div className="flex flex-col items-start gap-4 px-8 py-4">
              <Link
                to="/features"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-600 dark:text-teal-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200 font-medium w-full py-2"
              >
                Features
              </Link>
              <Link
                to="/pricing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-600 dark:text-teal-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200 font-medium w-full py-2"
              >
                Pricing
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-600 dark:text-teal-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200 font-medium w-full py-2"
              >
                About
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-600 dark:text-teal-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200 font-medium w-full py-2"
              >
                Contact
              </Link>
            </div>

            {/* Actions Section */}
            <div className="px-8 py-4 border-t border-gray-200 dark:border-gray-700">
              {/* Theme Toggle Section */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600 dark:text-gray-300">Theme</span>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">Light</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Dark</span>
                    </>
                  )}
                </button>
              </div>

              {/* Login Button */}
              <Link
                to="/auth"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 rounded-lg font-medium hover:scale-105 transition-all duration-200"
              >
                Login
              </Link>
            </div>
          </nav>
        )}

        {/* User Actions (Visible on >= 768px) */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <Link
            to="/auth"
            className="text-gray-400 hover:text-teal-400 transition-colors duration-200 font-medium"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
};