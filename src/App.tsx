import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  Customer,
  Document,
  Expense,
} from './types';
import { THEMES } from './constants';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CrmView from './components/CrmView';
import DocumentEditor from './components/DocumentEditor';
import Projects from './components/Projects';
import BillsAndExpenses, { ExpenseModal } from './components/BillsAndExpenses';
import Calendar from './components/Calendar';
import Settings from './components/Settings';
import NewDocument from './components/NewDocument';
import CustomerDetail from './components/CustomerDetail';
import Files from './components/Files';
import AuthPage from './components/Auth';
import { useAuth } from './AuthContext';
import ProductivityHub from './components/ProductivityHub';
import QuickActions from './components/QuickActions';

// Modals
import CustomerModal from './components/CustomerModal';
import AddNoteModal from './components/AddNoteModal';
import EmailModal from './components/EmailModal';
import SetGoalModal from './components/SetGoalModal';

// Hooks
import { useCustomers } from './hooks/useCustomers';
import { useDocuments } from './hooks/useDocuments';
import { useExpenses } from './hooks/useExpenses';
import { useCalendarEvents } from './hooks/useCalendarEvents';
import { useTasks } from './hooks/useTasks';
import { useEmailTemplates } from './hooks/useEmailTemplates';
import { useActivityLogs } from './hooks/useActivityLogs';
import { useProductivityPages } from './hooks/useProductivityPages';
import { useProfile } from './hooks/useProfile';

