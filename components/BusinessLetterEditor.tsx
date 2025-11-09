import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Customer, CompanyInfo, BusinessLetter, NewBusinessLetterData } from '../types';
import BusinessLetterPreview from './BusinessLetterPreview';
import { generateLetterPdf } from '../pdfGenerator';
import { useAutoSave, loadAutoSavedDraft, clearAutoSavedDraft } from '../hooks/useAutoSave';

interface BusinessLetterEditorProps {
  customers: Customer[];
  addBusinessLetter: (letter: NewBusinessLetterData) => void;
  updateBusinessLetter: (letter: BusinessLetter) => void;
  deleteBusinessLetter: (letterId: string) => void;
  letterToEdit: BusinessLetter | null;
  companyInfo: CompanyInfo;
}

const AUTO_SAVE_KEY = 'autosave-letter-draft';

const getInitialState = (customers: Customer[]): NewBusinessLetterData => {
  const today = new Date().toISOString().split('T')[0];
  return {
    customer: customers[0] || null,
    issue_date: today,
    subject: 'Regarding Our Recent Conversation',
    body: `Dear ${customers[0]?.name || '[Customer Name]'},\n\nThis letter serves as a follow-up to our discussion on...\n\n\n`,
    type: 'BusinessLetter',
  };
};

const BusinessLetterEditor: React.FC<BusinessLetterEditorProps> = ({
  customers,
  addBusinessLetter,
  updateBusinessLetter,
  deleteBusinessLetter,
  letterToEdit,
  companyInfo,
}) => {
  const navigate = useNavigate();
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [letter, setLetter] = useState<NewBusinessLetterData | BusinessLetter>(() =>
    getInitialState(customers)
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveredDraft, setRecoveredDraft] = useState<NewBusinessLetterData | null>(null);

  const isEditMode = useMemo(() => letterToEdit !== null && 'id' in letter, [letterToEdit, letter]);

  // Effect for initializing the form state
  useEffect(() => {
    if (letterToEdit) {
      setLetter(letterToEdit);
    } else {
      // Check for an auto-saved draft only when creating a new letter
      const draft = loadAutoSavedDraft<NewBusinessLetterData>(AUTO_SAVE_KEY);
      if (draft) {
        // Ensure customer data is not stale
        const currentCustomer = customers.find((c) => c.id === draft.customer?.id);
        if (currentCustomer) {
          draft.customer = currentCustomer;
        } else if (customers.length > 0) {
          draft.customer = customers[0]; // Fallback if original customer was deleted
        } else {
          draft.customer = null;
        }
        setRecoveredDraft(draft);
        setShowRecoveryModal(true);
      } else {
        setLetter(getInitialState(customers));
      }
    }
  }, [letterToEdit, customers]);

  // Auto-save the letter state if it's a new letter
  useAutoSave(AUTO_SAVE_KEY, !isEditMode ? letter : null, 3000);

  const currentLetter = useMemo((): BusinessLetter => {
    const baseLetter = { ...letter };
    if (!('id' in baseLetter) || baseLetter.id === 'preview-id') {
      (baseLetter as BusinessLetter).id = 'preview-id';
      (baseLetter as BusinessLetter).doc_number = 'LETTER-XXXX';
    }
    return baseLetter as BusinessLetter;
  }, [letter]);

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCustomer = customers.find((c) => c.id === e.target.value);
    if (selectedCustomer) {
      setLetter((prev) => ({ ...prev, customer: selectedCustomer }));
    }
  };

  const handleSave = () => {
    if (!letter.customer) {
      alert('Please select a customer.');
      return;
    }
    if (isEditMode) {
      updateBusinessLetter(letter as BusinessLetter);
    } else {
      addBusinessLetter(letter as NewBusinessLetterData);
      clearAutoSavedDraft(AUTO_SAVE_KEY);
    }
    navigate('/files');
  };

  const handleDownloadPdf = () => {
    generateLetterPdf(currentLetter, companyInfo);
  };

  const handleShare = async () => {
    if (!navigator.share) {
      alert('Sharing is not supported on this browser.');
      return;
    }
    try {
      await navigator.share({
        title: `Business Letter to ${currentLetter.customer.name}`,
        text: `Here is a business letter from ${companyInfo.name}.`,
        url: window.location.href,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDeleteConfirm = () => {
    if (isEditMode) {
      deleteBusinessLetter(currentLetter.id);
      navigate('/files');
    }
  };

  const handleRecoverDraft = () => {
    if (recoveredDraft) {
      setLetter(recoveredDraft);
    }
    setShowRecoveryModal(false);
    setRecoveredDraft(null);
  };

  const handleDiscardDraft = () => {
    clearAutoSavedDraft(AUTO_SAVE_KEY);
    setLetter(getInitialState(customers));
    setShowRecoveryModal(false);
    setRecoveredDraft(null);
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex-shrink-0 bg-white dark:bg-zinc-900 p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-end z-20">
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleShare}
            className="px-3 py-2 text-sm font-semibold rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Share
          </button>
          <button
            onClick={handleDownloadPdf}
            className="px-3 py-2 text-sm font-semibold rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Download
          </button>
          {isEditMode && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-3 py-2 text-sm font-semibold rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
            >
              Delete
            </button>
          )}
          <button
            onClick={handleSave}
            className="px-3 py-2 text-sm font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
          >
            {isEditMode ? 'Update' : 'Save'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0 p-4 sm:p-6 lg:p-8">
        <div className="lg:hidden flex border-b border-slate-200 dark:border-zinc-800 -m-4 sm:-m-6 mb-4 bg-slate-100 dark:bg-zinc-950">
          <button
            onClick={() => setMobileView('editor')}
            className={`flex-1 p-3 font-semibold text-center transition-colors ${mobileView === 'editor' ? 'bg-primary-500 text-white' : 'hover:bg-slate-200 dark:hover:bg-zinc-700'}`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path
                  fillRule="evenodd"
                  d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Editor</span>
            </div>
          </button>
          <button
            onClick={() => setMobileView('preview')}
            className={`flex-1 p-3 font-semibold text-center transition-colors ${mobileView === 'preview' ? 'bg-primary-500 text-white' : 'hover:bg-slate-200 dark:hover:bg-zinc-700'}`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Preview</span>
            </div>
          </button>
        </div>

        <div
          className={`lg:w-1/2 h-full bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm overflow-y-auto ${mobileView === 'editor' ? 'block' : 'hidden'} lg:block`}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                  Recipient
                </label>
                <select
                  onChange={handleCustomerChange}
                  value={letter.customer?.id || ''}
                  className="w-full p-2 border rounded-md bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700"
                >
                  <option value="" disabled>
                    Select a customer
                  </option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={letter.issue_date}
                  onChange={(e) => setLetter((p) => ({ ...p, issue_date: e.target.value }))}
                  className="w-full p-2 border rounded-md bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={letter.subject}
                onChange={(e) => setLetter((p) => ({ ...p, subject: e.target.value }))}
                className="w-full p-2 border rounded-md bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                Body
              </label>
              <textarea
                value={letter.body}
                onChange={(e) => setLetter((p) => ({ ...p, body: e.target.value }))}
                rows={15}
                className="w-full p-2 border rounded-md bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 font-serif"
              ></textarea>
            </div>
          </div>
        </div>

        <div
          className={`lg:w-1/2 h-full rounded-xl ${mobileView === 'preview' ? 'block' : 'hidden'} lg:block min-w-0`}
        >
          <div className="h-full w-full bg-slate-200 dark:bg-zinc-950 rounded-xl p-2 sm:p-4 overflow-hidden">
            <div className="w-full h-full overflow-y-auto overflow-x-hidden">
              <BusinessLetterPreview letter={currentLetter} companyInfo={companyInfo} />
            </div>
          </div>
        </div>
      </div>

      {showRecoveryModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl p-6 w-full max-w-sm text-center">
            <h2
              id="modal-title"
              className="text-xl font-bold my-3 text-slate-800 dark:text-zinc-50"
            >
              Unsaved Work Found
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              You have an unsaved letter draft. Would you like to recover it?
            </p>
            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={handleDiscardDraft}
                className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 transition font-semibold"
              >
                Discard
              </button>
              <button
                onClick={handleRecoverDraft}
                className="px-6 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition font-semibold"
              >
                Recover
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl p-6 w-full max-w-sm text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
              <svg
                className="h-6 w-6 text-red-600 dark:text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"
                />
              </svg>
            </div>
            <h2
              id="modal-title"
              className="text-xl font-bold my-3 text-slate-800 dark:text-zinc-50"
            >
              Delete Letter
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Are you sure you want to delete this letter? This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessLetterEditor;
