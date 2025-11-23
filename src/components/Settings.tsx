import React, { useRef, useState, useEffect } from 'react';
import { CompanyInfo, EmailTemplate } from '../types';
import { supabase } from '../supabaseClient';
import { THEMES } from '../constants';
import { useGoogleCalendar } from '../hooks/useGoogleCalendar';

// --- TemplateModal (unchanged from your file) ---
interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Omit<EmailTemplate, 'id' | 'created_at' | 'user_id'> | EmailTemplate) => void;
  onDelete?: (templateId: string) => void;
  template: EmailTemplate | null;
}

const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  template,
}) => {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showPlaceholdersFor, setShowPlaceholdersFor] = useState<'subject' | 'body' | null>(null);

  const subjectInputRef = useRef<HTMLInputElement>(null);
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const placeholderMenuRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setName(template?.name || '');
      setSubject(template?.subject || '');
      setBody(template?.body || '');
      setShowPlaceholdersFor(null);
    }
  }, [isOpen, template]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        placeholderMenuRef.current &&
        !placeholderMenuRef.current.contains(event.target as Node)
      ) {
        setShowPlaceholdersFor(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleSave = () => {
    if (name.trim() && subject.trim() && body.trim()) {
      onSave({
        ...(template || {}),
        name,
        subject,
        body,
      } as Omit<EmailTemplate, 'id' | 'created_at' | 'user_id'> | EmailTemplate);
      onClose();
    } else {
      alert('Please fill in all fields.');
    }
  };

  const placeholders = {
    Customer: {
      Name: '{{customer.name}}',
      Email: '{{customer.email}}',
      Phone: '{{customer.phone}}',
      Address: '{{customer.address}}',
    },
    Company: {
      Name: '{{company.name}}',
      Email: '{{company.email}}',
      Address: '{{company.address}}',
    },
  };

  const insertPlaceholder = (field: 'subject' | 'body', placeholder: string) => {
    const inputRef = field === 'subject' ? subjectInputRef : bodyTextareaRef;
    const setValue = field === 'subject' ? setSubject : setBody;
    const currentValue = field === 'subject' ? subject : body;

    if (inputRef.current) {
      const { selectionStart, selectionEnd } = inputRef.current;
      const newValue =
        currentValue.substring(0, selectionStart ?? 0) +
        placeholder +
        currentValue.substring(selectionEnd ?? 0);

      setValue(newValue);

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const newCursorPos = (selectionStart ?? 0) + placeholder.length;
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
    setShowPlaceholdersFor(null);
  };

  const renderPlaceholderMenu = (field: 'subject' | 'body') => (
    <div
      ref={placeholderMenuRef}
      className="absolute right-0 mt-1 w-56 bg-white dark:bg-zinc-700 rounded-md shadow-lg z-20 border border-slate-200 dark:border-zinc-600"
    >
      {Object.entries(placeholders).map(([groupName, groupPlaceholders], index) => (
        <div
          key={groupName}
          className={`p-1 ${index > 0 ? 'border-t border-slate-100 dark:border-zinc-600' : ''}`}
        >
          <p className="px-3 py-1 text-xs font-semibold text-slate-400">{groupName}</p>
          {Object.entries(groupPlaceholders).map(([name, value]) => (
            <button
              key={value}
              type="button"
              onClick={() => insertPlaceholder(field, value)}
              className="w-full text-left px-3 py-1.5 text-sm text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-600 rounded-md"
            >
              {name}
            </button>
          ))}
        </div>
      ))}
    </div>
  );

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
          <h2 className="text-xl font-bold mb-4">{template ? 'Edit Template' : 'Add Template'}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                Template Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Invoice Follow-up"
                className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                Subject
              </label>
              <div className="relative">
                <input
                  ref={subjectInputRef}
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject line"
                  className="w-full p-2 pr-10 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPlaceholdersFor(showPlaceholdersFor === 'subject' ? null : 'subject')
                  }
                  className="absolute inset-y-0 right-0 px-3 text-slate-500 hover:text-primary-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {showPlaceholdersFor === 'subject' && renderPlaceholderMenu('subject')}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                Body
              </label>
              <div className="relative">
                <textarea
                  ref={bodyTextareaRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                  className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 font-mono text-sm"
                ></textarea>
                <button
                  type="button"
                  onClick={() =>
                    setShowPlaceholdersFor(showPlaceholdersFor === 'body' ? null : 'body')
                  }
                  className="absolute top-2 right-2 p-1 text-slate-500 hover:text-primary-500 bg-slate-100 dark:bg-zinc-900 rounded-full"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {showPlaceholdersFor === 'body' && renderPlaceholderMenu('body')}
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 dark:bg-zinc-900/50 flex justify-between rounded-b-xl">
          <div>
            {template && onDelete && (
              <button
                onClick={() => onDelete(template.id)}
                className="px-4 py-2 rounded-md font-semibold text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
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
              Save Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
// --- End of TemplateModal ---


interface SettingsProps {
  companyInfo: CompanyInfo;
  setCompanyInfo: (info: CompanyInfo) => void;
  theme: string;
  setTheme: (theme: string) => void;
  emailTemplates: EmailTemplate[];
  addEmailTemplate: (template: Omit<EmailTemplate, 'id' | 'created_at' | 'user_id'>) => void;
  updateEmailTemplate: (template: EmailTemplate) => void;
  deleteEmailTemplate: (templateId: string) => void;
  profile: { stripe_account_id?: string, stripe_account_setup_complete?: boolean } | null;
}

const Settings: React.FC<SettingsProps> = ({
  companyInfo,
  setCompanyInfo,
  theme,
  setTheme,
  emailTemplates,
  addEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  profile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const { connectGoogle, loading: googleLoading, error: googleError, isConnected } = useGoogleCalendar();

  // Check Stripe account status on component load
  useEffect(() => {
    const checkStripeStatus = async () => {
      if (profile && profile.stripe_account_id && !profile.stripe_account_setup_complete) {
        setStripeLoading(true);
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          // ***
          // *** FIX: Call the Vercel function using fetch
          // ***
          const response = await fetch('/api/check-stripe-account-status', {
            method: 'POST', // Match the POST method in the API file
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Failed to check Stripe status');
          }

          if (data.setupComplete) {
            // Trigger profile refresh in App.tsx by updating the database
            await supabase
              .from('profiles')
              .update({ stripe_account_setup_complete: true })
              .eq('id', session.user.id);
          }

        } catch (error: any) {
          console.error("Error checking Stripe status:", error.message);
        } finally {
          setStripeLoading(false);
        }
      }
    };
    checkStripeStatus();
  }, [profile]);

  // Local state for immediate UI feedback on form inputs
  const [localCompanyInfo, setLocalCompanyInfo] = useState(companyInfo);
  useEffect(() => {
    setLocalCompanyInfo(companyInfo);
  }, [companyInfo]);

  const handleCompanyInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setLocalCompanyInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = () => {
    // Update the "real" state on blur, which triggers the DB update in App.tsx
    setCompanyInfo(localCompanyInfo);
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newInfo = { ...localCompanyInfo, logo: reader.result as string };
        setLocalCompanyInfo(newInfo);
        setCompanyInfo(newInfo); // Update immediately for logo
      };
      reader.readAsDataURL(file);
    }
  };

  const openNewTemplateModal = () => {
    setEditingTemplate(null);
    setIsTemplateModalOpen(true);
  };

  const openEditTemplateModal = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setIsTemplateModalOpen(true);
  };

  const handleSaveTemplate = (
    templateData: Omit<EmailTemplate, 'id' | 'created_at' | 'user_id'> | EmailTemplate
  ) => {
    if ('id' in templateData) {
      updateEmailTemplate(templateData);
    } else {
      addEmailTemplate(templateData);
    }
  };

  const handleStripeConnect = async () => {
    setStripeLoading(true);
    try {
      // 1. Get the current user's session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not logged in.");
      }

      // ***
      // *** FIX: Call the Vercel function using fetch
      // ***
      const response = await fetch('/api/create-stripe-account-link', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create Stripe link');
      }

      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe onboarding
      }
    } catch (error: any) {
      console.error('Error connecting to Stripe:', error);
      alert(`Could not connect to Stripe: ${error.message}`);
    } finally {
      setStripeLoading(false);
    }
  };

  const isStripeConnected = profile?.stripe_account_id && profile?.stripe_account_setup_complete;

  return (
    <div className="space-y-8 h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-8">
          {/* Color Theme Card */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-zinc-100">
              Color Theme
            </h2>
            <div className="flex flex-wrap gap-3">
              {THEMES.map((t) => (
                <button
                  key={t.name}
                  onClick={() => setTheme(t.name)}
                  className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-colors w-full ${theme === t.name ? 'border-primary-500 bg-primary-500/10' : 'border-transparent hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
                >
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: t.swatchColor }}
                  ></div>
                  <span className="font-semibold text-sm">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Company Logo Card */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-zinc-100">
              Company Logo
            </h2>
            <div className="flex flex-col items-center space-y-4">
              <div
                className="w-40 h-40 bg-slate-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-zinc-700 transition"
                onClick={handleLogoClick}
              >
                {localCompanyInfo.logo ? (
                  <img
                    src={localCompanyInfo.logo}
                    alt="Company Logo"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <span className="text-slate-500 text-sm">Click to upload</span>
                )}
              </div>
              <button
                onClick={handleLogoClick}
                className="bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 font-semibold px-4 py-2 rounded-lg transition-colors w-full"
              >
                Upload Logo
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                className="hidden"
                accept="image/png, image/jpeg, image/svg+xml"
              />
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-8">
          {/* Company Details Card */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-zinc-100">
              Your Company Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={localCompanyInfo.name}
                  onChange={handleCompanyInfoChange}
                  onBlur={handleBlur}
                  className="w-full p-2 border rounded-md bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                  Address
                </label>
                <textarea
                  name="address"
                  value={localCompanyInfo.address}
                  onChange={handleCompanyInfoChange}
                  onBlur={handleBlur}
                  rows={3}
                  className="w-full p-2 border rounded-md bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 whitespace-pre-wrap"
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={localCompanyInfo.email}
                    onChange={handleCompanyInfoChange}
                    onBlur={handleBlur}
                    className="w-full p-2 border rounded-md bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                    ABN / Tax ID
                  </label>
                  <input
                    type="text"
                    name="abn"
                    value={localCompanyInfo.abn}
                    onChange={handleCompanyInfoChange}
                    onBlur={handleBlur}
                    className="w-full p-2 border rounded-md bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Email Templates Card */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-zinc-100">
                Email Templates
              </h2>
              <button
                onClick={openNewTemplateModal}
                className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                Add Template
              </button>
            </div>
            <div className="space-y-2">
              {emailTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-800 flex justify-between items-center"
                >
                  <p className="font-semibold">{template.name}</p>
                  <button
                    onClick={() => openEditTemplateModal(template)}
                    className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Edit
                  </button>
                </div>
              ))}
              {emailTemplates.length === 0 && (
                <p className="text-slate-500 dark:text-zinc-400 text-center py-4">
                  No templates created yet.
                </p>
              )}
            </div>
          </div>
          {/* Payment Gateway Card */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-zinc-100">Payment Gateway</h2>
            <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-lg">
              {isStripeConnected ? (
                <div className="text-center">
                  <p className="font-semibold text-green-600 dark:text-green-400">✓ Stripe Account Connected</p>
                  <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">You can now accept payments on your invoices.</p>
                  <button onClick={handleStripeConnect} disabled={stripeLoading} className="mt-4 w-full px-4 py-2 text-sm font-semibold rounded-lg bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 transition-colors">
                    {stripeLoading ? 'Checking...' : 'Manage Stripe Account'}
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="font-semibold">Connect with Stripe</p>
                  <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Accept credit card payments for your invoices securely.</p>
                  <button onClick={handleStripeConnect} disabled={stripeLoading} className="mt-4 w-full px-4 py-2 text-sm font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors">
                    {stripeLoading ? 'Connecting...' : 'Connect with Stripe'}
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Integrations Card */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-zinc-100">Integrations</h2>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-zinc-100">Google Calendar & Meet</p>
                  <p className="text-sm text-slate-600 dark:text-zinc-400 mb-4">
                    Connect your Google Calendar to automatically create Google Meet links for your events.
                  </p>
                  <button
                    onClick={connectGoogle}
                    disabled={googleLoading || isConnected}
                    className={`w-full px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${isConnected
                      ? 'bg-green-600 text-white cursor-default'
                      : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700'
                      }`}
                  >
                    {googleLoading ? 'Connecting...' : isConnected ? 'Google Calendar Connected' : 'Connect Google Calendar'}
                  </button>
                  {googleError && <p className="text-red-500 text-xs mt-2">{googleError}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSave={handleSaveTemplate}
        onDelete={deleteEmailTemplate}
        template={editingTemplate}
      />
    </div >
  );
};

export default Settings;