const App: React.FC = () => {
  const { session } = useAuth();

  // Custom Hooks
  const { profile, companyInfo, updateProfile, setCompanyInfo } = useProfile();
  const { customers, addCustomer, updateCustomer, deleteCustomer, setCustomers } = useCustomers();
  const { documents, addDocument, updateDocument, deleteDocument, bulkDeleteDocuments, setDocuments } = useDocuments(profile);
  const { expenses, addExpense, updateExpense, deleteExpense, setExpenses } = useExpenses();
  const { events, addEvent, updateEvent, deleteEvent, setEvents } = useCalendarEvents();
  const { tasks, addTask, updateTask, deleteTask, setTasks } = useTasks();
  const { emailTemplates, addEmailTemplate, updateEmailTemplate, deleteEmailTemplate, setEmailTemplates } = useEmailTemplates();
  const { activityLogs, addActivityLog, setActivityLogs } = useActivityLogs();
  const { productivityPages, addPage, updatePage, deletePage, setProductivityPages } = useProductivityPages();

  // Local UI State
  const [commonTags, setCommonTags] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState('Blue');
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [documentToEdit, setDocumentToEdit] = useState<Document | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Global Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [initialExpenseData, setInitialExpenseData] = useState<Partial<Expense> | undefined>(undefined);

  // Quick Action Modals State
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Sync Profile Settings
  useEffect(() => {
    if (profile) {
      setIsDarkMode(profile.dark_mode ?? false);
      setTheme(profile.color_theme || 'Blue');
      setCommonTags(profile.common_tags || []);
    }
  }, [profile]);

  // Theme and Dark Mode Effect
  useEffect(() => {
    const root = window.document.documentElement;
    isDarkMode ? root.classList.add('dark') : root.classList.remove('dark');
    const selectedTheme = THEMES.find((t) => t.name === theme) || THEMES[0];
    Object.entries(selectedTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-primary-${key}`, value);
    });
  }, [isDarkMode, theme]);

  // Reset search on navigation
  useEffect(() => {
    setGlobalSearchTerm('');
  }, [location.pathname]);

  // Toast Timer
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Clear data on logout
  useEffect(() => {
    if (!session) {
      setCustomers([]);
      setDocuments([]);
      setEvents([]);
      setExpenses([]);
      setEmailTemplates([]);
      setActivityLogs([]);
      setProductivityPages([]);
      setTasks([]);
      setCommonTags([]);
    }
  }, [session, setCustomers, setDocuments, setEvents, setExpenses, setEmailTemplates, setActivityLogs, setProductivityPages, setTasks]);

  const customersWithLogs = useMemo(() => {
    return customers.map((customer) => ({
      ...customer,
      activityLog: activityLogs.filter((log) => log.customer_id === customer.id),
    }));
  }, [customers, activityLogs]);

  const handleSetTheme = (themeName: string) => {
    setTheme(themeName);
    updateProfile({ color_theme: themeName });
  };

  const handleSetIsDarkMode = (isDark: boolean) => {
    setIsDarkMode(isDark);
    updateProfile({ dark_mode: isDark });
  };

  const handleSetCommonTags = (tags: string[]) => {
    setCommonTags(tags);
    updateProfile({ common_tags: tags });
  };

  const handleEditDocument = (doc: Document) => {
    setDocumentToEdit(doc);
    setIsSidebarVisible(true);
    navigate('/editor');
  };



  const clearActiveDocuments = () => {
    setDocumentToEdit(null);
    setIsSidebarVisible(true);
  };

  const openExpenseModal = (initialData?: Partial<Omit<Expense, 'id'>>, expense?: Expense | null) => {
    setEditingExpense(expense || null);
    setInitialExpenseData(initialData);
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = (expenseData: Omit<Expense, 'id'> | Expense) => {
    if ('id' in expenseData) {
      updateExpense(expenseData);
    } else {
      addExpense(expenseData as Omit<Expense, 'id' | 'created_at' | 'user_id'>);
    }
  };

  // Wrappers for addDocument/addBusinessLetter to handle toasts
  const handleAddDocument = async (doc: any) => {
    try {
      await addDocument(doc);
      setToast({ message: 'Document saved successfully.', type: 'success' });
    } catch (e: any) {
      setToast({ message: `Error saving document: ${e.message}`, type: 'error' });
    }
  };

  const handleUpdateDocument = async (doc: Document) => {
    try {
      await updateDocument(doc);
      setToast({ message: 'Document updated successfully.', type: 'success' });
    } catch (e: any) {
      setToast({ message: `Error updating document: ${e.message}`, type: 'error' });
    }
  };



  // Quick Action Handlers
  const handleQuickAddCustomer = async (customerData: any) => {
    try {
      await addCustomer(customerData);
      setToast({ message: 'Customer added successfully!', type: 'success' });
    } catch (e: any) {
      setToast({ message: `Error adding customer: ${e.message}`, type: 'error' });
    }
  };

  const handleQuickAddNote = async (title: string, icon: string) => {
    try {
      await addPage({ title, icon });
      setToast({ message: 'Note created successfully!', type: 'success' });
    } catch (e: any) {
      setToast({ message: `Error creating note: ${e.message}`, type: 'error' });
    }
  };

  const handleQuickSendEmail = (to: string, subject: string, body: string) => {
    // Mock send
    console.log('Sending email:', { to, subject, body });
    setToast({ message: 'Email sent successfully!', type: 'success' });
  };

  const handleQuickSetGoal = async (description: string, dueDate: string) => {
    try {
      await addTask({ text: description, due_date: dueDate });
      setToast({ message: 'Goal set successfully!', type: 'success' });
    } catch (e: any) {
      setToast({ message: `Error setting goal: ${e.message}`, type: 'error' });
    }
  };

  if (!session) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    );
  }

  const isEditorPage =
    location.pathname.includes('/editor');

  return (
    <div className="h-screen bg-slate-100 dark:bg-zinc-950 relative">
      <div className="flex h-full">
        {isSidebarVisible && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            clearActiveDocuments={clearActiveDocuments}
            isDarkMode={isDarkMode}
            setIsDarkMode={handleSetIsDarkMode}
          />
        )}
        <div className="relative flex-1 flex flex-col overflow-hidden">
          <Header
            setIsSidebarOpen={setIsSidebarOpen}
            searchTerm={globalSearchTerm}
            setSearchTerm={setGlobalSearchTerm}
          />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/auth" element={<Navigate to="/dashboard" />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route
                path="/dashboard"
                element={
                  <Dashboard
                    documents={documents}
                    editDocument={handleEditDocument}
                    pages={productivityPages}
                    activityLogs={activityLogs}
                    customers={customers}
                    addActivityLog={addActivityLog}
                    expenses={expenses}
                    tasks={tasks}
                  />
                }
              />
              <Route
                path="/crm"
                element={
                  <CrmView
                    customers={customersWithLogs}
                    documents={documents}
                    addCustomer={addCustomer}
                    updateCustomer={updateCustomer}
                    deleteCustomer={deleteCustomer}
                    commonTags={commonTags}
                    setCommonTags={handleSetCommonTags}
                    searchTerm={globalSearchTerm}
                  />
                }
              />
              <Route
                path="/crm/:customerId"
                element={
                  <CustomerDetail
                    customers={customersWithLogs}
                    documents={documents}
                    editDocument={handleEditDocument}
                    updateCustomer={updateCustomer}
                    emailTemplates={emailTemplates}
                    companyInfo={companyInfo}
                    commonTags={commonTags}
                    setCommonTags={setCommonTags}
                    addActivityLog={addActivityLog}
                  />
                }
              />
              <Route path="/new" element={<Navigate to="/editor" />} />
              <Route
                path="/files"
                element={
                  <Files
                    documents={documents}
                    companyInfo={companyInfo}
                    editDocument={handleEditDocument}
                    updateDocument={handleUpdateDocument}
                    deleteDocument={deleteDocument}
                    bulkDeleteDocuments={bulkDeleteDocuments}
                    searchTerm={globalSearchTerm}
                  />
                }
              />
              <Route
                path="/editor"
                element={
                  <DocumentEditor
                    documentToEdit={documentToEdit}
                    addDocument={handleAddDocument}
                    updateDocument={handleUpdateDocument}
                    deleteDocument={deleteDocument}
                    companyInfo={companyInfo}
                    customers={customers}
                    expenses={expenses}
                  />
                }
              />

              <Route
                path="/expenses"
                element={<Navigate to="/bills-and-expenses" replace />}
              />
              <Route
                path="/bills-and-expenses"
                element={
                  <BillsAndExpenses
                    expenses={expenses}
                    customers={customers}
                    openExpenseModal={openExpenseModal}
                  />
                }
              />
              <Route
                path="/calendar"
                element={
                  <Calendar
                    events={events}
                    tasks={tasks}
                    documents={documents}
                    editDocument={handleEditDocument}
                    addEvent={addEvent}
                    updateEvent={updateEvent}
                    deleteEvent={deleteEvent}
                    addTask={addTask}
                    updateTask={updateTask}
                    deleteTask={deleteTask}
                  />
                }
              />
              <Route
                path="/projects"
                element={
                  <Projects />
                }
              />
              <Route
                path="/productivity"
                element={<Navigate to="/productivity-hub" replace />}
              />
              <Route
                path="/productivity-hub"
                element={
                  <ProductivityHub
                    pages={productivityPages}
                    customers={customers}
                    documents={documents}
                    updateDocument={handleUpdateDocument}
                    addPage={addPage}
                    updatePage={updatePage}
                    deletePage={deletePage}
                    openExpenseModal={openExpenseModal}
                  />
                }
              />
              <Route
                path="/settings"
                element={
                  <Settings
                    companyInfo={companyInfo}
                    setCompanyInfo={setCompanyInfo}
                    theme={theme}
                    setTheme={handleSetTheme}
                    emailTemplates={emailTemplates}
                    addEmailTemplate={addEmailTemplate}
                    updateEmailTemplate={updateEmailTemplate}
                    deleteEmailTemplate={deleteEmailTemplate}
                    profile={profile}
                  />
                }
              />
            </Routes>
          </main>

          {/* Toast Notification */}
          {toast && (
            <div
              className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg z-50 max-w-sm transition-all duration-300 ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                } ${toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
            >
              <div className="flex justify-between items-center">
                <p className="pr-4">{toast.message}</p>
                <button onClick={() => setToast(null)} className="text-xl font-bold opacity-70 hover:opacity-100">
                  &times;
                </button>
              </div>
            </div>
          )}

          {/* Global Expense Modal */}
          <ExpenseModal
            isOpen={isExpenseModalOpen}
            onClose={() => setIsExpenseModalOpen(false)}
            onSave={handleSaveExpense}
            onDelete={deleteExpense}
            expense={editingExpense}
            customers={customers}
            initialData={initialExpenseData}
          />

          {/* Quick Action Modals */}
          <CustomerModal
            isOpen={isCustomerModalOpen}
            onClose={() => setIsCustomerModalOpen(false)}
            onSave={handleQuickAddCustomer}
            onUpdate={() => { }} // Not needed for quick add
            customerToEdit={null}
          />

          <AddNoteModal
            isOpen={isNoteModalOpen}
            onClose={() => setIsNoteModalOpen(false)}
            onSave={handleQuickAddNote}
          />

          <EmailModal
            isOpen={isEmailModalOpen}
            onClose={() => setIsEmailModalOpen(false)}
            onSend={handleQuickSendEmail}
            customers={customers}
          />

          <SetGoalModal
            isOpen={isGoalModalOpen}
            onClose={() => setIsGoalModalOpen(false)}
            onSave={handleQuickSetGoal}
          />

          {/* Quick Actions Floating Button */}
          <QuickActions
            onAddCustomer={() => setIsCustomerModalOpen(true)}
            onAddNote={() => setIsNoteModalOpen(true)}
            onSendEmail={() => setIsEmailModalOpen(true)}
            onSetGoal={() => setIsGoalModalOpen(true)}
          />
        </div>
      </div>

      {isEditorPage && (
        <button
          onClick={() => setIsSidebarVisible(!isSidebarVisible)}
          className={`fixed top-1/2 -translate-y-1/2 z-50 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-full w-7 h-7 flex items-center justify-center shadow-md hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all duration-300 text-slate-500 dark:text-zinc-400`}
          style={{ left: isSidebarVisible ? 'calc(16rem - 14px)' : '14px' }}
          title={isSidebarVisible ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={isSidebarVisible ? 'M15.75 19.5L8.25 12l7.5-7.5' : 'M8.25 4.5l7.5 7.5-7.5 7.5'}
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default App;