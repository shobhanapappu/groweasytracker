import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, CreditCard, TrendingUp, Target, PieChart, BarChart3 } from 'lucide-react';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { MetricCard } from '../components/dashboard/MetricCard';
import { QuickActions } from '../components/dashboard/QuickActions';
import { AIInsights } from '../components/dashboard/AIInsights';
import { FinancialHealth } from '../components/dashboard/FinancialHealth';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { Charts } from '../components/dashboard/Charts';
import { DemoBanner } from '../components/dashboard/DemoBanner';
import { SubscriptionBanner } from '../components/subscription/SubscriptionBanner';
import { PieChart as PieChartComponent } from '../components/dashboard/PieChart';
import { Footer } from '../components/Footer';
import { Toast } from '../components/Toast';
import { useSubscription } from '../hooks/useSubscription';
import { 
  getCurrentUser, 
  getIncome, 
  getExpenses, 
  getInvestments, 
  getSavingsGoals,
  getBudgets,
  getMonthlyData,
  getExpensesByCategory
} from '../lib/supabase';

export const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalInvestments: 0,
    totalSavings: 0,
  });
  const [chartData, setChartData] = useState<any>(null);
  const [comprehensiveData, setComprehensiveData] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const navigate = useNavigate();
  const { subscription, isDemoUser } = useSubscription();

  // Demo data for demo users
  const demoMetrics = {
    totalIncome: 5000,
    totalExpenses: 2000,
    totalInvestments: 1000,
    totalSavings: 500,
  };

  const demoChartData = {
    monthlyData: [
      { month: 'Aug', income: 4200, expenses: 2800 },
      { month: 'Sep', income: 4800, expenses: 3200 },
      { month: 'Oct', income: 5200, expenses: 2900 },
      { month: 'Nov', income: 4600, expenses: 3100 },
      { month: 'Dec', income: 5500, expenses: 3400 },
      { month: 'Jan', income: 5000, expenses: 2000 },
    ],
    expenseCategories: [
      { category: 'Marketing', amount: 800, percentage: 40 },
      { category: 'Travel', amount: 600, percentage: 30 },
      { category: 'Supplies', amount: 400, percentage: 20 },
      { category: 'Software', amount: 200, percentage: 10 },
    ],
  };

  const demoComprehensiveData = {
    allCategories: [
      { label: 'Income', value: 5000, color: '#10B981' },
      { label: 'Expenses', value: 2000, color: '#EF4444' },
      { label: 'Investments', value: 1000, color: '#3B82F6' },
      { label: 'Savings', value: 500, color: '#8B5CF6' },
    ],
    monthlyTrends: [
      { month: 'Aug', income: 4200, expenses: 2800, investments: 800, savings: 400 },
      { month: 'Sep', income: 4800, expenses: 3200, investments: 900, savings: 450 },
      { month: 'Oct', income: 5200, expenses: 2900, investments: 1100, savings: 500 },
      { month: 'Nov', income: 4600, expenses: 3100, investments: 950, savings: 480 },
      { month: 'Dec', income: 5500, expenses: 3400, investments: 1200, savings: 550 },
      { month: 'Jan', income: 5000, expenses: 2000, investments: 1000, savings: 500 },
    ],
    budgetProgress: [
      { category: 'Marketing', spent: 800, limit: 1000, percentage: 80 },
      { category: 'Travel', spent: 600, limit: 800, percentage: 75 },
      { category: 'Software', spent: 200, limit: 300, percentage: 67 },
    ]
  };

  useEffect(() => {
    const checkAuth = async () => {
      // Check if user is in demo mode
      if (isDemoUser) {
        setMetrics(demoMetrics);
        setChartData(demoChartData);
        setComprehensiveData(demoComprehensiveData);
        setLoading(false);
        return;
      }

      // Check for authenticated user
      const { user } = await getCurrentUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      
      setUser(user);
      await loadDashboardData(user.id);
      setLoading(false);
    };

    checkAuth();
  }, [navigate, isDemoUser]);

  const loadDashboardData = async (userId: string) => {
    try {
      // Load all financial data
      const [incomeResult, expensesResult, investmentsResult, savingsResult, budgetsResult] = await Promise.all([
        getIncome(userId),
        getExpenses(userId),
        getInvestments(userId),
        getSavingsGoals(userId),
        getBudgets(userId)
      ]);

      // Calculate totals
      const totalIncome = incomeResult.data?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      const totalExpenses = expensesResult.data?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      const totalInvestments = investmentsResult.data?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      const totalSavings = savingsResult.data?.reduce((sum, item) => sum + Number(item.current_amount), 0) || 0;

      setMetrics({
        totalIncome,
        totalExpenses,
        totalInvestments,
        totalSavings,
      });

      // Load chart data
      const [monthlyResult, categoryResult] = await Promise.all([
        getMonthlyData(userId),
        getExpensesByCategory(userId)
      ]);

      // Process monthly data
      const monthlyData = processMonthlyData(monthlyResult.incomeData, monthlyResult.expenseData);
      
      // Process category data
      const expenseCategories = processCategoryData(categoryResult.data);

      setChartData({
        monthlyData,
        expenseCategories,
      });

      // Create comprehensive data for new charts
      const comprehensiveData = {
        allCategories: [
          { label: 'Income', value: totalIncome, color: '#10B981' },
          { label: 'Expenses', value: totalExpenses, color: '#EF4444' },
          { label: 'Investments', value: totalInvestments, color: '#3B82F6' },
          { label: 'Savings', value: totalSavings, color: '#8B5CF6' },
        ],
        monthlyTrends: monthlyData.map(month => ({
          ...month,
          investments: investmentsResult.data?.filter(inv => 
            inv.date.startsWith(new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0'))
          ).reduce((sum, inv) => sum + Number(inv.amount), 0) || 0,
          savings: savingsResult.data?.reduce((sum, goal) => sum + Number(goal.current_amount), 0) || 0
        })),
        budgetProgress: budgetsResult.data?.map(budget => {
          const spent = expensesResult.data?.filter(exp => exp.category === budget.category)
            .reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
          return {
            category: budget.category,
            spent,
            limit: Number(budget.budget_limit),
            percentage: Math.round((spent / Number(budget.budget_limit)) * 100)
          };
        }) || []
      };

      setComprehensiveData(comprehensiveData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const processMonthlyData = (incomeData: any[], expenseData: any[]) => {
    const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
    const monthlyTotals = months.map(month => {
      const monthIndex = new Date().getMonth() - (months.length - 1 - months.indexOf(month));
      const targetDate = new Date();
      targetDate.setMonth(monthIndex);
      const monthStr = targetDate.toISOString().slice(0, 7);

      const income = incomeData?.filter(item => item.date.startsWith(monthStr))
        .reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      
      const expenses = expenseData?.filter(item => item.date.startsWith(monthStr))
        .reduce((sum, item) => sum + Number(item.amount), 0) || 0;

      return { month, income, expenses };
    });

    return monthlyTotals;
  };

  const processCategoryData = (expenseData: any[]) => {
    if (!expenseData || expenseData.length === 0) return [];

    const categoryTotals = expenseData.reduce((acc, expense) => {
      const category = expense.category;
      acc[category] = (acc[category] || 0) + Number(expense.amount);
      return acc;
    }, {});

    const total = Object.values(categoryTotals).reduce((sum: number, amount: any) => sum + amount, 0);

    return Object.entries(categoryTotals).map(([category, amount]: [string, any]) => ({
      category,
      amount,
      percentage: Math.round((amount / total) * 100)
    }));
  };

  const handleQuickActionSuccess = (message: string) => {
    setToast({ message, type: 'success' });
    // Reload dashboard data
    if (user) {
      loadDashboardData(user.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />
        
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Demo Banner */}
          {isDemoUser && <DemoBanner />}

          {/* Subscription Banner */}
          {!isDemoUser && <SubscriptionBanner subscription={subscription} />}

          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {isDemoUser ? 'Demo User' : user?.email?.split('@')[0] || 'User'}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isDemoUser 
                ? "You're viewing the demo version. Sign up to start tracking your finances."
                : "Here's an overview of your financial activity"
              }
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Income"
              amount={metrics.totalIncome}
              icon={DollarSign}
              color="bg-gradient-to-br from-green-500 to-green-600"
            />
            <MetricCard
              title="Total Expenses"
              amount={metrics.totalExpenses}
              icon={CreditCard}
              color="bg-gradient-to-br from-red-500 to-red-600"
            />
            <MetricCard
              title="Total Investments"
              amount={metrics.totalInvestments}
              icon={TrendingUp}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <MetricCard
              title="Total Savings"
              amount={metrics.totalSavings}
              icon={Target}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
            />
          </div>

          {/* Comprehensive Financial Charts */}
          {comprehensiveData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Overall Financial Distribution Pie Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
                    <PieChart className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Financial Overview
                  </h3>
                </div>
                <div className="flex justify-center">
                  <PieChartComponent data={comprehensiveData.allCategories} size={280} />
                </div>
              </div>

              {/* Monthly Trends for All Categories */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Monthly Financial Trends
                  </h3>
                </div>
                <div className="space-y-4">
                  {comprehensiveData.monthlyTrends.map((month: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {month.month}
                        </span>
                        <div className="flex gap-2 text-xs">
                          <span className="text-green-600 dark:text-green-400">I: ${month.income}</span>
                          <span className="text-red-600 dark:text-red-400">E: ${month.expenses}</span>
                          <span className="text-blue-600 dark:text-blue-400">Inv: ${month.investments || 0}</span>
                          <span className="text-purple-600 dark:text-purple-400">S: ${month.savings || 0}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 h-4">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-600 rounded-l"
                          style={{ width: `${(month.income / 6000) * 100}%` }}
                          title={`Income: $${month.income}`}
                        />
                        <div 
                          className="bg-gradient-to-r from-red-500 to-red-600"
                          style={{ width: `${(month.expenses / 6000) * 100}%` }}
                          title={`Expenses: $${month.expenses}`}
                        />
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600"
                          style={{ width: `${((month.investments || 0) / 6000) * 100}%` }}
                          title={`Investments: $${month.investments || 0}`}
                        />
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-r"
                          style={{ width: `${((month.savings || 0) / 6000) * 100}%` }}
                          title={`Savings: $${month.savings || 0}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-600 rounded"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Income</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Expenses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Investments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Savings</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Budget Progress Chart */}
          {comprehensiveData?.budgetProgress && comprehensiveData.budgetProgress.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Budget Progress Overview
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {comprehensiveData.budgetProgress.map((budget: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {budget.category}
                      </span>
                      <span className={`text-sm font-bold ${
                        budget.percentage > 80 ? 'text-red-600 dark:text-red-400' : 
                        budget.percentage > 60 ? 'text-yellow-600 dark:text-yellow-400' : 
                        'text-green-600 dark:text-green-400'
                      }`}>
                        {budget.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-lg h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-lg transition-all duration-1000 ease-out ${
                          budget.percentage > 80 ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                          budget.percentage > 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                          'bg-gradient-to-r from-green-500 to-green-600'
                        }`}
                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>${budget.spent} spent</span>
                      <span>${budget.limit} limit</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mb-8">
            <QuickActions 
              isDemoUser={isDemoUser} 
              onSuccess={handleQuickActionSuccess}
            />
          </div>

          {/* AI Insights and Financial Health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <AIInsights />
            <FinancialHealth 
              totalIncome={metrics.totalIncome} 
              totalExpenses={metrics.totalExpenses} 
            />
          </div>

          {/* Recent Transactions */}
          <div className="mb-8">
            <RecentTransactions 
              isDemoUser={isDemoUser}
              onExportSuccess={(message) => setToast({ message, type: 'success' })}
            />
          </div>

          {/* Original Charts */}
          <div className="mb-8">
            <Charts 
              isDemoUser={isDemoUser}
              chartData={chartData}
            />
          </div>
        </main>

        <Footer />
      </div>

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