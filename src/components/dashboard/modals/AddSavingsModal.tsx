import React, { useState } from 'react';
import { X, Target } from 'lucide-react';
import { addSavingsGoal, getCurrentUser } from '../../../lib/supabase';

interface AddSavingsModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AddSavingsModal: React.FC<AddSavingsModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    goal_name: '',
    target_amount: '',
    deadline: '',
    current_amount: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { user } = await getCurrentUser();
      if (!user) {
        setError('You must be logged in to add savings goals');
        return;
      }

      const { error: addError } = await addSavingsGoal({
        user_id: user.id,
        goal_name: formData.goal_name,
        target_amount: parseFloat(formData.target_amount),
        deadline: formData.deadline || null,
        current_amount: parseFloat(formData.current_amount) || 0,
        notes: formData.notes,
      });

      if (addError) {
        setError(addError.message);
      } else {
        onSuccess();
        onClose();
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Add Savings Goal
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Set your target
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="goal_name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Goal Name *
              </label>
              <input
                type="text"
                id="goal_name"
                name="goal_name"
                value={formData.goal_name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                placeholder="e.g., Emergency Fund, Vacation"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="target_amount" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Target Amount *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-lg">$</span>
                </div>
                <input
                  type="number"
                  id="target_amount"
                  name="target_amount"
                  value={formData.target_amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0.01"
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="current_amount" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Current Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-lg">$</span>
                </div>
                <input
                  type="number"
                  id="current_amount"
                  name="current_amount"
                  value={formData.current_amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="deadline" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Deadline (Optional)
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 shadow-sm hover:shadow-md"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 shadow-sm hover:shadow-md resize-none"
                placeholder="Optional notes..."
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex-shrink-0">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-semibold shadow-lg"
            >
              {loading ? 'Adding...' : 'Add Goal'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};