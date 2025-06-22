import { useState, useEffect } from 'react';
import { getCurrentUser } from '../lib/supabase';
import { getUserSubscription, hasPremiumAccess, Subscription } from '../lib/subscription';

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(() => localStorage.getItem('isDemoUser') === 'true'); // Initialize synchronously

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
        if (user) {
          const { data } = await getUserSubscription(user.id);
          if (data) {
            setSubscription(data);
          }
        }
      } catch (error) {
        console.error('Error loading subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, []);

  const isPremium = subscription ? hasPremiumAccess(subscription) : false;
  const canAccessPremiumFeatures = isDemoUser ? false : isPremium;
  const isTrial = !!(subscription?.plan === 'free' && subscription?.trial_end_date && new Date(subscription.trial_end_date) > new Date());

  return {
    subscription,
    loading,
    isDemoUser,
    isPremium,
    canAccessPremiumFeatures,
    isTrial,
  };
};