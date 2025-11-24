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
  onCreateInvoice: () => void;
  onSendEmail: () => void;
  onCreateMeeting: () => void;
  onInviteUser: () => void;
}> = ({ documents, tasks, userName, onCreateInvoice, onSendEmail, onCreateMeeting, onInviteUser }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const overdueInvoices = documents.filter(d => d.type === DocumentType.Invoice && d.status === DocumentStatus.Overdue).length;
  const tasksDueToday = tasks.filter(t => {
    if (!t.due_date || t.completed) return false;
    const today = new Date().toISOString().split('T')[0];
    return t.due_date === today;
  }).length;

  return (
    <div
      className="relative h-48 z-10"
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-600 to-primary-800 text-white p-6 rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-out ${isExpanded ? 'w-[120%] h-[140%] z-50 shadow-2xl' : ''}`}>
        <div className="relative z-10 flex flex-col h-full">
          <div>
            <h2 className="text-2xl font-bold mb-2">Good morning, {userName}</h2>
            <p className={`text-primary-100 mb-6 transition-all ${isExpanded ? 'mb-4' : ''}`}>Here's what's happening today:</p>
          </div>

          <div className={`flex gap-6 transition-opacity duration-200 ${isExpanded ? 'opacity-0 hidden' : 'opacity-100'}`}>
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

          {/* Expanded Actions */}
          <div className={`grid grid-cols-2 gap-3 mt-auto transition-opacity duration-300 delay-75 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <button onClick={onCreateInvoice} className="flex items-center gap-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-left">
              <div className="p-1.5 bg-white/20 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <span className="text-sm font-medium">Create Invoice</span>
            </button>
            <button onClick={onSendEmail} className="flex items-center gap-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-left">
              <div className="p-1.5 bg-white/20 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <span className="text-sm font-medium">Send Email</span>
            </button>
            <button onClick={onCreateMeeting} className="flex items-center gap-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-left">
              <div className="p-1.5 bg-white/20 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <span className="text-sm font-medium">Schedule Meeting</span>
            </button>
            <button onClick={onInviteUser} className="flex items-center gap-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-left">
              <div className="p-1.5 bg-white/20 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              </div>
              <span className="text-sm font-medium">Invite User</span>
            </button>
          </div>
        </div>

        {/* Trigger Icon */}
        <div
          className={`absolute top-4 right-4 z-[60] transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-100'}`}
          onMouseEnter={() => setIsExpanded(true)}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 backdrop-blur-md cursor-pointer transition-all duration-700 ease-out bg-gradient-to-br from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 ${isExpanded ? 'rotate-180 scale-110' : 'hover:rotate-180 hover:scale-110'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>
        </div>

        {/* Decorative background circles */}
        <div className={`absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl transition-transform duration-500 ${isExpanded ? 'scale-150' : ''}`}></div>
        <div className={`absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-white/10 rounded-full blur-2xl transition-transform duration-500 ${isExpanded ? 'scale-150' : ''}`}></div>
      </div>
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
  onCreateInvoice: () => void;
  onSendEmail: () => void;
  onCreateMeeting: () => void;
  onInviteUser: () => void;
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
  onCreateInvoice,
  onSendEmail,
  onCreateMeeting,
  onInviteUser,
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
        <div className="lg:col-span-1 relative z-20">
          <MorningBriefing
            documents={documents}
            tasks={tasks}
            userName="Saxon"
            onCreateInvoice={onCreateInvoice}
            onSendEmail={onSendEmail}
            onCreateMeeting={onCreateMeeting}
            onInviteUser={onInviteUser}
          />
        </div>
        <div className="lg:col-span-2 relative z-10">
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