import React, { useState, useMemo, useRef } from 'react';
import { Expense, Customer } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export const ExpenseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id'> | Expense) => void;
  onDelete?: (expenseId: string) => void;
  expense: Expense | null;
  customers: Customer[];
  initialData?: Partial<Omit<Expense, 'id'>>;
}> = ({ isOpen, onClose, onSave, onDelete, expense, customers, initialData }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [isBillable, setIsBillable] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>('unpaid');
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      const data = expense || initialData;
      setDescription(data?.description || '');
      setAmount(data?.amount || '');
      setDate(data?.date || new Date().toISOString().split('T')[0]);
      setCategory(data?.category || EXPENSE_CATEGORIES[0]);
      setIsBillable(!!data?.customer_id);
      setCustomerId(data?.customer_id || '');
      setReceiptImage(data?.receipt_image);

      if (data && 'status' in data && (data.status === 'paid' || data.status === 'unpaid')) {
        setPaymentStatus(data.status);
      } else {
        setPaymentStatus('unpaid');
      }
    }
  }, [isOpen, expense, initialData]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!description.trim() || amount === '') return;
    const finalCustomerId = isBillable ? customerId : undefined;

    let status: Expense['status'];
    if (finalCustomerId) {
      status = expense?.status === 'billed' ? 'billed' : 'unbilled';
    } else {
      status = paymentStatus;
    }

    onSave({
      ...(expense || {}),
      description: description.trim(),
      amount: Number(amount),
      date,
      category,
      customer_id: finalCustomerId,
      status: status,
      receipt_image: receiptImage,
    } as Omit<Expense, 'id'> | Expense);
    onClose();
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setReceiptImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">{expense ? 'Edit Expense' : 'Add Expense'}</h2>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="Amount"
                className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isBillable"
                checked={isBillable}
                onChange={(e) => setIsBillable(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="isBillable" className="font-medium">
                This is a billable expense
              </label>
            </div>
            {isBillable ? (
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
              >
                <option value="">Select a customer to bill...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as 'paid' | 'unpaid')}
                  className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                Receipt
              </label>
              {receiptImage ? (
                <div className="flex items-center gap-2">
                  <img
                    src={receiptImage}
                    alt="Receipt preview"
                    className="h-16 w-16 object-cover rounded-md"
                  />
                  <button
                    onClick={() => setReceiptImage(undefined)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 border-2 border-dashed rounded-md text-slate-500 hover:border-primary-500 hover:text-primary-600"
                >
                  Click to upload a receipt
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleReceiptUpload}
                className="hidden"
                accept="image/*"
              />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 dark:bg-zinc-900/50 flex justify-between rounded-b-xl">
          <div>
            {expense && onDelete && (
              <button
                onClick={() => onDelete(expense.id)}
                className="px-4 py-2 rounded-md font-semibold text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md font-semibold hover:bg-slate-200 dark:hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-md font-semibold bg-primary-600 text-white hover:bg-primary-700"
            >
              Save Expense
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PieChart: React.FC<{ data: { name: string; value: number }[] }> = ({ data }) => {
  const colors = [
    '#3b82f6',
    '#16a34a',
    '#f97316',
    '#8b5cf6',
    '#f43f5e',
    '#64748b',
    '#0ea5e9',
    '#eab308',
  ];
  // FIX: Explicitly cast item.value to Number to ensure all arithmetic operations are performed on numbers, preventing potential type errors.
  const total = data.reduce((sum, item) => sum + Number(item.value), 0);
  if (total === 0)
    return (
      <div className="flex items-center justify-center h-full text-slate-400">No expense data</div>
    );

  let cumulative = 0;
  const segments = data.map((item, index) => {
    const start = cumulative;
    // FIX: Explicitly cast item.value to Number to ensure all arithmetic operations are performed on numbers, preventing potential type errors.
    const end = cumulative + Number(item.value) / total;
    cumulative = end;

    const startX = Math.cos(2 * Math.PI * start);
    const startY = Math.sin(2 * Math.PI * start);
    const endX = Math.cos(2 * Math.PI * end);
    const endY = Math.sin(2 * Math.PI * end);
    const largeArc = end - start > 0.5 ? 1 : 0;

    return {
      path: `M ${startX} ${startY} A 1 1 0 ${largeArc} 1 ${endX} ${endY} L 0 0 Z`,
      color: colors[index % colors.length],
    };
  });

  return (
    <svg viewBox="-1 -1 2 2" className="w-full h-full transform -rotate-90">
      {segments.map((seg, i) => (
        <path key={i} d={seg.path} fill={seg.color} />
      ))}
    </svg>
  );
};

interface BillsAndExpensesProps {
  expenses: Expense[];
  customers: Customer[];
  openExpenseModal: (initialData?: Partial<Omit<Expense, 'id'>>, expense?: Expense | null) => void;
}

const BillsAndExpenses: React.FC<BillsAndExpensesProps> = ({
  expenses,
  customers,
  openExpenseModal,
}) => {
  const stats = useMemo(() => {
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    const spentThisMonth = expenses
      .filter((e) => {
        const date = new Date(e.date);
        return (
          !e.customer_id &&
          e.status === 'paid' &&
          date.getMonth() === thisMonth &&
          date.getFullYear() === thisYear
        );
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const unbilledAmount = expenses
      .filter((e) => e.status === 'unbilled')
      .reduce((sum, e) => sum + e.amount, 0);

    const unpaidAmount = expenses
      .filter((e) => !e.customer_id && e.status === 'unpaid')
      .reduce((sum, e) => sum + e.amount, 0);

    const categoryData = expenses
      .filter((e) => e.status === 'paid')
      .reduce(
        (acc, e) => {
          acc[e.category] = (acc[e.category] || 0) + e.amount;
          return acc;
        },
        {} as Record<string, number>
      );

    const pieChartData = Object.entries(categoryData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { spentThisMonth, unbilledAmount, unpaidAmount, pieChartData };
  }, [expenses]);

  const handleAdd = () => {
    openExpenseModal();
  };

  const handleEdit = (expense: Expense) => {
    openExpenseModal(undefined, expense);
  };

  const sortedExpenses = useMemo(
    () => [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [expenses]
  );

  const getStatusBadge = (status: Expense['status']) => {
    switch (status) {
      case 'billed': // yellow
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
            Billed
          </span>
        );
      case 'unbilled': // blue
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
            Unbilled
          </span>
        );
      case 'paid': // green
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
            Paid
          </span>
        );
      case 'unpaid': // red
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
            Unpaid
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-end">
        <button
          onClick={handleAdd}
          className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-primary-700 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Add Expense</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-slate-800 dark:text-zinc-100">Spent this Month</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-zinc-50 mt-2">
              {formatCurrency(stats.spentThisMonth)}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              From paid internal expenses
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-slate-800 dark:text-zinc-100">Unpaid Expenses</h3>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
              {formatCurrency(stats.unpaidAmount)}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Internal costs to be paid
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-slate-800 dark:text-zinc-100">Total Unbilled</h3>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">
              {formatCurrency(stats.unbilledAmount)}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Billable costs to invoice
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-zinc-100 mb-2">
            Spending by Category
          </h3>
          <div className="h-40 flex items-center gap-4">
            <div className="w-40 h-40">
              <PieChart data={stats.pieChartData} />
            </div>
            <div className="text-xs space-y-1 overflow-y-auto max-h-40">
              {stats.pieChartData.slice(0, 6).map((item, i) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: [
                        '#3b82f6',
                        '#16a34a',
                        '#f97316',
                        '#8b5cf6',
                        '#f43f5e',
                        '#64748b',
                      ][i % 6],
                    }}
                  ></div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-slate-500 dark:text-zinc-400">
                    {formatCurrency(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-zinc-100">
          All Expenses
        </h2>
        <table className="w-full text-left min-w-[600px]">
          <thead className="text-xs text-slate-500 dark:text-zinc-400 uppercase border-b border-slate-200 dark:border-zinc-800">
            <tr>
              <th className="py-3 pr-3">Description</th>
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3">Customer</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 pl-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {sortedExpenses.map((exp) => {
              const customer = customers.find((c) => c.id === exp.customer_id);
              return (
                <tr
                  key={exp.id}
                  onClick={() => handleEdit(exp)}
                  className="border-b border-slate-200 dark:border-zinc-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer"
                >
                  <td className="py-3 pr-3 font-medium">{exp.description}</td>
                  <td className="py-3 px-3 text-slate-500 dark:text-zinc-400">{exp.date}</td>
                  <td className="py-3 px-3 text-slate-500 dark:text-zinc-400">
                    {customer?.name || 'Internal'}
                  </td>
                  <td className="py-3 px-3">{getStatusBadge(exp.status)}</td>
                  <td className="py-3 pl-3 text-right font-semibold">
                    {formatCurrency(exp.amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BillsAndExpenses;
