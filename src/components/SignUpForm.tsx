import React, { useState } from 'react';
import { Mail, Lock, User, ChevronDown } from 'lucide-react';
import { signUp, signInWithGoogle } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';

export const SignUpForm: React.FC = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    userType: 'freelancer' as 'freelancer' | 'e-commerce'
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleNextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await signUp(
        formData.email,
        formData.password,
        formData.name,
        formData.userType
      );

      if (error) {
        setMessage(error.message);
      } else {
        setMessage('Account created successfully! Please check your email to verify your account.');
      }
    } catch (error) {
      setMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setMessage(error.message);
      }
    } catch (error) {
      setMessage('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="signup-form" className="py-20 px-8 bg-gray-50 dark:bg-dark-950">
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-teal-800/30">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Join Thousands of{' '}
            <span className="bg-gradient-to-r from-primary-400 to-teal-400 bg-clip-text text-transparent">
              Smart Users
            </span>
          </h2>
          
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Step {currentStep}/3: {currentStep === 1 ? 'Personal Info' : currentStep === 2 ? 'Account Details' : 'User Type'}
              </span>
              <span className="text-sm font-bold text-primary-500">
                {Math.round((currentStep / 3) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-teal-700/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!formData.name.trim()}
                  className="w-full bg-gradient-to-r from-primary-500 to-teal-500 text-white py-3 rounded-lg font-bold hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                >
                  Next Step
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-teal-700/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-teal-700/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400"
                      placeholder="Create a password"
                      minLength={6}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!formData.email.trim() || !formData.password.trim()}
                    className="flex-1 bg-gradient-to-r from-primary-500 to-teal-500 text-white py-3 rounded-lg font-bold hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="userType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    I am a...
                  </label>
                  <div className="relative">
                    <select
                      id="userType"
                      name="userType"
                      value={formData.userType}
                      onChange={handleInputChange}
                      className="w-full pl-4 pr-10 py-3 border border-gray-300 dark:border-teal-700/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white appearance-none"
                    >
                      <option value="freelancer">Freelancer</option>
                      <option value="e-commerce">E-commerce Store Owner</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-primary-500 to-teal-500 text-white py-3 rounded-lg font-bold hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
              </div>
            )}
          </form>

          {message && (
            <div className={`mt-4 p-4 rounded-lg text-sm ${
              message.includes('successfully') 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            }`}>
              {message}
            </div>
          )}

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="mt-4 w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-bold border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img src="/google.svg" alt="Google" className="w-5 h-5" />
              Sign up with Google
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};