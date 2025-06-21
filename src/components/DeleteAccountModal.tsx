import React, { useState } from 'react';
import { Trash2, AlertTriangle, Download, Shield } from 'lucide-react';
import { ExportButton } from './ExportButton';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onExportData: () => void;
  loading?: boolean;
  canExport: boolean;
  isDemoUser: boolean;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onExportData,
  loading = false,
  canExport,
  isDemoUser
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [hasExported, setHasExported] = useState(false);

  if (!isOpen) return null;

  const isConfirmValid = confirmText === 'DELETE';

  const handleExport = () => {
    onExportData();
    setHasExported(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Delete Account
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This action cannot be undone
              </p>
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                    What will be deleted:
                  </h4>
                  <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>• Your profile and account information</li>
                    <li>• All income and expense records</li>
                    <li>• Investment and savings data</li>
                    <li>• Budget and goal settings</li>
                    <li>• Subscription and billing information</li>
                  </ul>
                </div>
              </div>
            </div>

            {canExport && !isDemoUser && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                    Export Your Data First
                  </h4>
                  {hasExported && (
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                      ✓ Exported
                    </div>
                  )}
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                  Download all your financial data before deletion.
                </p>
                <ExportButton
                  onExportCSV={handleExport}
                  canAccess={canExport}
                  isDemoUser={isDemoUser}
                  className="w-full justify-center"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type "DELETE" to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Type DELETE here"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading || !isConfirmValid}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};