import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, PieChart, Download, Calendar, TrendingUp } from 'lucide-react';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { Footer } from '../components/Footer';
import { Toast } from '../components/Toast';
import { getIncome, getExpenses, getInvestments, getSavingsGoals, getCurrentUser, exportToCSV } from '../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: { finalY: number };
  }
}

export const Reports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(() => localStorage.getItem('isDemoUser') === 'true');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [reportData, setReportData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalInvestments: 0,
    totalSavings: 0,
    monthlyData: [] as any[],
    expenseCategories: [] as any[],
  });
  const reportRef = useRef<HTMLDivElement>(null);

  const mockReportData = {
    totalIncome: 12500,
    totalExpenses: 6800,
    totalInvestments: 4300,
    totalSavings: 8700,
    monthlyData: [
      { month: 'Aug', income: 4200, expenses: 2800 },
      { month: 'Sep', income: 4800, expenses: 3200 },
      { month: 'Oct', income: 5200, expenses: 2900 },
      { month: 'Nov', income: 4600, expenses: 3100 },
      { month: 'Dec', income: 5500, expenses: 3400 },
      { month: 'Jan', income: 5000, expenses: 2000 },
    ],
    expenseCategories: [
      { category: 'Marketing', amount: 2800, percentage: 41 },
      { category: 'Software', amount: 2000, percentage: 29 },
      { category: 'Travel', amount: 1200, percentage: 18 },
      { category: 'Supplies', amount: 800, percentage: 12 },
    ],
  };

  useEffect(() => {
    const loadReportData = async () => {
      if (isDemoUser) {
        setReportData(mockReportData);
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
            getSavingsGoals(user.id),
          ]);

          const totalIncome = incomeResult.data?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
          const totalExpenses = expensesResult.data?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
          const totalInvestments = investmentsResult.data?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
          const totalSavings = savingsResult.data?.reduce((sum, item) => sum + Number(item.current_amount), 0) || 0;

          setReportData({
            totalIncome,
            totalExpenses,
            totalInvestments,
            totalSavings,
            monthlyData: generateMonthlyData(incomeResult.data ?? [], expensesResult.data ?? []),
            expenseCategories: generateExpenseCategories(expensesResult.data ?? []),
          });
        }
      } catch (error) {
        console.error('Error loading report data:', error);
        setToast({ message: 'Failed to load report data', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, [isDemoUser]);

  const handleExportPDF = async () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Header with logo and title
    const logo = await new Promise<string>(resolve => {
      const img = new window.Image();
      img.src = '/logo.png';
      img.onload = () => {
        // Create a canvas to get the data URL
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
    });
    doc.addImage(logo, 'PNG', margin, 20, 40, 40);
    doc.setFontSize(22);
    doc.setTextColor('#2563eb'); // blue-600
    doc.text('GrowEasy Tracker - Financial Report', margin + 50, 45);

    // Footer with page number and date
    doc.setFontSize(10);
    doc.setTextColor('#6b7280'); // gray-500
    doc.text(`Page 1 | Generated: ${today}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 20, { align: 'right' });

    // Section: Summary
    let y = 80;
    doc.setFont(doc.getFont().fontName, 'bold');
    doc.setTextColor('#111827'); // gray-900
    doc.text('Summary', margin, y);
    y += 20;
    doc.setFont(doc.getFont().fontName, 'normal');
    doc.text(`Net Worth: $${isNaN(reportData.totalIncome - reportData.totalExpenses + reportData.totalInvestments + reportData.totalSavings) ? 0 : (reportData.totalIncome - reportData.totalExpenses + reportData.totalInvestments + reportData.totalSavings).toLocaleString()}`, margin, y);
    y += 18;
    doc.text(`Savings Rate: ${Math.round(((reportData.totalIncome - reportData.totalExpenses) / reportData.totalIncome) * 100)}%`, margin, y);
    y += 18;
    doc.text(`Monthly Avg Income: $${Math.round(reportData.totalIncome / 6).toLocaleString()}`, margin, y);
    y += 18;
    doc.text(`Monthly Avg Expenses: $${Math.round(reportData.totalExpenses / 6).toLocaleString()}`, margin, y);

    // Section: Charts Side by Side
    y += 30;
    const chartHeight = 120;
    const chartWidth = (pageWidth - 3 * margin) / 2;

    doc.setFont('Inter', 'bold');
    doc.setFontSize(14);
    doc.setTextColor('#2563eb');
    doc.text('Key Financial Charts', margin, y);

    const chartsY = y + 10;
    const barCanvas = document.querySelector('canvas[aria-label="Income vs Expenses Bar Chart"]') as HTMLCanvasElement;
    const pieCanvas = document.querySelector('canvas[aria-label="Expense Breakdown Pie Chart"]') as HTMLCanvasElement;

    if (barCanvas && pieCanvas) {
      const barImg = barCanvas.toDataURL('image/png', 1.0);
      const pieImg = pieCanvas.toDataURL('image/png', 1.0);

      // Bar chart on the left
      doc.addImage(barImg, 'PNG', margin, chartsY, chartWidth, chartHeight);
      // Pie chart on the right
      doc.addImage(pieImg, 'PNG', margin + chartWidth + margin, chartsY, chartWidth, chartHeight);

      y = chartsY + chartHeight + 20;
    } else if (barCanvas) {
      const barImg = barCanvas.toDataURL('image/png', 1.0);
      doc.addImage(barImg, 'PNG', margin, chartsY, pageWidth - 2 * margin, chartHeight);
      y = chartsY + chartHeight + 20;
    } else if (pieCanvas) {
      const pieImg = pieCanvas.toDataURL('image/png', 1.0);
      doc.addImage(pieImg, 'PNG', margin, chartsY, pageWidth - 2 * margin, chartHeight);
      y = chartsY + chartHeight + 20;
    }

    // Now draw "Monthly Trend" heading below the charts
    doc.setFont('Inter', 'bold');
    doc.setFontSize(14);
    doc.setTextColor('#2563eb');
    doc.text('Monthly Trend', margin, y);
    autoTable(doc, {
      startY: y + 10,
      head: [['Month', 'Income', 'Expenses']],
      body: reportData.monthlyData.map((m: any, i: number) => [
        m.month,
        `$${m.income.toLocaleString()}`,
        `$${m.expenses.toLocaleString()}`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, halign: 'center' },
      bodyStyles: { halign: 'center', fontSize: 11 },
      alternateRowStyles: { fillColor: [243, 244, 246] },
      styles: { cellPadding: 6, font: 'Inter' },
      margin: { left: margin, right: margin },
    });
    y = doc.lastAutoTable.finalY + 20;

    // Section: Expense Breakdown Table
    doc.setFont(doc.getFont().fontName, 'bold');
    doc.setFontSize(14);
    doc.setTextColor('#a21caf');
    doc.text('Expense Breakdown', margin, y);
    autoTable(doc, {
      startY: y + 10,
      head: [['Category', 'Amount', 'Percentage']],
      body: reportData.expenseCategories.map((c: any, i: number) => [
        c.category,
        `$${c.amount.toLocaleString()}`,
        `${c.percentage}%`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [162, 28, 175], textColor: 255, halign: 'center' },
      bodyStyles: { halign: 'center', fontSize: 11 },
      alternateRowStyles: { fillColor: [243, 244, 246] },
      styles: { cellPadding: 6, font: 'Inter' },
      margin: { left: margin, right: margin },
    });
    y = doc.lastAutoTable.finalY + 20;

    // Section: Financial Health Summary
    doc.setFont(doc.getFont().fontName, 'bold');
    doc.setFontSize(14);
    doc.setTextColor('#111827');
    doc.text('Financial Health Summary', margin, y);
    doc.setFont(doc.getFont().fontName, 'normal');
    doc.setFontSize(12);
    doc.setTextColor('#111827');
    y += 18;
    doc.text(
      `Savings Rate: ${Math.round(((reportData.totalIncome - reportData.totalExpenses) / reportData.totalIncome) * 100) >= 20 ? 'Excellent' : Math.round(((reportData.totalIncome - reportData.totalExpenses) / reportData.totalIncome) * 100) >= 10 ? 'Good' : 'Needs Improvement'}`,
      margin,
      y
    );
    y += 16;
    doc.text(
      `Investment Portfolio: ${reportData.totalInvestments > reportData.totalExpenses ? 'Strong' : 'Growing'}`,
      margin,
      y
    );
    y += 16;
    doc.text(
      `Net Worth: ${reportData.totalIncome - reportData.totalExpenses + reportData.totalInvestments + reportData.totalSavings > 0 ? 'Positive' : 'Building'}`,
      margin,
      y
    );

    doc.save(`financial_report_${today.replace(/ /g, '_')}.pdf`);
  };

  const handleExportCSV = () => {
    try {
    const summaryData = [
      { Metric: 'Total Income', Value: reportData.totalIncome },
      { Metric: 'Total Expenses', Value: reportData.totalExpenses },
      { Metric: 'Total Investments', Value: reportData.totalInvestments },
      { Metric: 'Total Savings', Value: reportData.totalSavings },
      { Metric: 'Net Worth', Value: reportData.totalIncome - reportData.totalExpenses + reportData.totalInvestments + reportData.totalSavings },
        { Metric: 'Savings Rate (%)', Value: reportData.totalIncome > 0 ? Math.round(((reportData.totalIncome - reportData.totalExpenses) / reportData.totalIncome) * 100) : 0 },
    ];

    const today = new Date().toISOString().split('T')[0];
    exportToCSV(summaryData, `financial_report_${today}.csv`);
      setToast({ message: 'CSV exported successfully!', type: 'success' });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setToast({ message: 'Failed to export CSV', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading reports...</p>
        </div>
      </div>
    );
  }

  const netWorth = reportData.totalIncome - reportData.totalExpenses + reportData.totalInvestments + reportData.totalSavings;
  const savingsRate = reportData.totalIncome > 0 ? Math.round(((reportData.totalIncome - reportData.totalExpenses) / reportData.totalIncome) * 100) : 0;

  const barData = {
    labels: reportData.monthlyData.map((m: any) => m.month),
    datasets: [
      {
        label: 'Income',
        data: reportData.monthlyData.map((m: any) => m.income),
        backgroundColor: 'rgba(59,130,246,0.7)', // Tailwind blue-500
        borderRadius: 8,
      },
      {
        label: 'Expenses',
        data: reportData.monthlyData.map((m: any) => m.expenses),
        backgroundColor: 'rgba(16,185,129,0.7)', // Tailwind teal-500
        borderRadius: 8,
      },
    ],
  };

  const pieData = {
    labels: reportData.expenseCategories.map((c: any) => c.category),
    datasets: [
      {
        data: reportData.expenseCategories.map((c: any) => c.amount),
        backgroundColor: [
          '#60A5FA', // blue-400
          '#FBBF24', // yellow-400
          '#34D399', // green-400
          '#F87171', // red-400
          '#A78BFA', // purple-400
          '#F472B6', // pink-400
          '#FCD34D', // yellow-300
          '#6EE7B7', // teal-300
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />
        
        <main className="max-w-7xl mx-auto px-6 py-8" ref={reportRef}>
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Financial Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive analysis of your financial performance
            </p>
          </div>

          {/* Action Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Report Period: Last 6 Months
                </span>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleExportPDF}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
                <button 
                  onClick={handleExportCSV}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Worth</h3>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${netWorth.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Total assets minus liabilities
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Savings Rate</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {savingsRate}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Income saved vs spent
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                  <PieChart className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Avg Income</h3>
              </div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                ${Math.round(reportData.totalIncome / 6).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Average over 6 months
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Avg Expenses</h3>
              </div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                ${Math.round(reportData.totalExpenses / 6).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Average over 6 months
              </p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Income vs Expenses Bar Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8" style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white" id="income-expenses-bar-label">
                Income vs Expenses (Last 6 Months)
                </h3>
              <div className="h-64">
                <Bar
                  data={barData}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: 'top' }, title: { display: false } },
                    scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
                    maintainAspectRatio: false,
                  }}
                  aria-label="Income vs Expenses Bar Chart"
                  role="img"
                />
              </div>
            </div>

            {/* Expense Breakdown Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8" style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white" id="expense-pie-label">
                  Expense Breakdown
                </h3>
              <div className="h-64">
                <Pie
                  data={pieData}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: 'right' }, title: { display: false } },
                    maintainAspectRatio: false,
                  }}
                  aria-label="Expense Breakdown Pie Chart"
                  role="img"
                />
              </div>
            </div>
          </div>

          {/* Financial Health Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Financial Health Summary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {savingsRate >= 20 ? 'Excellent' : savingsRate >= 10 ? 'Good' : 'Needs Improvement'}
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">Savings Rate</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {savingsRate >= 20 ? "You're saving well!" : savingsRate >= 10 ? 'Keep it up!' : 'Try to save more'}
                </p>
              </div>

              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {reportData.totalInvestments > reportData.totalExpenses ? 'Strong' : 'Growing'}
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Investment Portfolio</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  ${reportData.totalInvestments.toLocaleString()} invested
                </p>
              </div>

              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {netWorth > 0 ? 'Positive' : 'Building'}
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300">Net Worth</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  {netWorth > 0 ? 'Great progress!' : 'Keep building!'}
                </p>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

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

function generateMonthlyData(
  incomeData: { date: string; amount: number }[] = [],
  expensesData: { date: string; amount: number }[] = []
) {
  // Last 6 completed months (not including current month)
  const months = [];
  const now = new Date();
  for (let i = 6; i >= 1; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = d.toLocaleString('default', { month: 'short' });
    const yearMonth = d.toISOString().slice(0, 7);

    const income = incomeData
      .filter(item => item.date && item.date.startsWith(yearMonth))
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const expenses = expensesData
      .filter(item => item.date && item.date.startsWith(yearMonth))
      .reduce((sum, item) => sum + Number(item.amount), 0);

    months.push({ month: monthStr, income, expenses });
  }
  return months;
}

function generateExpenseCategories(
  expensesData: { category: string; amount: number }[] = []
) {
  const totals: Record<string, number> = {};
  let total = 0;
  expensesData.forEach(item => {
    if (!item.category) return;
    totals[item.category] = (totals[item.category] || 0) + Number(item.amount);
    total += Number(item.amount);
  });
  return Object.entries(totals).map(([category, amount]) => ({
    category,
    amount,
    percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
  }));
}