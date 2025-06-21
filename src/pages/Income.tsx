import React, { useState, useEffect } from 'react';
import { DollarSign, Filter, Download, Plus, Trash2, PieChart, BarChart3 } from 'lucide-react';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { Footer } from '../components/Footer';
import { AddIncomeModal } from '../components/dashboard/modals/AddIncomeModal';
import { DeleteConfirmModal } from '../components/dashboard/DeleteConfirmModal';
import { PieChart as PieChartComponent } from '../components/dashboard/PieChart';
import { Toast } from '../components/Toast';
import { getIncome, getCurrentUser, exportToCSV, deleteIncome } from '../lib/supabase';

export const Income: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [income, setIncome] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const mockIncomeData = [
    {
      id: 1,
      amount: 2500,
      source: 'Freelance Project',
      date: '2025-01-15',
      category: 'Freelance Work',
      notes: 'Website development for Client X',
      created_at: '2025-01-15T10:00:00Z'
    },
    {
      id: 2,
      amount: 1500,
      source: 'Consulting',
      date: '2025-01-10',
      category: 'Consulting',
      notes: 'Strategy consultation',
      created_at: '2025-01-10T14:30:00Z'
    },
    {
      id: 3,
      amount: 800,
      source: 'Side Project',
      date: '2025-01-08',
      category: 'Freelance Work',
      notes: 'Mobile app development',
      created_at: '2025-01-08T09:15:00Z'
    },
    {
      id: 4,
      amount: 1200,
      source: 'Client Y',
      date: '2025-01-05',
      category: 'Freelance Work',
      notes: 'E-commerce platform',
      created_at: '2025-01-05T16:45:00Z'
    },
    {
      id: 5,
      amount: 950,
      source: 'Retainer Fee',
      date: '2025-01-01',
      category: 'Business Revenue',
      notes: 'Monthly maintenance fee',
      created_at: '2025-01-01T11:20:00Z'
    }
  ];

  useEffect(() => {
    const loadIncome = async () => {
      const demoMode = localStorage.getItem('isDemoUser') === 'true';
      
      if (demoMode) {
        setIsDemoUser(true);
        setIncome(mockIncomeData);
        setLoading(false);
        return;
      }

      try {
        const { user } = await getCurrentUser();
        if (user) {
          const { data, error } = await getIncome(user.id);
          if (!error && data) {
            setIncome(data);
          }
        }
      } catch (error) {
        console.error('Error loading income:', error);
      } finally {
        setLoading(false);
      }
    };

    loadIncome();
  }, []);

  const handleIncomeSuccess = () => {
    setToast({ message: 'Income added successfully!', type: 'success' });
    // Reload income data
    const loadIncome = async () => {
      try {
        const { user } = await getCurrentUser();
        if (user) {
          const { data, error } = await getIncome(user.id);
          if (!error && data) {
            setIncome(data);
          }
        }
      } catch (error) {
        console.error('Error reloading income:', error);
      }
    };
    loadIncome();
  };

  const handleDelete = async () => {
    if (!selectedItem || isDemoUser) return;

    setDeleteLoading(true);
    try {
      const { error } = await deleteIncome(selectedItem.id);
      if (error) {
        setToast({ message: 'Failed to delete income', type: 'error' });
      } else {
        setToast({ message: 'Income deleted successfully!', type: 'success' });
        setIncome(prev => prev.filter(item => item.id !== selectedItem.id));
        setShowDeleteModal(false);
        setSelectedItem(null);
      }
    } catch (error) {
      setToast({ message: 'Failed to delete income', type: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExport = () => {
    if (income.length === 0) {
      setToast({ message: 'No data to export', type: 'error' });
      return;
    }

    const exportData = income.map(item => ({
      Amount: item.amount,
      Source: item.source,
      Date: item.date,
      Category: item.category,
      Notes: item.notes,
      'Created At': new Date(item.created_at).toLocaleString()
    }));

    const today = new Date().toISOString().split('T')[0];
    exportToCSV(exportData, `income_export_${today}.csv`);
    setToast({ message: 'Income data exported successfully!', type: 'success' });
  };

  // Prepare pie chart data
  const pieChartData = React.useMemo(() => {
    const categoryTotals = income.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
      return acc;
    }, {} as Record<string, number>);

    const colors = [
      '#10B981', // green
      '#3B82F6', // blue
      '#8B5CF6', // purple
      '#F59E0B', // amber
      '#EF4444', // red
      '#06B6D4', // cyan
    ];

    return Object.entries(categoryTotals).map(([category, amount], index) => ({
      label: category,
      value: amount,
      color: colors[index % colors.length]
    }));
  }, [income]);

  // Prepare monthly trend data
  const monthlyTrendData = React.useMemo(() => {
    const monthlyTotals = income.reduce((acc, item) => {
      const month = new Date(item.date).toLocaleDateString('en-US', { month: 'short' });
      acc[month] = (acc[month] || 0) + Number(item.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthlyTotals).map(([month, amount]) => ({
      month,
      amount
    }));
  }, [income]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading income data...</p>
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
              Income Tracking
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor and manage your income sources
            </p>
          </div>

          {/* Charts Section */}
          {income.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Income by Category Pie Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                    <PieChart className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Income by Category
                  </h3>
                </div>
                <div className="flex justify-center">
                  <PieChartComponent data={pieChartData} size={250} />
                </div>
              </div>

              {/* Monthly Trend Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Monthly Income Trend
                  </h3>
                </div>
                <div className="space-y-4">
                  {monthlyTrendData.map((month, index) => {
                    const maxAmount = Math.max(...monthlyTrendData.map(m => m.amount));
                    const percentage = (month.amount / maxAmount) * 100;
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {month.month}
                          </span>
                          <span className="text-sm font-bold text-green-600 dark:text-green-400">
                            ${month.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-lg h-3 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-lg transition-all duration-1000 ease-out"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Income</h3>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${income.reduce((sum, item) => sum + Number(item.amount), 0).toLocaleString()}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Average per Entry</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {income.length > 0
                  ? `$${Math.round(income.reduce((sum, item) => sum + Number(item.amount), 0) / income.length).toLocaleString()}`
                  : '$0'}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                  <PieChart className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Entries</h3>
              </div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {income.length}
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <button
                onClick={() => setShowModal(true)}
                disabled={isDemoUser}
                className={`bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-medium hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 ${
                  isDemoUser ? 'cursor-not-allowed opacity-75' : ''
                }`}
                title={isDemoUser ? 'Sign up to add income' : ''}
              >
                <Plus className="w-5 h-5" />
                Add Income
              </button>

              <div className="flex gap-3">
                <button className="bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <button 
                  onClick={handleExport}
                  disabled={income.length === 0}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Income Table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Income Records
                </h2>
              </div>
            </div>

            {income.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">No income recorded yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Start by adding your first income entry
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
                        Source
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
                    {income.map((incomeItem) => (
                      <tr key={incomeItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                            ${Number(incomeItem.amount).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {incomeItem.source}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(incomeItem.date).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                            {incomeItem.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate block">
                            {incomeItem.notes}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedItem(incomeItem);
                              setShowDeleteModal(true);
                            }}
                            disabled={isDemoUser}
                            className={`text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 ${
                              isDemoUser ? 'cursor-not-allowed opacity-50' : ''
                            }`}
                            title={isDemoUser ? 'Sign up to delete entries' : 'Delete income'}
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

          {isDemoUser && (
            <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>Demo Mode:</strong> Sign up to add and manage your own income records with real data.
              </p>
            </div>
          )}
        </main>

        <Footer />
      </div>

      {/* Add Income Modal */}
      {showModal && (
        <AddIncomeModal 
          onClose={() => setShowModal(false)} 
          onSuccess={handleIncomeSuccess}
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
        title="Delete Income Entry"
        message="Are you sure you want to delete this income entry? This action cannot be undone."
        itemName={selectedItem?.source}
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