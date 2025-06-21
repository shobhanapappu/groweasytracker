import React, { useState } from 'react';
import { Download, FileText, Database, Loader } from 'lucide-react';
import { PremiumFeatureButton } from './PremiumFeatureButton';

interface ExportButtonProps {
  onExportCSV: () => void;
  onExportJSON?: () => void;
  disabled?: boolean;
  canAccess: boolean;
  isDemoUser: boolean;
  loading?: boolean;
  className?: string;
  showJSONOption?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  onExportCSV,
  onExportJSON,
  disabled = false,
  canAccess,
  isDemoUser,
  loading = false,
  className = '',
  showJSONOption = false
}) => {
  const [showOptions, setShowOptions] = useState(false);

  const handleCSVExport = () => {
    onExportCSV();
    setShowOptions(false);
  };

  const handleJSONExport = () => {
    if (onExportJSON) {
      onExportJSON();
    }
    setShowOptions(false);
  };

  if (!showJSONOption) {
    // Simple CSV export button
    return (
      <PremiumFeatureButton
        canAccess={canAccess}
        isDemoUser={isDemoUser}
        onClick={handleCSVExport}
        disabled={disabled || loading}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105 ${className}`}
      >
        {loading ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">
          {loading ? 'Exporting...' : 'Export CSV'}
        </span>
      </PremiumFeatureButton>
    );
  }

  // Advanced export with options
  return (
    <div className="relative">
      <PremiumFeatureButton
        canAccess={canAccess}
        isDemoUser={isDemoUser}
        onClick={() => setShowOptions(!showOptions)}
        disabled={disabled || loading}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105 ${className}`}
      >
        {loading ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">
          {loading ? 'Exporting...' : 'Export'}
        </span>
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white ml-1"></div>
      </PremiumFeatureButton>

      {showOptions && canAccess && !isDemoUser && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
          <button
            onClick={handleCSVExport}
            disabled={disabled || loading}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <FileText className="w-4 h-4 text-blue-500" />
            Export as CSV
          </button>
          
          {onExportJSON && (
            <button
              onClick={handleJSONExport}
              disabled={disabled || loading}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <Database className="w-4 h-4 text-blue-500" />
              Export as JSON
            </button>
          )}
        </div>
      )}
    </div>
  );
};