import { useMemo } from 'react';

export const useDemoData = () => {
  const demoMetrics = useMemo(() => ({
    totalIncome: 5000,
    totalExpenses: 2000,
    totalInvestments: 1000,
    totalSavings: 500,
  }), []);

  const demoTransactions = useMemo(() => [
    {
      id: 'demo-1',
      type: 'Income' as const,
      amount: 2500,
      category: 'Freelance Work',
      date: '2025-01-15',
      notes: 'Website development project',
      created_at: '2025-01-15T10:00:00Z',
    },
    {
      id: 'demo-2',
      type: 'Expense' as const,
      amount: 500,
      category: 'Marketing',
      date: '2025-01-14',
      notes: 'Google Ads campaign',
      created_at: '2025-01-14T14:30:00Z',
    },
    {
      id: 'demo-3',
      type: 'Investment' as const,
      amount: 1000,
      category: 'Stocks',
      date: '2025-01-13',
      notes: 'Tech stock portfolio',
      created_at: '2025-01-13T09:15:00Z',
    },
    {
      id: 'demo-4',
      type: 'Savings' as const,
      amount: 500,
      category: 'Emergency Fund',
      date: '2025-01-12',
      notes: 'Monthly savings goal',
      created_at: '2025-01-12T16:45:00Z',
    },
    {
      id: 'demo-5',
      type: 'Income' as const,
      amount: 1500,
      category: 'Consulting',
      date: '2025-01-10',
      notes: 'Strategy consultation',
      created_at: '2025-01-10T11:20:00Z',
    },
  ], []);

  const demoChartData = useMemo(() => ({
    monthlyData: [
      { month: 'Aug', income: 4200, expenses: 2800 },
      { month: 'Sep', income: 4800, expenses: 3200 },
      { month: 'Oct', income: 5200, expenses: 2900 },
      { month: 'Nov', income: 4600, expenses: 3100 },
      { month: 'Dec', income: 5500, expenses: 3400 },
      { month: 'Jan', income: 5000, expenses: 2000 },
    ],
    expenseCategories: [
      { category: 'Marketing', amount: 800, color: 'bg-blue-500' },
      { category: 'Travel', amount: 600, color: 'bg-green-500' },
      { category: 'Supplies', amount: 400, color: 'bg-purple-500' },
      { category: 'Software', amount: 200, color: 'bg-orange-500' },
    ],
  }), []);

  return {
    demoMetrics,
    demoTransactions,
    demoChartData,
  };
};