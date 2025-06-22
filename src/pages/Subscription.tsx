import React, { useState, useEffect } from 'react';
import { Crown, Check, ArrowLeft, Loader, Clock, Star, Info } from 'lucide-react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { Footer } from '../components/Footer';
import { Toast } from '../components/Toast';
import { getCurrentUser } from '../lib/supabase';
import { getUserSubscription, upgradeSubscription, hasPremiumAccess, getTrialEndDate, getTrialDaysRemaining, getTrialStartDate, isInTrialPeriod, Subscription as SubscriptionType } from '../lib/subscription';
import { RazorpayButton } from '../components/subscription/RazorpayButton';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const Subscription: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionType | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>(location.state?.billing || 'monthly');
  const [paymentType, setPaymentType] = useState<'recurring' | 'one-time'>(location.state?.paymentType || 'recurring');
  
  const amount = billing === 'yearly' ? 3229 : 299;

  useEffect(() => {
    const loadSubscription = async () => {
      const demoMode = localStorage.getItem('isDemoUser') === 'true';
      
      if (demoMode) {
        setIsDemoUser(true);
        setLoading(false);
        return;
      }

      try {
        const { user } = await getCurrentUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        const { data, error } = await getUserSubscription(user.id);
        if (!error && data) {
          setSubscription(data);
        }
      } catch (error) {
        console.error('Error loading subscription:', error);
        setToast({ message: 'Failed to load subscription details', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();

    // Check for success/cancel parameters
    const success = searchParams.get('success');
    const cancelled = searchParams.get('cancelled');
    
    if (success === 'true') {
      setToast({ message: 'Subscription activated successfully!', type: 'success' });
    } else if (cancelled === 'true') {
      setToast({ message: 'Subscription cancelled', type: 'error' });
    }
  }, [navigate, searchParams]);

  const benefits = [
    { text: 'Create unlimited budgets', icon: '📊' },
    { text: 'Set savings goals with deadlines', icon: '🎯' },
    { text: 'Delete entries and manage data', icon: '🗑️' },
    { text: 'Advanced charts and analytics', icon: '📈' },
    { text: 'Export data as CSV', icon: '📄' },
    { text: 'Priority customer support', icon: '🚀' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  const isPremium = subscription && hasPremiumAccess(subscription);
  const trialEndDate = subscription ? getTrialEndDate(subscription) : '';
  const trialStartDate = subscription ? getTrialStartDate(subscription) : '';
  const daysRemaining = subscription ? getTrialDaysRemaining(subscription) : 0;
  const inTrialPeriod = subscription ? isInTrialPeriod(subscription) : false;

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />
        
        <main className="max-w-6xl mx-auto px-6 py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>

          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-lg animate-pulse-subtle">
                <Crown className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Upgrade to Premium</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">Unlock all features and take control of your finances.</p>
            
            {/* Billing Toggle */}
            <div className="flex justify-center my-8">
              <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                <button
                  className={`px-6 py-2 rounded-xl font-semibold transition-colors duration-200 focus:outline-none ${billing === 'monthly' ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}
                  onClick={() => setBilling('monthly')}
                >
                  Monthly
                </button>
                <button
                  className={`px-6 py-2 rounded-xl font-semibold transition-colors duration-200 focus:outline-none ${billing === 'yearly' ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}
                  onClick={() => setBilling('yearly')}
                >
                  Yearly <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-bold">10% OFF</span>
                </button>
              </div>
            </div>

            {/* Payment Type Toggle */}
            <div className="flex justify-center my-8">
              <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                <button
                  className={`px-6 py-2 rounded-xl font-semibold transition-colors duration-200 focus:outline-none ${paymentType === 'recurring' ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}
                  onClick={() => setPaymentType('recurring')}
                >
                  Recurring
                </button>
                <button
                  className={`px-6 py-2 rounded-xl font-semibold transition-colors duration-200 focus:outline-none ${paymentType === 'one-time' ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}
                  onClick={() => setPaymentType('one-time')}
                >
                  One-Time
                </button>
              </div>
            </div>

            {/* Razorpay Button Placement */}
            <div className="flex justify-center mt-8">
              <RazorpayButton amount={amount} billing={billing} paymentType={paymentType} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Current Plan Status */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-teal-800/30 p-8 flex flex-col">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Current Plan
              </h2>
              
              {isDemoUser ? (
                <div className="text-center py-8 flex-grow flex flex-col justify-center">
                  <div className="p-6 bg-purple-100 dark:bg-purple-900/20 rounded-xl mb-6 border border-purple-200 dark:border-purple-800">
                    <Crown className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-purple-700 dark:text-purple-300 mb-2">
                      Demo Mode
                    </h3>
                    <p className="text-sm text-purple-600 dark:text-purple-400">
                      Sign up to start your 7-day free trial and access premium features
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/auth')}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-200 shadow-lg mt-auto"
                  >
                    Sign Up Now
                  </button>
                </div>
              ) : isPremium ? (
                <div className="text-center py-8 flex-grow flex flex-col justify-center">
                  <div className="p-6 bg-green-100 dark:bg-green-900/20 rounded-xl mb-6 border border-green-200 dark:border-green-800">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-green-500 rounded-full">
                        <Crown className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-2">
                      Premium Plan – Active
                    </h3>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      You have access to all premium features
                    </p>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-auto">
                    Thank you for being a premium subscriber! 🎉
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 flex-grow flex flex-col justify-center">
                  <div className="p-6 bg-blue-100 dark:bg-blue-900/20 rounded-xl mb-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-blue-500 rounded-full">
                        <Clock className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      Free Plan – 7-Day Trial {inTrialPeriod ? 'Active' : 'Ended'}
                    </h3>
                    <div className="space-y-2">
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Trial started: {trialStartDate}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Trial {inTrialPeriod ? 'ends' : 'ended'}: {trialEndDate}
                      </p>
                      {inTrialPeriod && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-200 dark:bg-blue-800 rounded-full">
                          <Clock className="w-4 h-4 text-blue-700 dark:text-blue-300" />
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            {daysRemaining} days remaining
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-auto">
                    {inTrialPeriod 
                      ? 'Upgrade now to keep access to premium features after your trial ends'
                      : 'Your trial has ended. Upgrade to regain access to premium features'
                    }
                  </div>
                </div>
              )}
            </div>

            {/* Premium Benefits */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border p-8 flex flex-col ring-2 ring-primary-500 scale-105 z-10 border-gray-200 dark:border-teal-800/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Premium Benefits
                </h2>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 text-xs font-semibold">
                  <Star className="w-4 h-4" /> Pro
                </span>
              </div>
              
              <ul className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <Check className="w-5 h-5 text-primary-500" />
                    <span className="text-2xl">{benefit.icon}</span>
                    <span className="font-medium">{benefit.text}</span>
                  </li>
                ))}
              </ul>

            </div>
          </div>

          {/* Trial Information Box */}
          {!isDemoUser && !isPremium && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">
                    About Your 7-Day Trial
                  </h3>
                  <div className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
                    <p>• Every new user gets exactly 7 days of premium features for free</p>
                    <p>• Your trial started when you created your account</p>
                    <p>• No credit card required during trial period</p>
                    <p>• Cancel anytime - no commitments</p>
                    {inTrialPeriod && (
                      <p className="font-semibold">• You currently have {daysRemaining} days remaining</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Features Comparison */}
          <div className="mt-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
              Feature Comparison
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-6 text-gray-900 dark:text-white font-semibold">Feature</th>
                    <th className="text-center py-4 px-6 text-gray-900 dark:text-white font-semibold">Free</th>
                    <th className="text-center py-4 px-6 text-blue-600 dark:text-blue-400 font-semibold">Premium</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300">Add Income & Expenses</td>
                    <td className="py-4 px-6 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300">Basic Dashboard</td>
                    <td className="py-4 px-6 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300">Create Budgets</td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-gray-400">7-Day Trial Only</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300">Savings Goals</td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-gray-400">7-Day Trial Only</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300">Delete Entries</td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-gray-400">7-Day Trial Only</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300">Export Data</td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-gray-400">Limited</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};