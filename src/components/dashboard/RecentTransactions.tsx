import React, { useState, useEffect } from 'react';
import { ExternalLink, Filter, Download, ChevronDown } from 'lucide-react';
import { 
  getIncome, 
  getExpenses, 
  getInvestments, 
  getSavingsGoals, 
  getCurrentUser,
  exportToCSV 
} from '../../lib/supabase';

interface RecentTransactionsProps {
  isDemoUser?: boolean;
  onExportSuccess?: (message: string) => void;
}

interface Transaction {
  id: string;
  type: 'Income' | 'Expense' | 'Investment' | 'Savings';
  amount: number;
  category: string;
  date: string;
  notes: string;
  created_at: string;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ 
  isDemoUser = false,
  onExportSuccess 
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'All',
    dateRange: 'Last 30 Days'
  });

  const mockTransactions: Transaction[] = [
    {
      id: 'demo-1',
      type: 'Income',
      amount: 2500,
      category: 'Freelance Work',
      date: '2025-01-15',
      notes: 'Website development project',
      created_at: '2025-01-15T10:00:00Z',
    },
    {
      id: 'demo-2',
      type: 'Expense',
      amount: 500,
      category: 'Marketing',
      date: '2025-01-14',
      notes: 'Google Ads campaign',
      created_at: '2025-01-14T14:30:00Z',
    },
    {
      id: 'demo-3',
      type: 'Investment',
      amount: 1000,
      category: 'Stocks',
      date: '2025-01-13',
      notes: 'Tech stock portfolio',
      created_at: '2025-01-13T09:15:00Z',
    },
    {
      id: 'demo-4',
      type: 'Savings',
      amount: 500,
      category: 'Emergency Fund',
      date: '2025-01-12',
      notes: 'Monthly savings goal',
      created_at: '2025-01-12T16:45:00Z',
    },
    {
      id: 'demo-5',
      type: 'Income',
      amount: 1500,
      category: 'Consulting',
      date: '2025-01-10',
      notes: 'Strategy consultation',
      created_at: '2025-01-10T11:20:00Z',
    },
  ];

  useEffect(() => {
    const loadTransactions = async () => {
      if (isDemoUser) {
        setTransactions(mockTransactions);
        setFilteredTransactions(mockTransactions);
        setLoading(false);
        return;
      }

      try {
        const { user } = await getCurrentUser();
        if (user) {
          const [incomeResult, expensesResult, investmentsResult, savingsResult] = await Promise.all([
            getIncome(user.id),
            getExpenses(user.id),
            getInvestments(user.id),
            getSavingsGoals(user.id)
          ]);

          const allTransactions: Transaction[] = [];

          // Add income transactions
          if (incomeResult.data) {
            incomeResult.data.forEach(item => {
              allTransactions.push({
                id: item.id,
                type: 'Income',
                amount: Number(item.amount),
                category: item.category,
                date: item.date,
                notes: item.notes,
                created_at: item.created_at,
              });
            });
          }

          // Add expense transactions
          if (expensesResult.data) {
            expensesResult.data.forEach(item => {
              allTransactions.push({
                id: item.id,
                type: 'Expense',
                amount: Number(item.amount),
                category: item.category,
                date: item.date,
                notes: item.notes,
                created_at: item.created_at,
              });
            });
          }

          // Add investment transactions
          if (investmentsResult.data) {
            investmentsResult.data.forEach(item => {
              allTransactions.push({
                id: item.id,
                type: 'Investment',
                amount: Number(item.amount),
                category: item.type,
                date: item.date,
                notes: item.notes,
                created_at: item.created_at,
              });
            });
          }

          // Add savings transactions
          if (savingsResult.data) {
            savingsResult.data.forEach(item => {
              allTransactions.push({
                id: item.id,
                type: 'Savings',
                amount: Number(item.current_amount),
                category: item.goal_name,
                date: item.created_at.split('T')[0],
                notes: item.notes,
                created_at: item.created_at,
              });
            });
          }

          // Sort by created_at descending
          allTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

          setTransactions(allTransactions);
          setFilteredTransactions(allTransactions);
        }
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [isDemoUser]);

  useEffect(() => {
    applyFilters();
  }, [filters, transactions]);

  const applyFilters = () => {
    let filtered = [...transactions];

    // Filter by type
    if (filters.type !== 'All') {
      filtered = filtered.filter(transaction => transaction.type === filters.type);
    }

    // Filter by date range
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
      default:
        startDate = new Date(0); // Show all
    }

    filtered = filtered.filter(transaction => new Date(transaction.date) >= startDate);

    setFilteredTransactions(filtered);
  };

  const handleExport = () => {
    if (filteredTransactions.length === 0) {
      return;
    }

    const exportData = filteredTransactions.map(transaction => ({
      Type: transaction.type,
      Amount: transaction.amount,
      Category: transaction.category,
      Date: transaction.date,
      Notes: transaction.notes,
      'Created At': new Date(transaction.created_at).toLocaleString()
    }));

    const today = new Date().toISOString().split('T')[0];
    exportToCSV(exportData, `transactions_export_${today}.csv`);
    
    if (onExportSuccess) {
      onExportSuccess('Transactions exported successfully!');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Income':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'Expense':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      case 'Investment':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
      case 'Savings':
        return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Transactions
        </h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors w-full sm:w-auto"
            >
              <Filter className="w-4 h-4" />
              Filter
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {showFilters && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10">
                <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="All">All</option>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                    <option value="Investment">Investment</option>
                    <option value="Savings">Savings</option>
                  </select>
                </div>
                <div className="px-3 py-2">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date Range
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                    className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="Last 30 Days">Last 30 Days</option>
                    <option value="Last 90 Days">Last 90 Days</option>
                    <option value="All">All Time</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleExport}
            disabled={filteredTransactions.length === 0}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          {!isDemoUser && (
            <a
              href="/transactions"
              className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors w-full sm:w-auto justify-center"
            >
              View All
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No transactions available
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {filters.type !== 'All' || filters.dateRange !== 'Last 30 Days' 
              ? 'Try adjusting your filters'
              : 'Start by adding your first income or expense'
            }
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Category
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.slice(0, 10).map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="py-2 px-2 sm:py-3 sm:px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(transaction.type)}`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="py-2 px-2 sm:py-3 sm:px-4">
                    <span className={`font-semibold ${
                      transaction.type === 'Income' 
                        ? 'text-green-600 dark:text-green-400' 
                        : transaction.type === 'Expense'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}>
                      ${transaction.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-2 px-2 sm:py-3 sm:px-4 text-sm text-gray-900 dark:text-white">
                    {transaction.category}
                  </td>
                  <td className="py-2 px-2 sm:py-3 sm:px-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-2 sm:py-3 sm:px-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                    {transaction.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};