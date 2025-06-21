import React from 'react';
import { BarChart3, PieChart } from 'lucide-react';

interface ChartsProps {
  isDemoUser?: boolean;
  chartData?: any;
}

export const Charts: React.FC<ChartsProps> = ({ isDemoUser = false, chartData }) => {
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

  const data = isDemoUser ? demoChartData : (chartData || demoChartData);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Income vs Expenses
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Last 6 months trend
            </p>
          </div>
        </div>

        {data.monthlyData && data.monthlyData.length > 0 ? (
          <div className="space-y-4">
            {data.monthlyData.map((month: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {month.month}
                  </span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-600 dark:text-green-400">
                      ${month.income.toLocaleString()}
                    </span>
                    <span className="text-red-600 dark:text-red-400">
                      ${month.expenses.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 h-4">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 rounded-l"
                    style={{ width: `${(month.income / Math.max(...data.monthlyData.map((m: any) => m.income))) * 100}%` }}
                  />
                  <div 
                    className="bg-gradient-to-r from-red-500 to-red-600 rounded-r"
                    style={{ width: `${(month.expenses / Math.max(...data.monthlyData.map((m: any) => m.income))) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            
            <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-600 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Expenses</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Chart data coming soon
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Add transactions to see your financial trends
            </p>
          </div>
        )}
      </div>

      {/* Donut Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <PieChart className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Expense Categories
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Spending breakdown
            </p>
          </div>
        </div>

        {data.expenseCategories && data.expenseCategories.length > 0 ? (
          <div className="space-y-4">
            {data.expenseCategories.map((category: any, index: number) => {
              const colors = [
                'from-blue-500 to-blue-600',
                'from-purple-500 to-purple-600',
                'from-green-500 to-green-600',
                'from-orange-500 to-orange-600'
              ];
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {category.category}
                    </span>
                    <div className="flex gap-2 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {category.percentage}%
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ${category.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-lg h-3 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${colors[index % colors.length]} rounded-lg transition-all duration-1000 ease-out`}
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  ${data.expenseCategories.reduce((sum: number, cat: any) => sum + cat.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Chart data coming soon
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Add expenses to see category breakdown
            </p>
          </div>
        )}
      </div>
    </div>
  );
};