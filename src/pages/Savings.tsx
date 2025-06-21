import React, { useState, useEffect } from 'react';
import { Target, Plus, Calendar, Download, Trash2, PieChart, BarChart3 } from 'lucide-react';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { Footer } from '../components/Footer';
import { AddSavingsModal } from '../components/dashboard/modals/AddSavingsModal';
import { DeleteConfirmModal } from '../components/dashboard/DeleteConfirmModal';
import { PieChart as PieChartComponent } from '../components/dashboard/PieChart';
import { FilterDropdown, FilterOptions } from '../components/FilterDropdown';
import { ExportButton } from '../components/ExportButton';
import { PremiumFeatureButton } from '../components/PremiumFeatureButton';
import { Toast } from '../components/Toast';
import { useSubscription } from '../hooks/useSubscription';
import { getSavingsGoals, getCurrentUser, exportToCSV, deleteSavingsGoal } from '../lib/supabase';

export const Savings: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [savingsGoals, setSavingsGoals] = useState<any[]>([]);
  const [filteredSavingsGoals, setFilteredSavingsGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { isDemoUser, canAccessPremiumFeatures } = useSubscription();

  const mockSavingsData = [
    {
      id: 1,
      goal_name: 'Emergency Fund',
      target_amount: 10000,
      current_amount: 6000,
      deadline: '2025-12-31',
      notes: 'Six months of expenses',
      created_at: '2025-01-01T00:00:00Z'
    },
    {
      id: 2,
      goal_name: 'Vacation Fund',
      target_amount: 5000,
      current_amount: 2500,
      deadline: '2025-08-15',
      notes: 'Trip to Europe',
      created_at: '2025-01-05T00:00:00Z'
    },
    {
      id: 3,
      goal_name: 'New Equipment',
      target_amount: 3000,
      current_amount: 1200,
      deadline: null,
      notes: 'Laptop and camera upgrade',
      created_at: '2025-01-10T00:00:00Z'
    }
  ];

  useEffect(() => {
    const loadSavingsGoals = async () => {
      if (isDemoUser) {
        setSavingsGoals(mockSavingsData);
        setFilteredSavingsGoals(mockSavingsData);
        setLoading(false);
        return;
      }

      try {
        const { user } = await getCurrentUser();
        if (user) {
          const { data, error } = await getSavingsGoals(user.id);
          if (!error && data) {
            setSavingsGoals(data);
            setFilteredSavingsGoals(data);
          }
        }
      } catch (error) {
        console.error('Error loading savings goals:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSavingsGoals();
  }, [isDemoUser]);

  const handleFilterChange = (filters: FilterOptions) => {
    let filtered = [...savingsGoals];

    // Filter by date range (using deadline)
    if (filters.dateRange && filters.dateRange !== 'All') {
      const now = new Date();
      let startDate = new Date();

      switch (filters.dateRange) {
        case 'Last 7 Days':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'Last 30 Days':
          startDate.setDate(now.getDate() - 30);
          break;
        case 'Last 90 Days':
          startDate.setDate(now.getDate() - 90);
          break;
        case 'This Year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }

      filtered = filtered.filter(goal => 
        goal.deadline ? new Date(goal.deadline) >= startDate : true
      );
    }

    // Filter by amount range (using target_amount)
    if (filters.amountRange?.min !== undefined) {
      filtered = filtered.filter(goal => Number(goal.target_amount) >= filters.amountRange!.min!);
    }
    if (filters.amountRange?.max !== undefined) {
      filtered = filtered.filter(goal => Number(goal.target_amount) <= filters.amountRange!.max!);
    }

    // Sort
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        switch (filters.sortBy) {
          case 'amount':
            aValue = Number(a.target_amount);
            bValue = Number(b.target_amount);
            break;
          case 'category':
            aValue = a.goal_name.toLowerCase();
            bValue = b.goal_name.toLowerCase();
            break;
          default:
            aValue = new Date(a.created_at).getTime();
            bValue = new Date(b.created_at).getTime();
        }

        if (filters.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    setFilteredSavingsGoals(filtered);
  };

  const handleSavingsSuccess = () => {
    setToast({ message: 'Savings goal added successfully!', type: 'success' });
    // Reload savings goals data
    const loadSavingsGoals = async () => {
      try {
        const { user } = await getCurrentUser();
        if (user) {
          const { data, error } = await getSavingsGoals(user.id);
          if (!error && data) {
            setSavingsGoals(data);
            setFilteredSavingsGoals(data);
          }
        }
      } catch (error) {
        console.error('Error reloading savings goals:', error);
      }
    };
    loadSavingsGoals();
  };

  const handleDelete = async () => {
    if (!selectedItem || isDemoUser) return;

    setDeleteLoading(true);
    try {
      const { error } = await deleteSavingsGoal(selectedItem.id);
      if (error) {
        setToast({ message: 'Failed to delete savings goal', type: 'error' });
      } else {
        setToast({ message: 'Savings goal deleted successfully!', type: 'success' });
        setSavingsGoals(prev => prev.filter(item => item.id !== selectedItem.id));
        setFilteredSavingsGoals(prev => prev.filter(item => item.id !== selectedItem.id));
        setShowDeleteModal(false);
        setSelectedItem(null);
      }
    } catch (error) {
      setToast({ message: 'Failed to delete savings goal', type: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExport = () => {
    if (filteredSavingsGoals.length === 0) {
      setToast({ message: 'No data to export', type: 'error' });
      return;
    }

    const exportData = filteredSavingsGoals.map(goal => ({
      'Goal Name': goal.goal_name,
      'Target Amount': goal.target_amount,
      'Current Amount': goal.current_amount,
      'Progress': `${Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100)}%`,
      'Deadline': goal.deadline || 'No deadline',
      'Notes': goal.notes,
      'Created At': new Date(goal.created_at).toLocaleString()
    }));

    const today = new Date().toISOString().split('T')[0];
    exportToCSV(exportData, `savings_goals_export_${today}.csv`);
    setToast({ message: 'Savings goals data exported successfully!', type: 'success' });
  };

  const totalSaved = filteredSavingsGoals.reduce((sum, goal) => sum + Number(goal.current_amount), 0);
  const totalTarget = filteredSavingsGoals.reduce((sum, goal) => sum + Number(goal.target_amount), 0);

  // Prepare pie chart data
  const pieChartData = React.useMemo(() => {
    const colors = [
      '#10B981', // green
      '#3B82F6', // blue
      '#8B5CF6', // purple
      '#F59E0B', // amber
      '#EF4444', // red
      '#06B6D4', // cyan
    ];

    return filteredSavingsGoals.map((goal, index) => ({
      label: goal.goal_name,
      value: Number(goal.current_amount),
      color: colors[index % colors.length]
    }));
  }, [filteredSavingsGoals]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading savings goals...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />
        
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Savings Goals
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Set and track your financial savings goals
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Saved</h3>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${totalSaved.toLocaleString()}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Target</h3>
              </div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                ${totalTarget.toLocaleString()}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Goals</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {filteredSavingsGoals.length}
              </p>
            </div>
          </div>

          {/* Charts Section */}
          {filteredSavingsGoals.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Savings Distribution Pie Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                    <PieChart className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Savings Distribution
                  </h3>
                </div>
                <div className="flex justify-center">
                  <PieChartComponent data={pieChartData} size={250} />
                </div>
              </div>

              {/* Progress Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Goal Progress
                  </h3>
                </div>
                <div className="space-y-4">
                  {filteredSavingsGoals.map((goal, index) => {
                    const progress = Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100);
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {goal.goal_name}
                          </span>
                          <span className={`text-sm font-bold ${
                            progress >= 100 ? 'text-green-600 dark:text-green-400' : 
                            progress >= 75 ? 'text-blue-600 dark:text-blue-400' : 
                            'text-purple-600 dark:text-purple-400'
                          }`}>
                            {progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-lg h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-lg transition-all duration-1000 ease-out ${
                              progress >= 100 ? 'bg-gradient-to-r from-green-500 to-green-600' : 
                              progress >= 75 ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 
                              'bg-gradient-to-r from-purple-500 to-purple-600'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>${Number(goal.current_amount).toLocaleString()} saved</span>
                          <span>${Number(goal.target_amount).toLocaleString()} target</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <PremiumFeatureButton
                canAccess={canAccessPremiumFeatures}
                isDemoUser={isDemoUser}
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Savings Goal
              </PremiumFeatureButton>

              <div className="flex gap-3">
                <FilterDropdown
                  onFilterChange={handleFilterChange}
                  showAmountFilter={true}
                  showCategoryFilter={false}
                  showDateFilter={true}
                />
                
                <ExportButton
                  onExportCSV={handleExport}
                  canAccess={canAccessPremiumFeatures}
                  isDemoUser={isDemoUser}
                  disabled={filteredSavingsGoals.length === 0}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105"
                />
              </div>
            </div>
          </div>

          {/* Savings Goals Grid */}
          {filteredSavingsGoals.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                {savingsGoals.length === 0 ? 'No savings goals yet' : 'No goals match your filters'}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {savingsGoals.length === 0 
                  ? 'Create your first savings goal to start tracking your progress'
                  : 'Try adjusting your filter criteria'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSavingsGoals.map((goal) => {
                const progress = Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100);
                const isOverdue = goal.deadline && new Date(goal.deadline) < new Date();
                
                return (
                  <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {goal.goal_name}
                        </h3>
                      </div>
                      <PremiumFeatureButton
                        canAccess={canAccessPremiumFeatures}
                        isDemoUser={isDemoUser}
                        onClick={() => {
                          setSelectedItem(goal);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </PremiumFeatureButton>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                        <span className={`text-lg font-bold ${
                          progress >= 100 
                            ? 'text-green-600 dark:text-green-400' 
                            : progress >= 75 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : 'text-purple-600 dark:text-purple-400'
                        }`}>
                          {progress}%
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-lg h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-lg transition-all duration-1000 ease-out ${
                            progress >= 100 
                              ? 'bg-gradient-to-r from-green-500 to-green-600' 
                              : progress >= 75 
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                              : 'bg-gradient-to-r from-purple-500 to-purple-600'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            ${Number(goal.current_amount).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Target</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            ${Number(goal.target_amount).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {goal.deadline && (
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className={`text-xs ${
                            isOverdue 
                              ? 'text-red-600 dark:text-red-400' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {isOverdue ? 'Overdue: ' : 'Due: '}
                            {new Date(goal.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {goal.notes && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                          {goal.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        <Footer />
      </div>

      {/* Add Savings Goal Modal */}
      {showModal && (
        <AddSavingsModal 
          onClose={() => setShowModal(false)} 
          onSuccess={handleSavingsSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedItem(null);
        }}
        onConfirm={handleDelete}
        title="Delete Savings Goal"
        message="Are you sure you want to delete this savings goal? This action cannot be undone."
        itemName={selectedItem?.goal_name}
        loading={deleteLoading}
      />

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