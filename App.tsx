// Fix: Import `useMemo` from React to resolve the "Cannot find name 'useMemo'" error.
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  Customer,
  Document,
  CompanyInfo,
  BusinessLetter,
  CalendarEvent,
  EmailTemplate,
  Expense,
  Profile,
  NewDocumentData,
  NewBusinessLetterData,
  ActivityLog,
  ProductivityPage,
  Task,
  DocumentType,
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
import BusinessLetterEditor from './components/BusinessLetterEditor';
import CustomerDetail from './components/CustomerDetail';
import Files from './components/Files';
import AuthPage from './components/Auth';
import { useAuth } from './AuthContext';
import { supabase } from './supabaseClient';
import ProductivityHub from './components/ProductivityHub';
import TagsModal from './components/TagsModal';
import PreferencesModal from './components/PreferencesModal';

const App: React.FC = () => {
  const { session } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [businessLetters, setBusinessLetters] = useState<BusinessLetter[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [productivityPages, setProductivityPages] = useState<ProductivityPage[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Profile and settings state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({ name: '', address: '', email: '' });
  const [commonTags, setCommonTags] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState('Blue');

  // UI State
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [documentToEdit, setDocumentToEdit] = useState<Document | null>(null);
  const [letterToEdit, setLetterToEdit] = useState<BusinessLetter | null>(null);

  // *** NEW: State for toast notifications ***
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Global Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [initialExpenseData, setInitialExpenseData] = useState<Partial<Expense> | undefined>(
    undefined
  );

  const navigate = useNavigate();
  const location = useLocation();

  const isEditorPage =
    location.pathname.includes('/editor') || location.pathname.includes('/letter-editor');

  const fetchData = useCallback(async () => {
    if (!session) return;
    try {
      const [
        profileRes,
        customersRes,
        documentsRes,
        lettersRes,
        eventsRes,
        expensesRes,
        templatesRes,
        activityLogsRes,
        pagesRes,
        tasksRes,
      ] = await Promise.all([
        supabase.from('profiles').select('*').single(),
        supabase.from('customers').select('*').order('created_at', { ascending: false }),
        supabase
          .from('documents')
          .select('*, customer:customers(*)')
          .order('created_at', { ascending: false }),
        supabase
          .from('business_letters')
          .select('*, customer:customers(*)')
          .order('created_at', { ascending: false }),
        supabase.from('calendar_events').select('*').order('start_time', { ascending: true }),
        supabase.from('expenses').select('*').order('date', { ascending: false }),
        supabase.from('email_templates').select('*').order('name', { ascending: true }),
        supabase.from('activity_log').select('*').order('date', { ascending: false }),
        supabase.from('productivity_pages').select('*').order('updated_at', { ascending: false }),
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (customersRes.data) setCustomers(customersRes.data);
      if (documentsRes.data) setDocuments(documentsRes.data as Document[]); // Cast because of customer relation
      if (lettersRes.data) setBusinessLetters(lettersRes.data as BusinessLetter[]); // Cast because of customer relation
      if (eventsRes.data) setEvents(eventsRes.data);
      if (expensesRes.data) setExpenses(expensesRes.data);
      if (templatesRes.data) setEmailTemplates(templatesRes.data);
      if (activityLogsRes.data) setActivityLogs(activityLogsRes.data);
      if (pagesRes.data) setProductivityPages(pagesRes.data);
      if (tasksRes.data) setTasks(tasksRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [session]);

  // Theme and Dark Mode Effect
  useEffect(() => {
    const root = window.document.documentElement;
    isDarkMode ? root.classList.add('dark') : root.classList.remove('dark');
    const selectedTheme = THEMES.find((t) => t.name === theme) || THEMES[0];
    Object.entries(selectedTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-primary-${key}`, value);
    });
  }, [isDarkMode, theme]);

  // Data Fetching Effect
  useEffect(() => {
    if (session) {
      fetchData();
    } else {
      // Clear data on logout
      setCustomers([]);
      setDocuments([]);
      setBusinessLetters([]);
      setEvents([]);
      setExpenses([]);
      setEmailTemplates([]);
      setActivityLogs([]);
      setProductivityPages([]);
      setTasks([]);
      setProfile(null);
      setCompanyInfo({ name: '', address: '', email: '' });
      setCommonTags([]);
    }
  }, [session, fetchData]);

  // When profile is loaded, set settings states
  useEffect(() => {
    if (profile) {
      setCompanyInfo({
        name: profile.company_name || 'Your Company Inc.',
        address: profile.company_address || '123 Business Rd',
        email: profile.company_email || 'contact@yourcompany.com',
        abn: profile.company_abn || '',
        logo: profile.company_logo || '',
      });
      setIsDarkMode(profile.dark_mode ?? false);
      setTheme(profile.color_theme || 'Blue');
      setCommonTags(profile.common_tags || []);
    }
  }, [profile]);

  // Reset search on navigation
  useEffect(() => {
    setGlobalSearchTerm('');
  }, [location.pathname]);

  // *** NEW: useEffect for hiding toast notifications ***
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000); // Hide after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const customersWithLogs = useMemo(() => {
    return customers.map((customer) => ({
      ...customer,
      activityLog: activityLogs.filter((log) => log.customer_id === customer.id),
    }));
  }, [customers, activityLogs]);

  // Generic update function for profile changes
  const updateProfile = async (updateData: Partial<Profile>) => {
    if (!session) return;
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', session.user.id)
      .select()
      .single();

    if (data) setProfile(data);
    else if (error) console.error('Error updating profile:', error);
  };

  const handleSetCompanyInfo = (info: CompanyInfo) => {
    setCompanyInfo(info);
    updateProfile({
      company_name: info.name,
      company_address: info.address,
      company_email: info.email,
      company_abn: info.abn,
      company_logo: info.logo,
    });
  };

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

  // --- CRUD Operations ---
  const addCustomer = async (customer: Omit<Customer, 'id' | 'created_at' | 'user_id' | 'activityLog'>) => {
    if (!session) return;
    const { data, error } = await supabase
      .from('customers')
      .insert({ ...customer, user_id: session.user.id })
      .select()
      .single();
    if (data) setCustomers((prev) => [data, ...prev]);
    else if (error) console.error('Error adding customer:', error);
  };

  const updateCustomer = async (updatedCustomer: Customer) => {
    const { activityLog, ...rest } = updatedCustomer; // Exclude activityLog from update
    const { data, error } = await supabase
      .from('customers')
      .update(rest)
      .eq('id', updatedCustomer.id)
      .select()
      .single();
    if (data) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === data.id ? { ...c, ...data } : c)) // Preserve existing activityLog
      );
    } else if (error) {
      console.error('Error updating customer:', error);
    }
  };

  const deleteCustomer = async (customerId: string) => {
    const { error } = await supabase.from('customers').delete().eq('id', customerId);
    if (!error) {
      setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    } else console.error('Error deleting customer:', error);
  };

  const addDocument = async (doc: NewDocumentData) => {
    if (!session || !doc.customer) return;

    const { customer, ...docData } = doc;

    // New Sequential Numbering Logic
    let nextDocNumber = '';
    if (doc.type === DocumentType.Invoice) {
      const userInvoices = documents.filter(
        (d) => d.user_id === session.user.id && d.type === DocumentType.Invoice
      );
      let maxNumber = 10000;
      userInvoices.forEach((inv) => {
        const num = parseInt(String(inv.doc_number).replace(/\D/g, ''), 10); // Strip non-digits
        if (!isNaN(num) && num > maxNumber) maxNumber = num;
      });
      nextDocNumber = String(maxNumber + 1);
    } else {
      nextDocNumber = `${doc.type.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}`;
    }

    const newDocForDb = {
      ...docData,
      customer_id: doc.customer.id,
      user_id: session.user.id,
      doc_number: nextDocNumber,
      // Ensure recurrence is null if not provided, matching DB schema
      recurrence: doc.recurrence || null,
    };

    const { data, error } = await supabase
      .from('documents')
      .insert(newDocForDb)
      .select('*, customer:customers(*)')
      .single();

    if (data) {
      const newDoc = data as Document;
      setDocuments((prev) => [newDoc, ...prev]);

      // After adding the document, update any linked expenses to 'billed'
      const expenseIdsToUpdate = newDoc.items.map((item) => item.sourceExpenseId).filter(Boolean) as string[];
      if (expenseIdsToUpdate.length > 0) {
        const { error: expenseError } = await supabase
          .from('expenses')
          .update({ status: 'billed' })
          .in('id', expenseIdsToUpdate);
        if (expenseError) console.error('Error updating expenses to billed:', expenseError);
        else
          setExpenses((prev) =>
            prev.map((e) => (expenseIdsToUpdate.includes(e.id) ? { ...e, status: 'billed' } : e))
          );
      }
    } else if (error) {
      console.error('Error adding document:', error);
      setToast({ message: `Error adding document: ${error.message}`, type: 'error' }); // Show error
      return; // Stop execution if document creation failed
    }

    // *** MODIFIED PAYMENT LINK LOGIC ***
    // Check if user has a stripe account connected AND setup is complete
    if (data && profile?.stripe_account_id && profile.stripe_account_setup_complete) {
      try {
        const { data: functionData, error: functionError } = await supabase.functions.invoke(
          'create-payment-link',
          {
            body: { invoice: data, stripe_account_id: profile.stripe_account_id },
          }
        );

        // This is the new, more robust error handling
        if (functionError) {
          // This will catch network errors or if the function itself crashes (e.g., 500)
          throw functionError;
        }
        if (functionData.error) {
          // This catches the JSON error we added to the backend function
          throw new Error(functionData.error);
        }

        // The function already saves the link, but we need to update our local state
        if (functionData.paymentLinkUrl) {
          setDocuments((prev) =>
            prev.map((d) =>
              d.id === data.id ? { ...d, stripe_payment_link: functionData.paymentLinkUrl } : d
            )
          );
          setToast({ message: 'Invoice saved. Payment link added.', type: 'success' });
        }
      } catch (error: any) {
        console.error('Error invoking create-payment-link function:', error);
        // Show the user the error!
        setToast({ message: `Invoice saved, but failed to create payment link: ${error.message}`, type: 'error' });
      }
    } else if (data && doc.type === DocumentType.Invoice && (!profile?.stripe_account_id || !profile.stripe_account_setup_complete)) {
      // New logic: If they saved an invoice but haven't connected Stripe, tell them.
      setToast({ message: "Invoice saved. To accept payments, connect Stripe in Settings.", type: 'error' });
    } else if (data) {
      // For Quotes or non-payment documents
      setToast({ message: 'Document saved successfully.', type: 'success' });
    }
    // *** END OF MODIFIED LOGIC ***
  };

  const updateDocument = async (updatedDoc: Document) => {
    const { customer, ...docData } = updatedDoc; // Separate customer from the rest of the data
    const { data, error } = await supabase
      .from('documents')
      .update(docData)
      .eq('id', updatedDoc.id)
      .select('*, customer:customers(*)')
      .single();
    if (data) {
      const newDoc = data as Document;
      setDocuments((prev) => prev.map((d) => (d.id === newDoc.id ? newDoc : d)));

      // After updating the document, update any linked expenses to 'billed'
      const expenseIdsToUpdate = newDoc.items.map((item) => item.sourceExpenseId).filter(Boolean) as string[];
      if (expenseIdsToUpdate.length > 0) {
        const { error: expenseError } = await supabase
          .from('expenses')
          .update({ status: 'billed' })
          .in('id', expenseIdsToUpdate);
        if (expenseError) console.error('Error updating expenses to billed:', expenseError);
        else
          setExpenses((prev) =>
            prev.map((e) => (expenseIdsToUpdate.includes(e.id) ? { ...e, status: 'billed' } : e))
          );
      }
    } else if (error) {
      console.error('Error updating document:', error);
      setToast({ message: `Error updating document: ${error.message}`, type: 'error' });
    }
  };

  const deleteDocument = async (docId: string) => {
    const { error } = await supabase.from('documents').delete().eq('id', docId);
    if (!error) setDocuments((prev) => prev.filter((d) => d.id !== docId));
    else console.error('Error deleting document:', error);
  };

  // *** NEW: Bulk delete for Files.tsx ***
  const bulkDeleteDocuments = async (docIds: string[]) => {
      const { error } = await supabase.from('documents').delete().in('id', docIds);
      if (!error) setDocuments((prev) => prev.filter(d => !docIds.includes(d.id)));
      else {
          console.error("Error bulk deleting documents:", error);
          setToast({ message: `Error deleting documents: ${error.message}`, type: 'error' });
      }
  }

  const addBusinessLetter = async (letter: NewBusinessLetterData) => {
    if (!session || !letter.customer) return;

    const { customer, ...letterData } = letter; // Separate customer from the rest of the data

    const newLetterForDb = {
      ...letterData,
      customer_id: letter.customer.id,
      user_id: session.user.id,
      doc_number: `LTR-${Date.now().toString().slice(-6)}`,
    };

    const { data, error } = await supabase
      .from('business_letters')
      .insert(newLetterForDb)
      .select('*, customer:customers(*)')
      .single();

    if (data) {
      setBusinessLetters((prev) => [data as BusinessLetter, ...prev]);
      setToast({ message: 'Letter saved successfully.', type: 'success' });
    } else if (error) {
      console.error('Error adding letter:', error);
      setToast({ message: `Error saving letter: ${error.message}`, type: 'error' });
    }
  };
  const updateBusinessLetter = async (updatedLetter: BusinessLetter) => {
    const { customer, ...letterData } = updatedLetter; // Separate customer from the rest of the data
    const { data, error } = await supabase
      .from('business_letters')
      .update(letterData)
      .eq('id', updatedLetter.id)
      .select('*, customer:customers(*)')
      .single();
    if (data)
      setBusinessLetters((prev) =>
        prev.map((l) => (l.id === data.id ? (data as BusinessLetter) : l))
      );
    else if (error) console.error('Error updating letter:', error);
  };
  const deleteBusinessLetter = async (letterId: string) => {
    const { error } = await supabase.from('business_letters').delete().eq('id', letterId);
    if (!error) setBusinessLetters((prev) => prev.filter((l) => l.id !== letterId));
    else console.error('Error deleting letter:', error);
  };

  // *** NEW: Bulk delete for Files.tsx ***
  const bulkDeleteBusinessLetters = async (letterIds: string[]) => {
      const { error } = await supabase.from('business_letters').delete().in('id', letterIds);
      if (!error) setBusinessLetters((prev) => prev.filter(l => !letterIds.includes(l.id)));
      else {
          console.error("Error bulk deleting letters:", error);
          setToast({ message: `Error deleting letters: ${error.message}`, type: 'error' });
      }
  }

  const addActivityLog = async (activity: Omit<ActivityLog, 'id' | 'created_at' | 'user_id'>) => {
    if (!session) return;
    const { data, error } = await supabase
      .from('activity_log')
      .insert({ ...activity, user_id: session.user.id })
      .select()
      .single();
    if (data) {
      setActivityLogs((prev) => [data, ...prev]);
    } else if (error) {
      console.error('Error adding activity log:', error);
    }
  };

  const addEvent = async (event: Omit<CalendarEvent, 'id' | 'created_at' | 'user_id'>) => {
    if (!session) return;
    const { data, error } = await supabase
      .from('calendar_events')
      .insert({ ...event, user_id: session.user.id })
      .select()
      .single();
    if (data)
      setEvents((prev) =>
        [...prev, data].sort(
          (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        )
      );
    else if (error) console.error('Error adding event:', error);
  };
  const updateEvent = async (updatedEvent: CalendarEvent) => {
    const { data, error } = await supabase
      .from('calendar_events')
      .update(updatedEvent)
      .eq('id', updatedEvent.id)
      .select()
      .single();
    if (data) setEvents((prev) => prev.map((e) => (e.id === data.id ? data : e)));
    else if (error) console.error('Error updating event:', error);
  };
  const deleteEvent = async (eventId: string) => {
    const { error } = await supabase.from('calendar_events').delete().eq('id', eventId);
    if (!error) setEvents((prev) => prev.filter((e) => e.id !== eventId));
    else console.error('Error deleting event:', error);
  };

  const addExpense = async (expense: Omit<Expense, 'id' | 'created_at' | 'user_id'>) => {
    if (!session) return;
    const { data, error } = await supabase
      .from('expenses')
      .insert({ ...expense, user_id: session.user.id })
      .select()
      .single();
    if (data)
      setExpenses((prev) =>
        [data, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
    else if (error) console.error('Error adding expense:', error);
  };
  const updateExpense = async (updatedExpense: Expense) => {
    const { data, error } = await supabase
      .from('expenses')
      .update(updatedExpense)
      .eq('id', updatedExpense.id)
      .select()
      .single();
    if (data) setExpenses((prev) => prev.map((e) => (e.id === data.id ? data : e)));
    else if (error) console.error('Error updating expense:', error);
  };
  const deleteExpense = async (expenseId: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
    if (!error) setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    else console.error('Error deleting expense:', error);
  };

  const addTask = async (task: Omit<Task, 'id' | 'created_at' | 'user_id' | 'completed'>) => {
    if (!session) return;
    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...task, user_id: session.user.id, completed: false })
      .select()
      .single();
    if (data) setTasks((prev) => [data, ...prev]);
    else if (error) console.error('Error adding task:', error);
  };
  const updateTask = async (updatedTask: Task) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updatedTask)
      .eq('id', updatedTask.id)
      .select()
      .single();
    if (data) setTasks((prev) => prev.map((t) => (t.id === data.id ? data : t)));
    else if (error) console.error('Error updating task:', error);
  };
  const deleteTask = async (taskId: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (!error) setTasks((prev) => prev.filter((t) => t.id !== taskId));
    else console.error('Error deleting task:', error);
  };

  const addEmailTemplate = async (template: Omit<EmailTemplate, 'id' | 'created_at' | 'user_id'>) => {
    if (!session) return;
    const { data, error } = await supabase
      .from('email_templates')
      .insert({ ...template, user_id: session.user.id })
      .select()
      .single();
    if (data) setEmailTemplates((prev) => [...prev, data]);
    else if (error) console.error('Error adding template:', error);
  };
  const updateEmailTemplate = async (updatedTemplate: EmailTemplate) => {
    const { data, error } = await supabase
      .from('email_templates')
      .update(updatedTemplate)
      .eq('id', updatedTemplate.id)
      .select()
      .single();
    if (data) setEmailTemplates((prev) => prev.map((t) => (t.id === data.id ? data : t)));
    else if (error) console.error('Error updating template:', error);
  };
  const deleteEmailTemplate = async (templateId: string) => {
    const { error } = await supabase.from('email_templates').delete().eq('id', templateId);
    if (!error) setEmailTemplates((prev) => prev.filter((t) => t.id !== templateId));
    else console.error('Error deleting template:', error);
  };

  const addPage = async (pageData: Partial<ProductivityPage>) => {
    if (!session) return null;
    const newPage = {
      user_id: session.user.id,
      title: 'Untitled Page',
      content: { type: 'doc', content: [{ type: 'paragraph' }] },
      blocks: [],
      ...pageData,
    };
    const { data, error } = await supabase.from('productivity_pages').insert(newPage).select().single();
    if (data) {
      setProductivityPages((prev) => [data, ...prev]);
      return data;
    }
    if (error) console.error('Error adding page:', error);
    return null;
  };

  const updatePage = async (page: ProductivityPage) => {
    const { data, error } = await supabase
      .from('productivity_pages')
      .update(page)
      .eq('id', page.id)
      .select()
      .single();
    if (data) {
      setProductivityPages((prev) => prev.map((p) => (p.id === data.id ? data : p)));
    } else if (error) {
      console.error('Error updating page:', error);
    }
  };

  const deletePage = async (pageId: string) => {
    const { error } = await supabase.from('productivity_pages').delete().eq('id', pageId);
    if (!error) {
      setProductivityPages((prev) => prev.filter((p) => p.id !== pageId));
    } else {
      console.error('Error deleting page:', error);
    }
  };

  const handleEditDocument = (doc: Document) => {
    setDocumentToEdit(doc);
    setIsSidebarVisible(true);
    navigate('/editor');
  };

  const handleEditLetter = (letter: BusinessLetter) => {
    setLetterToEdit(letter);
    setIsSidebarVisible(true);
    navigate('/letter-editor');
  };

  const clearActiveDocuments = () => {
    setDocumentToEdit(null);
    setLetterToEdit(null);
    setIsSidebarVisible(true);
  };

  // --- Global Expense Modal Handlers ---
  const openExpenseModal = (
    initialData?: Partial<Omit<Expense, 'id'>>,
    expense?: Expense | null
  ) => {
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

  if (!session) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    );
  }

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
              {/* FIX: Pass required 'documents' and 'editDocument' props to Dashboard component. */}
              <Route
                path="/dashboard"
                element={
                  <Dashboard
                    documents={documents}
                    editDocument={handleEditDocument}
                    pages={productivityPages}
                  />
                }
              />
              <Route
                path="/crm"
                element={
                  <CrmView
                    customers={customersWithLogs}
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
                    businessLetters={businessLetters}
                    editDocument={handleEditDocument}
                    editLetter={handleEditLetter}
                    updateCustomer={updateCustomer}
                    emailTemplates={emailTemplates}
                    companyInfo={companyInfo}
                    commonTags={commonTags}
                    setCommonTags={handleSetCommonTags}
                    addActivityLog={addActivityLog}
                  />
                }
              />
              <Route path="/new" element={<NewDocument />} />
              <Route
                path="/files"
                element={
                  <Files
                    documents={documents}
                    businessLetters={businessLetters}
                    companyInfo={companyInfo}
                    editDocument={handleEditDocument}
                    editLetter={handleEditLetter}
                    updateDocument={updateDocument}
                    updateBusinessLetter={updateBusinessLetter}
                    deleteDocument={deleteDocument}
                    deleteBusinessLetter={deleteBusinessLetter}
                    bulkDeleteDocuments={bulkDeleteDocuments}
                    bulkDeleteBusinessLetters={bulkDeleteBusinessLetters}
                    searchTerm={globalSearchTerm}
                  />
                }
              />
              <Route
                path="/editor"
                element={
                  <DocumentEditor
                    customers={customers}
                    addDocument={addDocument}
                    updateDocument={updateDocument}
                    deleteDocument={deleteDocument}
                    documentToEdit={documentToEdit}
                    companyInfo={companyInfo}
                    expenses={expenses}
                  />
                }
              />
              <Route
                path="/letter-editor"
                element={
                  <BusinessLetterEditor
                    customers={customers}
                    addBusinessLetter={addBusinessLetter}
                    updateBusinessLetter={updateBusinessLetter}
                    deleteBusinessLetter={deleteBusinessLetter}
                    letterToEdit={letterToEdit}
                    companyInfo={companyInfo}
                  />
                }
              />
              <Route path="/projects" element={<Projects />} />
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
                    documents={documents}
                    tasks={tasks}
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
                path="/settings"
                element={
                  <Settings
                    companyInfo={companyInfo}
                    setCompanyInfo={handleSetCompanyInfo}
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
              <Route
                path="/productivity-hub"
                element={
                  <ProductivityHub
                    pages={productivityPages}
                    customers={customers}
                    documents={documents}
                    updateDocument={updateDocument}
                    addPage={addPage}
                    updatePage={updatePage}
                    deletePage={deletePage}
                    openExpenseModal={openExpenseModal}
                  />
                }
              />
            </Routes>
          </main>
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
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={handleSaveExpense}
        onDelete={deleteExpense}
        expense={editingExpense}
        customers={customers}
        initialData={initialExpenseData}
      />
      
      {/* *** NEW: Toast Notification Component *** */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg z-50 max-w-sm transition-all duration-300 ${
            toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
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
    </div>
  );
};

export default App;