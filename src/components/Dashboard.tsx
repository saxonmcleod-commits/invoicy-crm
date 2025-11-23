import React, { useMemo } from 'react';
import {
  Document,
  DocumentStatus,
  DocumentType,
  ProductivityPage,
  ActivityLog,
  Customer,
  Expense,
  Task,
} from '../types';
import ActivityLogComponent from './ActivityLog';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

// --- Morning Briefing Component ---
const MorningBriefing: React.FC<{
  documents: Document[];
  tasks: Task[];
  userName: string;
}> = ({ documents, tasks, userName }) => {
  const overdueInvoices = documents.filter(d => d.type === DocumentType.Invoice && d.status === DocumentStatus.Overdue).length;
  const tasksDueToday = tasks.filter(t => {
    if (!t.due_date || t.completed) return false;
    const today = new Date().toISOString().split('T')[0];
    return t.due_date === today;
  }).length;

  return (
    <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
      <div className="relative z-10">
        <h2 className="text-2xl font-bold mb-2">Good morning, {userName}</h2>
        <p className="text-primary-100 mb-6">Here's what's happening today:</p>

        <div className="flex gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold">{overdueInvoices}</p>
              <p className="text-xs text-primary-200">Overdue Invoices</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold">{tasksDueToday}</p>
              <p className="text-xs text-primary-200">Tasks Due Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative background circles */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
    </div>
  );
};

// --- Financial Pulse Component ---
const FinancialPulse: React.FC<{
  documents: Document[];
  expenses: Expense[];
}> = ({ documents, expenses }) => {
  const chartData = useMemo(() => {
    const labels: string[] = [];
    const incomeData: number[] = [];
    const expenseData: number[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.toLocaleString('default', { month: 'short' });
      labels.push(month);

      // Calculate Income
      const monthlyIncome = documents
        .filter(doc => {
          if (doc.type !== DocumentType.Invoice || doc.status !== DocumentStatus.Paid) return false;
          const docDate = new Date(doc.issue_date);
          return docDate.getMonth() === d.getMonth() && docDate.getFullYear() === d.getFullYear();
        })
        .reduce((sum, doc) => sum + doc.total, 0);
      incomeData.push(monthlyIncome);

      // Calculate Expenses
      const monthlyExpenses = expenses
        .filter(exp => {
          const expDate = new Date(exp.date);
          return expDate.getMonth() === d.getMonth() && expDate.getFullYear() === d.getFullYear();
        })
        .reduce((sum, exp) => sum + exp.amount, 0);
      expenseData.push(monthlyExpenses);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          borderColor: '#10b981', // green-500
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Expenses',
          data: expenseData,
          borderColor: '#ef4444', // red-500
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true,
        }
      ]
    };
  }, [documents, expenses]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: (value: any) => {
            if (value >= 1000) return '$' + value / 1000 + 'k';
            return '$' + value;
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  const currentMonthIncome = chartData.datasets[0].data[chartData.datasets[0].data.length - 1];
  const currentMonthExpenses = chartData.datasets[1].data[chartData.datasets[1].data.length - 1];
  const cashFlow = currentMonthIncome - currentMonthExpenses;

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-zinc-100">Financial Pulse</h2>
        <div className={`text-sm font-bold px-2 py-1 rounded-full ${cashFlow >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {cashFlow >= 0 ? '+' : ''}{formatCurrency(cashFlow)} Flow
        </div>
      </div>
      <div className="flex-grow min-h-[200px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};



// --- Main Dashboard Component ---
interface DashboardProps {
  documents: Document[];
  editDocument: (doc: Document) => void;
  pages: ProductivityPage[];
  activityLogs: ActivityLog[];
  customers: Customer[];
  addActivityLog: (activity: Omit<ActivityLog, 'id' | 'created_at' | 'user_id'>) => void;
  expenses: Expense[];
  tasks: Task[];
}

const Dashboard: React.FC<DashboardProps> = ({
  documents,
  editDocument,
  pages,
  activityLogs,
  customers,
  addActivityLog,
  expenses,
  tasks,
}) => {
  // Get the most recent 15 logs for the dashboard
  const recentActivity = useMemo(() => {
    return [...activityLogs]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 15);
  }, [activityLogs]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Row: Morning Briefing & Financial Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <MorningBriefing documents={documents} tasks={tasks} userName="Saxon" />
        </div>
        <div className="lg:col-span-2">
          <FinancialPulse documents={documents} expenses={expenses} />
        </div>
      </div>

      {/* Bottom Row: Recent Activity */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-zinc-100">
          Recent Activity
        </h2>
        <ActivityLogComponent
          activityLogs={recentActivity}
          customers={customers}
          addActivityLog={addActivityLog}
          showCustomerName={true}
        />
      </div>
    </div>
  );
};

export default Dashboard;