import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {
  Customer,
  Document,
  BusinessLetter,
  ActivityLog,
  EmailTemplate,
  CompanyInfo,
} from '../types';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext'; // *** IMPORTED useAuth ***
import PreferencesModal from './PreferencesModal'; // Added import
import TagsModal from './TagsModal'; // Added import

// --- New Email Modal Component (Phase 3) ---
const EmailModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  templates: EmailTemplate[];
  companyInfo: CompanyInfo;
  addActivityLog: (activity: Omit<ActivityLog, 'id' | 'created_at' | 'user_id'>) => void;
}> = ({ isOpen, onClose, customer, templates, companyInfo, addActivityLog }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const { session } = useAuth(); // *** GET THE SESSION ***

  useEffect(() => {
    if (isOpen) {
      setSubject('');
      setBody('');
      setIsLoading(false);
      setStatusMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const replacer = (text: string) => {
    const data = { customer, company: companyInfo };
    return text.replace(
      /{{\s*(\w+)\.(\w+)\s*}}/g,
      (match, objectKey: 'customer' | 'company', propertyKey: string) => {
        if (data[objectKey] && propertyKey in data[objectKey]) {
          return (data[objectKey] as any)[propertyKey] || '';
        }
        return match;
      }
    );
  };

  const handleTemplateSelect = (templateId: string) => {
    if (templateId === '') {
      setSubject('');
      setBody('');
      return;
    }
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSubject(replacer(template.subject));
      setBody(replacer(template.body));
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      setStatusMessage('Subject and body cannot be empty.');
      return;
    }
    if (!session) {
      // *** CHECK FOR SESSION ***
      setStatusMessage('Error: Not authenticated.');
      return;
    }
    setIsLoading(true);
    setStatusMessage('Sending...');

    try {
      // ***
      // *** FIX: Call the Vercel function, not Supabase function
      // ***
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`, // *** PASS AUTH TOKEN ***
        },
        body: JSON.stringify({
          to: customer.email,
          subject: subject.trim(),
          body: body.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      addActivityLog({
        customer_id: customer.id,
        type: 'Email',
        content: `Email sent with subject: "${subject}"`,
        date: new Date().toISOString(),
        subject: subject,
      });
      setStatusMessage('Email sent successfully!');
      setTimeout(onClose, 1500);
    } catch (error: any) {
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Send Email</h2>
          <div className="space-y-4">
            <select
              onChange={(e) => handleTemplateSelect(e.target.value)}
              className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
            >
              <option value="">-- Select a template --</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={`To: ${customer.email}`}
              readOnly
              className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-slate-500"
            />
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              placeholder="Email body..."
              className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 font-mono text-sm"
            />
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 dark:bg-zinc-900/50 flex justify-between items-center rounded-b-xl">
          <p className="text-sm text-slate-500">{statusMessage}</p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-md font-semibold hover:bg-slate-200 dark:hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="px-4 py-2 rounded-md font-semibold bg-primary-600 text-white hover:bg-primary-700 disabled:bg-primary-300"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CustomerDetailProps {
  customers: Customer[];
  documents: Document[];
  businessLetters: BusinessLetter[];
  editDocument: (doc: Document) => void;
  editLetter: (letter: BusinessLetter) => void;
  updateCustomer: (customer: Customer) => void;
  addActivityLog: (activity: Omit<ActivityLog, 'id' | 'created_at' | 'user_id'>) => void;
  emailTemplates: EmailTemplate[];
  companyInfo: CompanyInfo;
  commonTags: string[];
  setCommonTags: React.Dispatch<React.SetStateAction<string[]>>;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const StatCard: React.FC<{ title: string; value: string }> = ({ title, value }) => (
  <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-lg shadow-sm">
    <p className="text-sm text-slate-500 dark:text-zinc-400">{title}</p>
    <p className="text-2xl font-bold text-slate-800 dark:text-zinc-50">{value}</p>
  </div>
);

const ActivityIcon: React.FC<{ type: ActivityLog['type'] }> = ({ type }) => {
  const iconStyles = 'w-5 h-5';
  const icons: { [key in ActivityLog['type']]: React.ReactNode } = {
    Note: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={iconStyles}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    Email: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={iconStyles}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
        />
      </svg>
    ),
    Call: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={iconStyles}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 6.75z"
        />
      </svg>
    ),
    Meeting: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={iconStyles}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 14.15v4.098a2.25 2.25 0 01-2.25 2.25H6.002a2.25 2.25 0 01-2.25-2.25v-4.098m16.5 0a2.25 2.25 0 00-2.25-2.25H6.002a2.25 2.25 0 00-2.25 2.25m16.5 0v-4.098a2.25 2.25 0 00-2.25-2.25H6.002a2.25 2.25 0 00-2.25 2.25v4.098m7.5-10.332v2.25m0 0v2.25m0-2.25h.008v.008H12v-.008z"
        />
      </svg>
    ),
    Task: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={iconStyles}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };
  return (
    <div className="absolute top-0 left-0 -ml-5 mt-1 h-10 w-10 flex items-center justify-center bg-white dark:bg-zinc-900 rounded-full border-2 border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400">
      {icons[type]}
    </div>
  );
};

// --- PreferencesModal component removed from here ---

// --- TagsModal component removed from here ---

const CustomerDetail: React.FC<CustomerDetailProps> = ({
  customers,
  documents,
  businessLetters,
  editDocument,
  editLetter,
  updateCustomer,
  addActivityLog,
  emailTemplates,
  companyInfo,
  commonTags,
  setCommonTags,
}) => {
  const { customerId } = useParams<{ customerId: string }>();
  const customer = customers.find((c) => c.id === customerId);

  const [activityType, setActivityType] = useState<ActivityLog['type']>('Note');
  const [activityContent, setActivityContent] = useState('');
  const [activitySubject, setActivitySubject] = useState('');
  const [activityLink, setActivityLink] = useState('');
  const [activityAttendees, setActivityAttendees] = useState('');

  const [isMeetingDropdownOpen, setIsMeetingDropdownOpen] = useState(false);
  const meetingDropdownRef = useRef<HTMLDivElement>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'activity' | 'preferences'>('activity');
  const [isPrefsModalOpen, setIsPrefsModalOpen] = useState(false);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);

  const financialStats = useMemo(() => {
    if (!customer) return { totalBilled: 0, totalPaid: 0, outstanding: 0 };
    const customerInvoices = documents.filter(
      (d) => d.customer?.id === customer.id && d.type === 'Invoice'
    );
    const totalBilled = customerInvoices.reduce((sum, doc) => sum + doc.total, 0);
    const totalPaid = customerInvoices
      .filter((d) => d.status === 'Paid')
      .reduce((sum, doc) => sum + doc.total, 0);
    const outstanding = totalBilled - totalPaid;
    return { totalBilled, totalPaid, outstanding };
  }, [documents, customer]);

  const groupedActivities = useMemo(() => {
    if (!customer?.activityLog) return [];

    const sorted = [...customer.activityLog].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const groups = sorted.reduce(
      (acc, activity) => {
        const dateStr = new Date(activity.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        if (!acc[dateStr]) {
          acc[dateStr] = [];
        }
        acc[dateStr].push(activity);
        return acc;
      },
      {} as Record<string, ActivityLog[]>
    );

    return Object.entries(groups);
  }, [customer?.activityLog]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        meetingDropdownRef.current &&
        !meetingDropdownRef.current.contains(event.target as Node)
      ) {
        setIsMeetingDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!customer) {
    return <Navigate to="/crm" />;
  }

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityContent.trim() || !customer) return;

    const newActivity: Omit<ActivityLog, 'id' | 'created_at' | 'user_id'> = {
      customer_id: customer.id,
      type: activityType,
      content: activityContent.trim(),
      date: new Date().toISOString(),
      ...(activitySubject.trim() && { subject: activitySubject.trim() }),
      ...(activityLink.trim() && { link: activityLink.trim() }),
      ...(activityAttendees.trim() && { attendees: activityAttendees.trim() }),
    };

    addActivityLog(newActivity);

    setActivityContent('');
    setActivitySubject('');
    setActivityLink('');
    setActivityAttendees('');
    setActivityType('Note');
  };

  const handleSavePrefs = (preferences: string[]) => {
    if (customer) {
      updateCustomer({ ...customer, preferences });
    }
    setIsPrefsModalOpen(false);
  };

  const handleSaveTags = (tags: string[]) => {
    if (customer) {
      updateCustomer({ ...customer, tags });
    }
    setIsTagsModalOpen(false);
  };

  const customerDocuments = documents.filter(
    (d) => d.customer?.id === customerId && !d.archived
  );
  const customerLetters = businessLetters.filter(
    (l) => l.customer?.id === customerId && !l.archived
  );

  const HistoryItem: React.FC<{ item: Document | BusinessLetter; onEdit: () => void }> = ({
    item,
    onEdit,
  }) => (
    <button
      onClick={onEdit}
      className="w-full text-left flex justify-between items-center p-4 bg-slate-50 dark:bg-zinc-950 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition group"
    >
      <div>
        <p className="font-semibold text-primary-600 dark:text-primary-400 group-hover:underline">
          {item.doc_number}
        </p>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          {'type' in item && item.type === 'BusinessLetter'
            ? `Subject: ${item.subject}`
            : `Issued: ${item.issue_date}`}
        </p>
      </div>
      {'total' in item && (
        <div className="text-right">
          <p className="font-bold text-slate-700 dark:text-zinc-200">
            ${item.total.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-400 capitalize">{item.status}</p>
        </div>
      )}
    </button>
  );

  return (
    <div className="space-y-8 h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-zinc-50">{customer.name}</h1>
            <p className="text-slate-500 dark:text-zinc-400">{customer.email}</p>
            <div className="mt-4">
              <button
                onClick={() => setIsTagsModalOpen(true)}
                className="flex flex-wrap gap-2 items-center cursor-pointer min-h-[26px] p-1 -m-1 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                {customer.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300"
                  >
                    {tag}
                  </span>
                ))}
                {(!customer.tags || customer.tags.length === 0) && (
                  <span className="text-sm text-slate-500 dark:text-zinc-400 hover:underline">
                    Add tags...
                  </span>
                )}
              </button>
            </div>
          </div>
          <div className="text-left sm:text-right text-slate-600 dark:text-zinc-300">
            <p>{customer.phone}</p>
            <p className="whitespace-pre-wrap mt-1">{customer.address}</p>
          </div>
        </div>
        <div className="border-t border-slate-200 dark:border-zinc-800 mt-6 pt-4 flex flex-col sm:flex-row items-center gap-2">
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
            <span>Send Email</span>
          </button>
          <button
            onClick={() => (window.location.href = `tel:${customer.phone}`)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 6.75z"
              />
            </svg>
            <span>Call</span>
          </button>
          <div className="relative w-full sm:w-auto" ref={meetingDropdownRef}>
            <button
              onClick={() => setIsMeetingDropdownOpen((prev) => !prev)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18"
                />
              </svg>
              <span>Schedule Meeting</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {isMeetingDropdownOpen && (
              <div className="absolute top-full mt-2 w-full sm:w-48 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-slate-200 dark:border-zinc-700 z-10">
                <a
                  href="https://meet.new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-zinc-700"
                >
                  Google Meet
                </a>
                <a
                  href="https://zoom.us/start/meeting"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-zinc-700"
                >
                  Zoom
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard title="Total Billed" value={formatCurrency(financialStats.totalBilled)} />
        <StatCard title="Total Paid" value={formatCurrency(financialStats.totalPaid)} />
        <StatCard title="Outstanding" value={formatCurrency(financialStats.outstanding)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
          <div className="flex border-b border-slate-200 dark:border-zinc-800 mb-4">
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'activity'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
              }`}
            >
              Activity Log
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'preferences'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
              }`}
            >
              Preferences
            </button>
          </div>

          {activeTab === 'activity' && (
            <div>
              <form
                onSubmit={handleAddActivity}
                className="mb-6 bg-slate-50 dark:bg-zinc-950 p-4 rounded-lg"
              >
                <div className="flex items-center gap-1 p-1 mb-2 bg-slate-200 dark:bg-zinc-800 rounded-lg">
                  {(['Note', 'Email', 'Call', 'Meeting'] as ActivityLog['type'][]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setActivityType(type)}
                      className={`flex-1 py-1 px-2 text-sm rounded-md font-semibold transition-colors ${
                        activityType === type
                          ? 'bg-white dark:bg-zinc-700 shadow-sm'
                          : 'hover:bg-slate-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <div className="space-y-3">
                  {(activityType === 'Email' || activityType === 'Meeting') && (
                    <input
                      value={activitySubject}
                      onChange={(e) => setActivitySubject(e.target.value)}
                      type="text"
                      placeholder="Subject"
                      className="w-full p-2 border rounded-md bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-700"
                    />
                  )}
                  <textarea
                    value={activityContent}
                    onChange={(e) => setActivityContent(e.target.value)}
                    rows={3}
                    className="w-full p-2 border rounded-md bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-700"
                    placeholder={`Add a ${activityType.toLowerCase()} summary...`}
                    required
                  />
                  {activityType === 'Meeting' && (
                    <>
                      <input
                        value={activityLink}
                        onChange={(e) => setActivityLink(e.target.value)}
                        type="text"
                        placeholder="Meeting Link (optional)"
                        className="w-full p-2 border rounded-md bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-700"
                      />
                      <input
                        value={activityAttendees}
                        onChange={(e) => setActivityAttendees(e.target.value)}
                        type="text"
                        placeholder="Attendees (comma-separated)"
                        className="w-full p-2 border rounded-md bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-700"
                      />
                    </>
                  )}
                </div>
                <div className="text-right mt-3">
                  <button
                    type="submit"
                    className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-primary-700 transition-colors"
                  >
                    Add to Log
                  </button>
                </div>
              </form>

              <div className="relative pl-5">
                <div className="absolute left-0 top-6 h-full border-l-2 border-slate-200 dark:border-zinc-700"></div>
                {groupedActivities.length > 0 ? (
                  groupedActivities.map(([dateStr, activities]) => (
                    <div key={dateStr} className="relative mb-6">
                      <h3 className="font-semibold text-slate-600 dark:text-zinc-400 mb-4 pl-8">
                        {dateStr}
                      </h3>
                      {activities.map((activity) => (
                        <div key={activity.id} className="relative pl-8 pb-8">
                          <ActivityIcon type={activity.type} />
                          <p className="font-semibold text-sm flex items-baseline gap-2">
                            <span>{activity.subject || activity.type}</span>
                            <span className="text-xs font-normal text-slate-500 dark:text-zinc-400">
                              {new Date(activity.date).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </p>
                          <p className="text-slate-600 dark:text-zinc-300 whitespace-pre-wrap text-sm mt-1">
                            {activity.content}
                          </p>
                          {activity.link && (
                            <a
                              href={activity.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 dark:text-primary-400 text-sm hover:underline mt-1 inline-block"
                            >
                              Meeting Link
                            </a>
                          )}
                          {activity.attendees && (
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                              Attendees: {activity.attendees}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-500 dark:text-zinc-400 py-8">
                    No activity logged for this customer.
                  </p>
                )}
              </div>
            </div>
          )}
          {activeTab === 'preferences' && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-zinc-100">
                Communication Preferences
              </h2>
              <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-lg">
                {customer.preferences && customer.preferences.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-zinc-300">
                    {customer.preferences.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 dark:text-zinc-400">
                    No communication preferences have been set.
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsPrefsModalOpen(true)}
                className="mt-4 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 transition-colors"
              >
                Edit Preferences
              </button>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-zinc-100">
              Document History
            </h2>
            {customerDocuments.length > 0 ? (
              <ul className="space-y-3  max-h-40 overflow-y-auto pr-2">
                {customerDocuments.map((doc) => (
                  <li key={doc.id}>
                    <HistoryItem item={doc} onEdit={() => editDocument(doc)} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 dark:text-zinc-400">No documents found.</p>
            )}
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-zinc-100">
              Letter History
            </h2>
            {customerLetters.length > 0 ? (
              <ul className="space-y-3 max-h-40 overflow-y-auto pr-2">
                {customerLetters.map((letter) => (
                  <li key={letter.id}>
                    <HistoryItem item={letter} onEdit={() => editLetter(letter)} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 dark:text-zinc-400">No letters found.</p>
            )}
          </div>
        </div>
      </div>
      {isPrefsModalOpen && (
        <PreferencesModal
          customer={customer}
          onClose={() => setIsPrefsModalOpen(false)}
          onSave={handleSavePrefs}
        />
      )}
      {isTagsModalOpen && (
        <TagsModal
          customer={customer}
          onClose={() => setIsTagsModalOpen(false)}
          onSave={handleSaveTags}
          commonTags={commonTags}
          setCommonTags={setCommonTags}
        />
      )}
      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        customer={customer}
        templates={emailTemplates}
        companyInfo={companyInfo}
        addActivityLog={addActivityLog}
      />
    </div>
  );
};

export default CustomerDetail;