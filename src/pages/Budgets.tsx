import React, { useState, useEffect } from 'react';
import { Target, Plus, Download, Trash2, PieChart } from 'lucide-react';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { Footer } from '../components/Footer';
import { AddBudgetModal } from '../components/dashboard/modals/AddBudgetModal';
import { DeleteConfirmModal } from '../components/dashboard/DeleteConfirmModal';
import { PieChart as PieChartComponent } from '../components/dashboard/PieChart';
import { FilterDropdown, FilterOptions } from '../components/FilterDropdown';
import { ExportButton } from '../components/ExportButton';
import { PremiumFeatureButton } from '../components/PremiumFeatureButton';
import { Toast } from '../components/Toast';
import { useSubscription } from '../hooks/useSubscription';
import { getBudgets, getExpenses, getCurrentUser, exportToCSV, deleteBudget } from '../lib/supabase';

export const Budgets: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [filteredBudgets, setFilteredBudgets] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { isDemoUser, canAccessPremiumFeatures } = useSubscription();

  const mockBudgetData = [
    {
      id: 1,
      category: 'Marketing',
      budget_limit: 500,
      spent: 350,
      progress: 70,
      color: 'bg-blue-500',
      start_date: '2025-01-01',
      created_at: '2025-01-01T00:00:00Z'
    },
    {
      id: 2,
      category: 'Software',
      budget_limit: 300,
      spent: 200,
      progress: 67,
      color: 'bg-purple-500',
      start_date: '2025-01-01',
      created_at: '2025-01-02T00:00:00Z'
    },
    {
      id: 3,
      category: 'Travel',
      budget_limit: 800,
      spent: 450,
      progress: 56,
      color: 'bg-green-500',
      start_date: '2025-01-01',
      created_at: '2025-01-03T00:00:00Z'
    }
  ];

  useEffect(() => {
    const loadBudgets = async () => {
      if (isDemoUser) {
        setBudgets(mockBudgetData);
        setFilteredBudgets(mockBudgetData);
        setLoading(false);
        return;
      }

      try {
        const { user } = await getCurrentUser();
        if (user) {
          const [budgetResult, expenseResult] = await Promise.all([
            getBudgets(user.id),
            getExpenses(user.id)
          ]);

          if (!budgetResult.error && budgetResult.data) {
            setBudgets(budgetResult.data);
            setFilteredBudgets(budgetResult.data);
          }

          if (!expenseResult.error && expenseResult.data) {
            setExpenses(expenseResult.data);
          }
        }
      } catch (error) {
        console.error('Error loading budgets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBudgets();
  }, [isDemoUser]);

  const calculateSpent = (category: string) => {
    if (isDemoUser) {
      const mockBudget = mockBudgetData.find(b => b.category === category);
      return mockBudget?.spent || 0;
    }

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    return expenses
      .filter(expense => 
        expense.category === category && 
        expense.date.startsWith(currentMonth)
      )
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
  };

  const handleFilterChange = (filters: FilterOptions) => {
    let filtered = [...budgets];

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(budget => budget.category === filters.category);
    }

    // Filter by date range
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

      filtered = filtered.filter(budget => new Date(budget.start_date) >= startDate);
    }

    // Sort
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        switch (filters.sortBy) {
          case 'amount':
            aValue = Number(a.budget_limit);
            bValue = Number(b.budget_limit);
            break;
          case 'category':
            aValue = a.category.toLowerCase();
            bValue = b.category.toLowerCase();
            break;
          default:
            aValue = new Date(a.start_date).getTime();
            bValue = new Date(b.start_date).getTime();
        }

        if (filters.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    setFilteredBudgets(filtered);
  };

  const handleBudgetSuccess = () => {
    setToast({ message: 'Budget created successfully!', type: 'success' });
    // Reload budgets
    const loadBudgets = async () => {
      try {
        const { user } = await getCurrentUser();
        if (user) {
          const { data, error } = await getBudgets(user.id);
          if (!error && data) {
            setBudgets(data);
            setFilteredBudgets(data);
          }
        }
      } catch (error) {
        console.error('Error reloading budgets:', error);
      }
    };
    loadBudgets();
  };

  const handleDelete = async () => {
    if (!selectedItem || isDemoUser) return;

    setDeleteLoading(true);
    try {
      const { error } = await deleteBudget(selectedItem.id);
      if (error) {
        setToast({ message: 'Failed to delete budget', type: 'error' });
      } else {
        setToast({ message: 'Budget deleted successfully!', type: 'success' });
        setBudgets(prev => prev.filter(item => item.id !== selectedItem.id));
        setFilteredBudgets(prev => prev.filter(item => item.id !== selectedItem.id));
        setShowDeleteModal(false);
        setSelectedItem(null);
      }
    } catch (error) {
      setToast({ message: 'Failed to delete budget', type: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExport = () => {
    if (filteredBudgets.length === 0) {
      setToast({ message: 'No data to export', type: 'error' });
      return;
    }

    const exportData = filteredBudgets.map(budget => {
      const spent = calculateSpent(budget.category);
      const progress = Math.round((spent / Number(budget.budget_limit)) * 100);
      
      return {
        Category: budget.category,
        'Budget Limit': budget.budget_limit,
        'Amount Spent': spent,
        'Progress (%)': progress,
        'Remaining': Math.max(0, Number(budget.budget_limit) - spent),
        'Start Date': budget.start_date,
        'Created At': new Date(budget.created_at).toLocaleString()
      };
    });

    const today = new Date().toISOString().split('T')[0];
    exportToCSV(exportData, `budgets_export_${today}.csv`);
    setToast({ message: 'Budgets data exported successfully!', type: 'success' });
  };

  // Prepare pie chart data
  const pieChartData = React.useMemo(() => {
    const colors = [
      '#3B82F6', // blue
      '#8B5CF6', // purple
      '#10B981', // green
      '#F59E0B', // amber
      '#EF4444', // red
      '#06B6D4', // cyan
    ];

    return filteredBudgets.map((budget, index) => {
      const spent = calculateSpent(budget.category);
      return {
        label: budget.category,
        value: spent,
        color: colors[index % colors.length]
      };
    });
  }, [filteredBudgets]);

  const categories = [...new Set(budgets.map(budget => budget.category))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading budgets...</p>
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
              Budget Planning
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Set and track your spending limits by category
            </p>
          </div>

          {/* Charts Section */}
          {filteredBudgets.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Budget Distribution Pie Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                    <PieChart className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Budget Spending Distribution
                  </h3>
                </div>
                <div className="flex justify-center">
                  <PieChartComponent data={pieChartData} size={250} />
                </div>
              </div>

              {/* Budget Progress Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Budget Progress
                  </h3>
                </div>
                <div className="space-y-4">
                  {filteredBudgets.map((budget, index) => {
                    const spent = calculateSpent(budget.category);
                    const progress = Math.round((spent / Number(budget.budget_limit)) * 100);
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {budget.category}
                          </span>
                          <span className={`text-lg font-bold bg-gradient-to-r ${
                            progress > 80 ? 'from-red-500 to-red-600' : 
                            progress > 60 ? 'from-yellow-500 to-yellow-600' : 
                            'from-green-500 to-green-600'
                          } bg-clip-text text-transparent`}>
                            {progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-lg h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-lg transition-all duration-1000 ease-out ${
                              progress > 80 ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                              progress > 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                              'bg-gradient-to-r from-green-500 to-green-600'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>${spent.toLocaleString()} spent</span>
                          <span>${Number(budget.budget_limit).toLocaleString()} limit</span>
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
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Budget
              </PremiumFeatureButton>

              <div className="flex gap-3">
                <FilterDropdown
                  onFilterChange={handleFilterChange}
                  categories={categories}
                  showAmountFilter={false}
                  showCategoryFilter={true}
                  showDateFilter={true}
                />
                
                <ExportButton
                  onExportCSV={handleExport}
                  canAccess={canAccessPremiumFeatures}
                  isDemoUser={isDemoUser}
                  disabled={filteredBudgets.length === 0}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105"
                />
              </div>
            </div>
          </div>

          {/* Budget Cards */}
          {filteredBudgets.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                {budgets.length === 0 ? 'No budgets created yet' : 'No budgets match your filters'}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {budgets.length === 0 
                  ? 'Create your first budget to start tracking your spending'
                  : 'Try adjusting your filter criteria'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBudgets.map((budget) => {
                const spent = calculateSpent(budget.category);
                const progress = Math.round((spent / Number(budget.budget_limit)) * 100);
                
                return (
                  <div key={budget.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 ${budget.color || 'bg-gradient-to-br from-blue-500 to-blue-600'} rounded-xl`}>
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {budget.category}
                        </h3>
                      </div>
                      <PremiumFeatureButton
                        canAccess={canAccessPremiumFeatures}
                        isDemoUser={isDemoUser}
                        onClick={() => {
                          setSelectedItem(budget);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </PremiumFeatureButton>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Spent</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          ${spent.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Limit</span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          ${Number(budget.budget_limit).toLocaleString()}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                          <span className={`text-sm font-bold ${
                            progress > 80 
                              ? 'text-red-600 dark:text-red-400' 
                              : progress > 60 
                              ? 'text-yellow-600 dark:text-yellow-400' 
                              : 'text-green-600 dark:text-green-400'
                          }`}>
                            {progress}%
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-lg h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-lg transition-all duration-1000 ease-out ${
                              progress > 80 
                                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                                : progress > 60 
                                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' 
                                : 'bg-gradient-to-r from-green-500 to-green-600'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Remaining: ${Math.max(0, Number(budget.budget_limit) - spent).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {isDemoUser && (
            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Demo Mode:</strong> Sign up to create and manage your own budgets with real data.
              </p>
            </div>
          )}
        </main>

        <Footer />
      </div>

      {/* Add Budget Modal */}
      {showModal && (
        <AddBudgetModal 
          onClose={() => setShowModal(false)} 
          onSuccess={handleBudgetSuccess}
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
        title="Delete Budget"
        message="Are you sure you want to delete this budget? This action cannot be undone."
        itemName={selectedItem?.category}
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