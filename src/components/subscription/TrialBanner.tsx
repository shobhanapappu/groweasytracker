import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';

export const TrialBanner: React.FC = () => {
  const { subscription } = useSubscription();

  if (!subscription || !subscription.trial_end_date) {
    return null;
  }

  const trialEndDate = new Date(subscription.trial_end_date);
  const now = new Date();
  const daysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) {
    return null;
  }

  const formattedEndDate = trialEndDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-blue-600 text-white rounded-lg p-4 my-6 flex items-center justify-between shadow-lg">
      <div className="flex items-center">
        <div className="bg-white/20 p-3 rounded-full mr-4">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg">You're on a trial period!</h3>
          <p className="text-sm opacity-90">
            You have {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left. Your trial ends on {formattedEndDate}.
          </p>
        </div>
      </div>
      <Link
        to="/subscription"
        className="bg-white text-blue-600 font-bold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
      >
        Upgrade Now <ArrowRight className="w-4 h-4 ml-2" />
      </Link>
    </div>
  );
}; 