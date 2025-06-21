import React from 'react';
import { Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PremiumFeatureButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  canAccess: boolean;
  isDemoUser: boolean;
  tooltipMessage?: string;
}

export const PremiumFeatureButton: React.FC<PremiumFeatureButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className = '',
  canAccess,
  isDemoUser,
  tooltipMessage
}) => {
  const handleClick = () => {
    if (canAccess && !disabled) {
      onClick?.();
    }
  };

  const getTooltipMessage = () => {
    if (isDemoUser) return 'Sign up to access this feature';
    if (!canAccess) return 'Upgrade to premium to use this feature';
    return tooltipMessage;
  };

  const isDisabled = disabled || (!canAccess && isDemoUser);

  return (
    <div className="relative group">
      {!canAccess && !isDemoUser ? (
        <Link
          to="/subscription"
          className={`${className} cursor-pointer relative hover:shadow-lg transition-all duration-200`}
          title={getTooltipMessage()}
        >
          {children}
          <div className="absolute -top-1 -right-1 p-1 bg-yellow-500 rounded-full shadow-lg">
            <Crown className="w-3 h-3 text-white" />
          </div>
        </Link>
      ) : (
        <button
          onClick={handleClick}
          disabled={isDisabled}
          className={`${className} ${
            isDisabled 
              ? 'cursor-not-allowed opacity-50' 
              : ''
          } transition-all duration-200`}
          title={getTooltipMessage()}
        >
          {children}
        </button>
      )}
      
      {/* Enhanced Tooltip */}
      {getTooltipMessage() && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
          {getTooltipMessage()}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
        </div>
      )}
    </div>
  );
};