import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, Filter, Download, Trash2, PieChart, BarChart3 } from 'lucide-react';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { Footer } from '../components/Footer';
import { AddInvestmentModal } from '../components/dashboard/modals/AddInvestmentModal';
import { DeleteConfirmModal } from '../components/dashboard/DeleteConfirmModal';
import { PieChart as PieChartComponent } from '../components/dashboard/PieChart';
import { Toast } from '../components/Toast';
import { getInvestments, getCurrentUser, exportToCSV, deleteInvestment } from '../lib/supabase';
import { PremiumFeatureButton } from '../components/PremiumFeatureButton';
import { useSubscription } from '../hooks/useSubscription';

interface PlatformData {
  platform: string;
  amount: number;
}

interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface Investment {
  id: number;
  type: string;
  amount: number;
  date: string;
  platform: string;
  notes: string;
  created_at: string;
}

export const Investments: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Investment | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { canAccessPremiumFeatures } = useSubscription();

  const mockInvestmentData: Investment[] = [
    {
      id: 1,
      type: 'Stocks',
      amount: 1500,
      date: '2025-01-15',
      platform: 'Robinhood',
      notes: 'Tech stock portfolio',
      created_at: '2025-01-15T10:00:00Z'
    },
    {
      id: 2,
      type: 'ETFs',
      amount: 2000,
      date: '2025-01-10',
      platform: 'Vanguard',
      notes: 'S&P 500 index fund',
      created_at: '2025-01-10T14:30:00Z'
    },
    {
      id: 3,
      type: 'Cryptocurrency',
      amount: 800,
      date: '2025-01-08',
      platform: 'Coinbase',
      notes: 'Bitcoin investment',
      created_at: '2025-01-08T09:15:00Z'
    }
  ];

  useEffect(() => {
    const loadInvestments = async () => {
      const demoMode = localStorage.getItem('isDemoUser') === 'true';
      
      if (demoMode) {
        setIsDemoUser(true);
        setInvestments(mockInvestmentData);
        setLoading(false);
        return;
      }

      try {
        const { user } = await getCurrentUser();
        if (user) {
          const { data, error } = await getInvestments(user.id);
          if (!error && data) {
            setInvestments(data);
          }
        }
      } catch (error) {
        console.error('Error loading investments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInvestments();
  }, []);

  const handleInvestmentSuccess = () => {
    setToast({ message: 'Investment added successfully!', type: 'success' });
    // Reload investments data
    const loadInvestments = async () => {
      try {
        const { user } = await getCurrentUser();
        if (user) {
          const { data, error } = await getInvestments(user.id);
          if (!error && data) {
            setInvestments(data);
          }
        }
      } catch (error) {
        console.error('Error reloading investments:', error);
      }
    };
    loadInvestments();
  };

  const handleDelete = async () => {
    if (!selectedItem || isDemoUser) return;

    setDeleteLoading(true);
    try {
      const { error } = await deleteInvestment(selectedItem.id.toString());
      if (error) {
        setToast({ message: 'Failed to delete investment', type: 'error' });
      } else {
        setToast({ message: 'Investment deleted successfully!', type: 'success' });
        setInvestments(prev => prev.filter(item => item.id !== selectedItem.id));
        setShowDeleteModal(false);
        setSelectedItem(null);
      }
    } catch (error) {
      setToast({ message: 'Failed to delete investment', type: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExport = () => {
    if (investments.length === 0) {
      setToast({ message: 'No data to export', type: 'error' });
      return;
    }

    const exportData = investments.map(investment => ({
      Type: investment.type,
      Amount: investment.amount,
      Date: investment.date,
      Platform: investment.platform,
      Notes: investment.notes,
      'Created At': new Date(investment.created_at).toLocaleString()
    }));

    const today = new Date().toISOString().split('T')[0];
    exportToCSV(exportData, `investments_export_${today}.csv`);
    setToast({ message: 'Investments data exported successfully!', type: 'success' });
  };

  const totalInvestments = investments.reduce((sum, investment) => sum + Number(investment.amount), 0);

  // Prepare pie chart data
  const pieChartData = React.useMemo(() => {
    const typeTotals = investments.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + Number(item.amount);
      return acc;
    }, {} as Record<string, number>);

    const colors = [
      '#3B82F6', // blue
      '#10B981', // green
      '#8B5CF6', // purple
      '#F59E0B', // amber
      '#EF4444', // red
      '#06B6D4', // cyan
    ];

    return Object.entries(typeTotals).map(([type, amount], index): PieChartData => ({
      label: type,
      value: amount,
      color: colors[index % colors.length]
    }));
  }, [investments]);

  // Prepare platform data
  const platformData = React.useMemo(() => {
    const platformTotals = investments.reduce((acc, item) => {
      acc[item.platform] = (acc[item.platform] || 0) + Number(item.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(platformTotals).map(([platform, amount]): PlatformData => ({
      platform,
      amount
    }));
  }, [investments]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading investments...</p>
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
              Investment Tracking
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor and manage your investment portfolio
            </p>
          </div>

          {/* Summary Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Portfolio Summary
              </h2>
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              ${totalInvestments.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total Investment Value
            </p>
          </div>

          {/* Charts Section */}
          {investments.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Investment Types Pie Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                    <PieChart className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Investment Types
                  </h3>
                </div>
                <div className="flex justify-center">
                  <PieChartComponent data={pieChartData} size={250} />
                </div>
              </div>

              {/* Platform Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Platform Distribution
                  </h3>
                </div>
                <div className="space-y-4">
                  {platformData.map((platform, index) => {
                    const percentage = Math.round((platform.amount / totalInvestments) * 100);
                    const colors = [
                      'from-blue-500 to-blue-600',
                      'from-green-500 to-green-600',
                      'from-purple-500 to-purple-600',
                      'from-orange-500 to-orange-600'
                    ];
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {platform.platform}
                          </span>
                          <div className="flex gap-2 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              {percentage}%
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              ${platform.amount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-lg h-3 overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${colors[index % colors.length]} rounded-lg transition-all duration-1000 ease-out`}
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

          {/* Action Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <button
                onClick={() => setShowModal(true)}
                disabled={isDemoUser}
                className={`bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 ${
                  isDemoUser ? 'cursor-not-allowed opacity-75' : ''
                }`}
                title={isDemoUser ? 'Sign up to add investments' : ''}
              >
                <Plus className="w-5 h-5" />
                Add Investment
              </button>

              <div className="flex gap-3">
                <button className="bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <PremiumFeatureButton
                  canAccess={canAccessPremiumFeatures}
                  isDemoUser={isDemoUser}
                  onClick={handleExport}
                  disabled={investments.length === 0}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </PremiumFeatureButton>
              </div>
            </div>
          </div>

          {/* Investments Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Investment Records
                </h2>
              </div>
            </div>

            {investments.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">No investments recorded yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Start by adding your first investment
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Platform
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
                    {investments.map((investment) => (
                      <tr key={investment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                            {investment.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                            ${Number(investment.amount).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(investment.date).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {investment.platform}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate block">
                            {investment.notes}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button 
                            onClick={() => {
                              setSelectedItem(investment);
                              setShowDeleteModal(true);
                            }}
                            disabled={isDemoUser}
                            className={`text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 ${
                              isDemoUser ? 'cursor-not-allowed opacity-50' : ''
                            }`}
                            title={isDemoUser ? 'Sign up to delete investments' : 'Delete investment'}
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

      {/* Add Investment Modal */}
      {showModal && (
        <AddInvestmentModal 
          onClose={() => setShowModal(false)} 
          onSuccess={handleInvestmentSuccess}
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
        title="Delete Investment"
        message="Are you sure you want to delete this investment record? This action cannot be undone."
        itemName={`${selectedItem?.type} - ${selectedItem?.platform}`}
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