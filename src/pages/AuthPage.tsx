import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, ChevronDown, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { Footer } from '../components/Footer';
import { signUp, signIn, signInWithGoogle, getCurrentUser, isEmailConfirmed } from '../lib/supabase';
import { useSubscription } from '../hooks/useSubscription';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    userType: 'freelancer' as 'freelancer' | 'e-commerce'
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { subscription, isDemoUser, loading: subLoading } = useSubscription();

  useEffect(() => {
    if (subLoading) return; // Wait for subscription check
    
    const checkAuthAndRedirect = async () => {
      // Check for email confirmation
      const confirmed = searchParams.get('confirmed');
      if (confirmed === 'true') {
        setMessage('Email confirmed successfully! You can now access your dashboard.');
        setMessageType('success');
        setTimeout(() => navigate('/dashboard'), 2000);
        return;
      }

      // Check if user is already authenticated
      const { user } = await getCurrentUser();
      if (user && !isDemoUser) {
        const emailConfirmed = await isEmailConfirmed();
        if (emailConfirmed) {
          navigate('/dashboard');
        } else {
          navigate('/verify-email');
        }
      }
    };
    
    checkAuthAndRedirect();
  }, [navigate, isDemoUser, subLoading, searchParams]);

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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await signUp(
        formData.email,
        formData.password,
        formData.name,
        formData.userType
      );

      if (error) {
        setMessage(error.message);
        setMessageType('error');
      } else {
        setEmailSent(true);
        setMessage('Account created successfully! Please check your email to verify your account before signing in.');
        setMessageType('success');
        
        // Store email for verification page
        localStorage.setItem('pendingEmail', formData.email);
        
        // Redirect to verification page after 3 seconds
        setTimeout(() => {
          navigate('/verify-email');
        }, 3000);
      }
    } catch (error) {
      setMessage('An unexpected error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await signIn(formData.email, formData.password);

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setMessage('Please verify your email address before signing in. Check your inbox for the verification link.');
          setMessageType('info');
          localStorage.setItem('pendingEmail', formData.email);
          setTimeout(() => navigate('/verify-email'), 2000);
        } else {
          setMessage(error.message);
          setMessageType('error');
        }
      } else {
        // Check if email is confirmed
        const emailConfirmed = await isEmailConfirmed();
        if (!emailConfirmed) {
          setMessage('Please verify your email address to continue.');
          setMessageType('info');
          navigate('/verify-email');
        } else {
          localStorage.removeItem('isDemoUser');
          navigate('/dashboard');
        }
      }
    } catch (error) {
      setMessage('An unexpected error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setMessage(error.message);
        setMessageType('error');
      } else {
        localStorage.removeItem('isDemoUser');
        // Google OAuth handles email verification automatically
      }
    } catch (error) {
      setMessage('Failed to sign in with Google. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    // Check if a user is already logged in
    const { user } = await getCurrentUser();
    if (user) {
      setMessage('You are already logged in. Please log out to try demo mode.');
      setMessageType('error');
      return;
    }
    // Set demo user in localStorage
    localStorage.setItem('isDemoUser', 'true');
    navigate('/dashboard');
  };

  const getStepLabel = () => {
    switch (currentStep) {
      case 1: return 'Personal Info';
      case 2: return 'Account Details';
      case 3: return 'User Type';
      default: return '';
    }
  };

  const getMessageIcon = () => {
    switch (messageType) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'info':
        return <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      default:
        return null;
    }
  };

  const getMessageStyles = () => {
    switch (messageType) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  if (subLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              GrowEasy Tracker
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="py-12 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-semibold text-gray-900 dark:text-white mb-4">
              {isLogin ? 'Welcome Back' : 'Join GrowEasy Tracker'}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {isLogin 
                ? 'Sign in to access your financial dashboard' 
                : 'Start tracking your finances with smart tools'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sign Up Section */}
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 transition-all duration-300 ${
              !isLogin ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Create Account
                </h2>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !isLogin
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {!isLogin && !emailSent && (
                <>
                  {/* Progress Indicator */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Step {currentStep}/3: {getStepLabel()}
                      </span>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {Math.round((currentStep / 3) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentStep / 3) * 100}%` }}
                      />
                    </div>
                  </div>

                  <form onSubmit={handleSignUp}>
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Full Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              id="signup-name"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="Enter your full name"
                              required
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleNextStep}
                          disabled={!formData.name.trim()}
                          className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white py-3 rounded-lg font-bold hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          Next Step
                        </button>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="email"
                              id="signup-email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="Enter your email"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              id="signup-password"
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="Create a password"
                              minLength={6}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={handlePrevStep}
                            className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-bold hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={handleNextStep}
                            disabled={!formData.email.trim() || !formData.password.trim()}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white py-3 rounded-lg font-bold hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            Next Step
                          </button>
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="signup-userType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            I am a...
                          </label>
                          <div className="relative">
                            <select
                              id="signup-userType"
                              name="userType"
                              value={formData.userType}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
                              required
                            >
                              <option value="freelancer">Freelancer</option>
                              <option value="e-commerce">E-commerce Business Owner</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={handlePrevStep}
                            className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-bold hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-bold hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            {loading ? 'Creating Account...' : 'Create Account'}
                          </button>
                        </div>
                      </div>
                    )}
                  </form>

                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleGoogleAuth}
                      disabled={loading}
                      className="mt-4 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Sign Up with Google
                    </button>
                  </div>
                </>
              )}

              {!isLogin && emailSent && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Check Your Email
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    We've sent a verification link to <strong>{formData.email}</strong>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Redirecting to verification page...
                  </p>
                </div>
              )}

              {isLogin && (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <p>Already have an account? Use the login form →</p>
                </div>
              )}
            </div>

            {/* Login Section */}
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 transition-all duration-300 ${
              isLogin ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Sign In
                </h2>
                <button
                  onClick={() => setIsLogin(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isLogin
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  Log In
                </button>
              </div>

              {isLogin && (
                <>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          id="login-email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="login-password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter your password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                      </label>
                      <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                        Forgot Password?
                      </a>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white py-3 rounded-lg font-bold hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                  </form>

                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleGoogleAuth}
                      disabled={loading}
                      className="mt-4 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Log In with Google
                    </button>
                  </div>

                  {/* Demo User Access */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleDemoAccess}
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-lg font-bold hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-5 h-5" />
                      Try as Demo User
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                      Explore the app with sample data • No registration required
                    </p>
                  </div>
                </>
              )}

              {!isLogin && (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <p>New to GrowEasy Tracker? Use the sign-up form ←</p>
                </div>
              )}
            </div>
          </div>

          {message && (
            <div className={`mt-8 p-4 rounded-lg border max-w-md mx-auto ${getMessageStyles()}`}>
              <div className="flex items-start gap-3">
                {getMessageIcon()}
                <div className="flex-1">
                  <p className="text-sm font-medium">{message}</p>
                  {messageType === 'success' && emailSent && (
                    <p className="text-xs mt-2 opacity-75">
                      Didn't receive the email? Check your spam folder or try again.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};