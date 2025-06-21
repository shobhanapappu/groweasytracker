import React, { useState, useEffect } from 'react';
import { CreditCard, Filter, Download, Plus, Trash2, PieChart } from 'lucide-react';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { Footer } from '../components/Footer';
import { AddExpenseModal } from '../components/dashboard/modals/AddExpenseModal';
import { DeleteConfirmModal } from '../components/dashboard/DeleteConfirmModal';
import { PieChart as PieChartComponent } from '../components/dashboard/PieChart';
import { Toast } from '../components/Toast';
import { getExpenses, getCurrentUser, exportToCSV, deleteExpense } from '../lib/supabase';

export const Expenses: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const mockExpenseData = [
    {
      id: 1,
      amount: 200,
      vendor: 'Adobe',
      date: '2025-01-15',
      category: 'Software',
      notes: 'Creative Cloud subscription',
      created_at: '2025-01-15T12:00:00Z'
    },
    {
      id: 2,
      amount: 150,
      vendor: 'AWS',
      date: '2025-01-12',
      category: 'Utilities',
      notes: 'Monthly server costs',
      created_at: '2025-01-12T08:30:00Z'
    },
    {
      id: 3,
      amount: 75,
      vendor: 'Starbucks',
      date: '2025-01-10',
      category: 'Travel',
      notes: 'Client meeting coffee',
      created_at: '2025-01-10T15:20:00Z'
    },
    {
      id: 4,
      amount: 300,
      vendor: 'Google Ads',
      date: '2025-01-08',
      category: 'Marketing',
      notes: 'Monthly ad spend',
      created_at: '2025-01-08T10:45:00Z'
    },
    {
      id: 5,
      amount: 120,
      vendor: 'Office Depot',
      date: '2025-01-05',
      category: 'Supplies',
      notes: 'Office supplies and equipment',
      created_at: '2025-01-05T14:15:00Z'
    }
  ];

  useEffect(() => {
    const loadExpenses = async () => {
      const demoMode = localStorage.getItem('isDemoUser') === 'true';
      
      if (demoMode) {
        setIsDemoUser(true);
        setExpenses(mockExpenseData);
        setLoading(false);
        return;
      }

      try {
        const { user } = await getCurrentUser();
        if (user) {
          const { data, error } = await getExpenses(user.id);
          if (!error && data) {
            setExpenses(data);
          }
        }
      } catch (error) {
        console.error('Error loading expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, []);

  const handleExpenseSuccess = () => {
    setToast({ message: 'Expense added successfully!', type: 'success' });
    // Reload expenses data
    const loadExpenses = async () => {
      try {
        const { user } = await getCurrentUser();
        if (user) {
          const { data, error } = await getExpenses(user.id);
          if (!error && data) {
            setExpenses(data);
          }
        }
      } catch (error) {
        console.error('Error reloading expenses:', error);
      }
    };
    loadExpenses();
  };

  const handleDelete = async () => {
    if (!selectedItem || isDemoUser) return;

    setDeleteLoading(true);
    try {
      const { error } = await deleteExpense(selectedItem.id);
      if (error) {
        setToast({ message: 'Failed to delete expense', type: 'error' });
      } else {
        setToast({ message: 'Expense deleted successfully!', type: 'success' });
        setExpenses(prev => prev.filter(item => item.id !== selectedItem.id));
        setShowDeleteModal(false);
        setSelectedItem(null);
      }
    } catch (error) {
      setToast({ message: 'Failed to delete expense', type: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExport = () => {
    if (expenses.length === 0) {
      setToast({ message: 'No data to export', type: 'error' });
      return;
    }

    const exportData = expenses.map(expense => ({
      Amount: expense.amount,
      Vendor: expense.vendor,
      Date: expense.date,
      Category: expense.category,
      Notes: expense.notes,
      'Created At': new Date(expense.created_at).toLocaleString()
    }));

    const today = new Date().toISOString().split('T')[0];
    exportToCSV(exportData, `expenses_export_${today}.csv`);
    setToast({ message: 'Expenses data exported successfully!', type: 'success' });
  };

  // Prepare pie chart data
  const pieChartData = React.useMemo(() => {
    const categoryTotals = expenses.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
      return acc;
    }, {} as Record<string, number>);

    const colors = [
      '#EF4444', // red
      '#F59E0B', // amber
      '#8B5CF6', // purple
      '#3B82F6', // blue
      '#10B981', // green
      '#06B6D4', // cyan
    ];

    return Object.entries(categoryTotals).map(([category, amount], index) => ({
      label: category,
      value: amount,
      color: colors[index % colors.length]
    }));
  }, [expenses]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading expenses...</p>
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
              Expenses Tracking
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor and categorize your business expenses
            </p>
          </div>

          {/* Charts Section */}
          {expenses.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Expenses by Category Pie Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                    <PieChart className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Expenses by Category
                  </h3>
                </div>
                <div className="flex justify-center">
                  <PieChartComponent data={pieChartData} size={250} />
                </div>
              </div>

              {/* Summary Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Expense Summary
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Expenses</span>
                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                      ${expenses.reduce((sum, item) => sum + Number(item.amount), 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Average per Entry</span>
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      ${Math.round(expenses.reduce((sum, item) => sum + Number(item.amount), 0) / expenses.length).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Entries</span>
                    <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {expenses.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <button
                onClick={() => setShowModal(true)}
                disabled={isDemoUser}
                className={`bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-medium hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 ${
                  isDemoUser ? 'cursor-not-allowed opacity-75' : ''
                }`}
                title={isDemoUser ? 'Sign up to add expenses' : ''}
              >
                <Plus className="w-5 h-5" />
                Add Expense
              </button>

              <div className="flex gap-3">
                <button className="bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <button 
                  onClick={handleExport}
                  disabled={expenses.length === 0}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Expense Records
                </h2>
              </div>
            </div>

            {expenses.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">No expenses recorded yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Start by adding your first expense
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Vendor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                            ${Number(expense.amount).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {expense.vendor}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(expense.date).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full">
                            {expense.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate block">
                            {expense.notes}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedItem(expense);
                              setShowDeleteModal(true);
                            }}
                            disabled={isDemoUser}
                            className={`text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 ${
                              isDemoUser ? 'cursor-not-allowed opacity-50' : ''
                            }`}
                            title={isDemoUser ? 'Sign up to delete entries' : 'Delete expense'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <AddExpenseModal 
          onClose={() => setShowModal(false)} 
          onSuccess={handleExpenseSuccess}
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
        title="Delete Expense Entry"
        message="Are you sure you want to delete this expense entry? This action cannot be undone."
        itemName={selectedItem?.vendor}
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