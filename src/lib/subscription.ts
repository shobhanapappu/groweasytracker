import { supabase } from './supabase';

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'free' | 'premium';
  trial_end_date: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// Get user's subscription
export const getUserSubscription = async (userId: string) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  return { data, error };
};

// Update subscription to premium
export const upgradeSubscription = async (userId: string) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      plan: 'premium',
      status: 'active',
      trial_end_date: null,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single();
  
  return { data, error };
};

// Check if user has premium access
export const hasPremiumAccess = (subscription: Subscription | null): boolean => {
  if (!subscription) return false;
  
  // Premium users always have access
  if (subscription.plan === 'premium' && subscription.status === 'active') {
    return true;
  }
  
  // Free users have access during trial period
  if (subscription.plan === 'free' && subscription.status === 'active' && subscription.trial_end_date) {
    const trialEndDate = new Date(subscription.trial_end_date);
    const now = new Date();
    return now <= trialEndDate;
  }
  
  return false;
};

// Check if trial has ended
export const isTrialEnded = (subscription: Subscription | null): boolean => {
  if (!subscription || subscription.plan === 'premium') return false;
  
  if (subscription.trial_end_date) {
    const trialEndDate = new Date(subscription.trial_end_date);
    const now = new Date();
    return now > trialEndDate;
  }
  
  return false;
};

// Get trial end date formatted
export const getTrialEndDate = (subscription: Subscription | null): string => {
  if (!subscription?.trial_end_date) return '';
  
  const trialEndDate = new Date(subscription.trial_end_date);
  return trialEndDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Get days remaining in trial
export const getTrialDaysRemaining = (subscription: Subscription | null): number => {
  if (!subscription?.trial_end_date || subscription.plan === 'premium') return 0;
  
  const trialEndDate = new Date(subscription.trial_end_date);
  const now = new Date();
  const diffTime = trialEndDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

// Get trial start date (calculated from end date)
export const getTrialStartDate = (subscription: Subscription | null): string => {
  if (!subscription?.trial_end_date) return '';
  
  const trialEndDate = new Date(subscription.trial_end_date);
  const trialStartDate = new Date(trialEndDate.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 days before end date
  
  return trialStartDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Check if user is within trial period
export const isInTrialPeriod = (subscription: Subscription | null): boolean => {
  if (!subscription || subscription.plan === 'premium') return false;
  
  if (subscription.trial_end_date) {
    const trialEndDate = new Date(subscription.trial_end_date);
    const now = new Date();
    const trialStartDate = new Date(trialEndDate.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    return now >= trialStartDate && now <= trialEndDate;
  }
  
  return false;
};