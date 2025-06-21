import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, CheckCircle, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { resendVerificationEmail, getCurrentUser, isEmailConfirmed } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';

export const VerifyEmailPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [email, setEmail] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkEmailStatus = async () => {
      // Get email from localStorage or current user
      const pendingEmail = localStorage.getItem('pendingEmail');
      const { user } = await getCurrentUser();
      
      if (user) {
        setEmail(user.email || '');
        const emailConfirmed = await isEmailConfirmed();
        if (emailConfirmed) {
          setIsVerified(true);
          setMessage('Your email has been verified! Redirecting to dashboard...');
          setMessageType('success');
          setTimeout(() => navigate('/dashboard'), 2000);
        }
      } else if (pendingEmail) {
        setEmail(pendingEmail);
      }
    };

    checkEmailStatus();
  }, [navigate]);

  const handleResendEmail = async () => {
    if (!email) {
      setMessage('No email address found. Please try signing up again.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { error } = await resendVerificationEmail(email);

      if (error) {
        setMessage(error.message);
        setMessageType('error');
      } else {
        setMessage('Verification email sent! Please check your inbox and spam folder.');
        setMessageType('success');
      }
    } catch (error) {
      setMessage('Failed to resend email. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const getMessageIcon = () => {
    switch (messageType) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'error':
        return <Mail className="w-5 h-5 text-red-600 dark:text-red-400" />;
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

      <main className="py-20 px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
            {isVerified ? (
              <>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Email Verified!
                </h1>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Your email has been successfully verified. You can now access all features of your account.
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Verify Your Email
                </h1>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  We've sent a verification link to{' '}
                  {email && (
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {email}
                    </span>
                  )}
                  {!email && 'your email address'}. 
                  Please check your inbox and spam folder, then click the link to verify your account.
                </p>

                <div className="space-y-4">
                  <button
                    onClick={handleResendEmail}
                    disabled={loading || !email}
                    className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white py-3 rounded-lg font-bold hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        Resend Verification Email
                      </>
                    )}
                  </button>

                  <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                    <p>• Check your spam/junk folder</p>
                    <p>• Make sure {email} is correct</p>
                    <p>• The link expires in 24 hours</p>
                  </div>
                </div>
              </>
            )}

            {message && (
              <div className={`mt-6 p-4 rounded-lg border ${getMessageStyles()}`}>
                <div className="flex items-start gap-3">
                  {getMessageIcon()}
                  <p className="text-sm font-medium flex-1">{message}</p>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};