import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Customer, Document, DocumentItem, DocumentType, DocumentStatus, CompanyInfo, Recurrence, Expense, NewDocumentData } from '../types';
import { TEMPLATES } from '../constants';
import DocumentPreview from './DocumentPreview';
import { generatePdf } from '../pdfGenerator';
import { useAutoSave, loadAutoSavedDraft, clearAutoSavedDraft } from '../hooks/useAutoSave';

interface DocumentEditorProps {
    customers: Customer[];
    addDocument: (doc: NewDocumentData) => void;
    updateDocument: (doc: Document) => void;
    deleteDocument: (docId: string) => void;
    documentToEdit: Document | null;
    companyInfo: CompanyInfo;
    expenses: Expense[];
}

const AUTO_SAVE_KEY = 'autosave-document-draft';

const getInitialState = (customers: Customer[]): NewDocumentData => {
    const today = new Date().toISOString().split('T')[0];
    return {
        customer: customers[0] || null,
        items: [{ id: `item-${Date.now()}`, description: '', quantity: 1, price: 0 }],
        issue_date: today,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: DocumentType.Invoice,
        status: DocumentStatus.Draft,
        template_id: 'modern',
        subtotal: 0,
        tax: 10,
        total: 0,
        notes: 'Thank you for your business!',
    };
};

const UnbilledExpensesModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAdd: (expenses: Expense[]) => void;
    expenses: Expense[];
}> = ({ isOpen, onClose, onAdd, expenses }) => {
    const [selectedExpenseIds, setSelectedExpenseIds] = useState<Set<string>>(new Set());

    if (!isOpen) return null;

    const handleToggle = (expenseId: string) => {
        setSelectedExpenseIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(expenseId)) {
                newSet.delete(expenseId);
            } else {
                newSet.add(expenseId);
            }
            return newSet;
        });
    };
    
    const handleAddSelected = () => {
        const selectedExpenses = expenses.filter(e => selectedExpenseIds.has(e.id));
        onAdd(selectedExpenses);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                 <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Add Unbilled Expenses</h2>
                    <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                        {expenses.map(expense => (
                            <label key={expense.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 dark:bg-zinc-900 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={selectedExpenseIds.has(expense.id)} 
                                    onChange={() => handleToggle(expense.id)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <div className="flex-1 flex justify-between">
                                    <div>
                                        <p>{expense.description}</p>
                                        <p className="text-xs text-slate-500 dark:text-zinc-400">{expense.date} &bull; {expense.category}</p>
                                    </div>
                                    <p className="font-semibold">${expense.amount.toFixed(2)}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
                 <div className="px-6 py-4 bg-slate-50 dark:bg-zinc-900/50 flex justify-end gap-2 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 rounded-md font-semibold hover:bg-slate-200 dark:hover:bg-zinc-700">Cancel</button>
                    <button onClick={handleAddSelected} className="px-4 py-2 rounded-md font-semibold bg-primary-600 text-white hover:bg-primary-700" disabled={selectedExpenseIds.size === 0}>Add Selected</button>
                </div>
            </div>
        </div>
    );
};

const DocumentEditor: React.FC<DocumentEditorProps> = ({ customers, addDocument, updateDocument, deleteDocument, documentToEdit, companyInfo, expenses }) => {
    const navigate = useNavigate();
    const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
    const [doc, setDoc] = useState<NewDocumentData | Document>(() => getInitialState(customers));
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [showRecoveryModal, setShowRecoveryModal] = useState(false);
    const [recoveredDraft, setRecoveredDraft] = useState<NewDocumentData | null>(null);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

    const isEditMode = useMemo(() => documentToEdit !== null && 'id' in doc, [documentToEdit, doc]);

    // Effect for initializing the form state
    useEffect(() => {
        if (documentToEdit) {
            setDoc(documentToEdit);
        } else {
            // Check for an auto-saved draft only when creating a new document
            const draft = loadAutoSavedDraft<NewDocumentData>(AUTO_SAVE_KEY);
            if (draft) {
                // Ensure customer data is not stale
                const currentCustomer = customers.find(c => c.id === draft.customer?.id);
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
                setDoc(getInitialState(customers));
            }
        }
    }, [documentToEdit, customers]);
    
    // Auto-save the document state if it's a new document
    useAutoSave(AUTO_SAVE_KEY, !isEditMode ? doc : null, 3000);

    const unbilledExpenses = useMemo(() => {
        if (!doc.customer) return [];
        const billedExpenseIds = new Set(doc.items.map(i => i.sourceExpenseId).filter(Boolean));
        return expenses.filter(e => e.customer_id === doc.customer?.id && e.status === 'unbilled' && !billedExpenseIds.has(e.id));
    }, [expenses, doc.customer, doc.items]);

    const currentDocument = useMemo(() => {
        const baseDoc = { ...doc };
        if (!('id' in baseDoc) || baseDoc.id === 'preview-id') {
            (baseDoc as Document).id = 'preview-id'; // Keep a temporary ID for preview
            (baseDoc as Document).doc_number = '...'; // Placeholder text
        }
        return baseDoc as Document;
    }, [doc]);

    useEffect(() => {
        const subtotal = doc.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
        const taxAmount = subtotal * (doc.tax / 100);
        const total = subtotal + taxAmount;
        setDoc(prev => ({ ...prev, subtotal, total }));
    }, [doc.items, doc.tax]);

    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCustomer = customers.find(c => c.id === e.target.value);
        if (selectedCustomer) {
            setDoc(prev => ({ ...prev, customer: selectedCustomer }));
        }
    };

    const handleItemChange = (id: string, field: keyof Omit<DocumentItem, 'id'>, value: string | number) => {
        const newItems = doc.items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        );
        setDoc(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setDoc(prev => ({
            ...prev,
            items: [...prev.items, { id: `item-${Date.now()}`, description: '', quantity: 1, price: 0 }]
        }));
    };

    const removeItem = (id: string) => {
        setDoc(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
    };
    
    const handleAddExpensesToDoc = (expensesToAdd: Expense[]) => {
        const newItems: DocumentItem[] = expensesToAdd.map(e => ({
            id: `item-exp-${e.id}`,
            description: e.description,
            quantity: 1,
            price: e.amount,
            sourceExpenseId: e.id,
        }));
        setDoc(prev => ({...prev, items: [...prev.items, ...newItems]}));
    };

    const handleSave = () => {
        if (!doc.customer) {
            alert("Please select a customer.");
            return;
        }
        if (isEditMode) {
            updateDocument(doc as Document);
        } else {
            addDocument(doc as NewDocumentData);
            clearAutoSavedDraft(AUTO_SAVE_KEY);
        }
        navigate('/files');
    };
    
    const handleDownloadPdf = () => {
        generatePdf(currentDocument, companyInfo);
    };

    const handleShare = async () => {
        if (!navigator.share) {
            alert('Sharing is not supported on this browser.');
            return;
        }
        try {
            await navigator.share({
                title: `${currentDocument.type} ${currentDocument.doc_number}`,
                text: `Here is the ${currentDocument.type.toLowerCase()} from ${companyInfo.name} for ${currentDocument.customer?.name || 'the client'}.`,
                url: window.location.href,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleDeleteConfirm = () => {
        if (isEditMode) {
            deleteDocument(currentDocument.id);
            navigate('/dashboard');
        }
    };
    
    const handleRecoverDraft = () => {
        if (recoveredDraft) {
            setDoc(recoveredDraft);
        }
        setShowRecoveryModal(false);
        setRecoveredDraft(null);
    };

    const handleDiscardDraft = () => {
        clearAutoSavedDraft(AUTO_SAVE_KEY);
        setDoc(getInitialState(customers));
        setShowRecoveryModal(false);
        setRecoveredDraft(null);
    };

    return (
        <div className="flex flex-col h-full">
            <header className="flex-shrink-0 bg-white dark:bg-zinc-900 p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-end z-20">
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={handleShare} className="px-3 py-2 text-sm font-semibold rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
                        Share
                    </button>
                    <button onClick={handleDownloadPdf} className="px-3 py-2 text-sm font-semibold rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
                        Download
                    </button>
                    {isEditMode && (
                        <button onClick={() => setIsDeleteModalOpen(true)} className="px-3 py-2 text-sm font-semibold rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
                            Delete
                        </button>
                    )}
                    <button onClick={handleSave} className="px-3 py-2 text-sm font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors">
                        {isEditMode ? 'Update' : 'Save'}
                    </button>
                </div>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0 p-4 sm:p-6 lg:p-8">
                {/* Mobile View Toggle */}
                <div className="lg:hidden flex border-b border-slate-200 dark:border-zinc-800 -m-4 sm:-m-6 mb-4 bg-slate-100 dark:bg-zinc-950">
                    <button 
                        onClick={() => setMobileView('editor')}
                        className={`flex-1 p-3 font-semibold text-center transition-colors ${mobileView === 'editor' ? 'bg-primary-500 text-white' : 'hover:bg-slate-200 dark:hover:bg-zinc-700'}`}
                    >
                        <div className="flex items-center justify-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                            <span>Editor</span>
                        </div>
                    </button>
                    <button 
                        onClick={() => setMobileView('preview')}
                        className={`flex-1 p-3 font-semibold text-center transition-colors ${mobileView === 'preview' ? 'bg-primary-500 text-white' : 'hover:bg-slate-200 dark:hover:bg-zinc-700'}`}
                    >
                        <div className="flex items-center justify-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                            <span>Preview</span>
                        </div>
                    </button>
                </div>

                {/* Editor Form */}
                <div className={`lg:w-1/2 h-full bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm overflow-y-auto ${mobileView === 'editor' ? 'block' : 'hidden'} lg:block`}>
                    <div className="space-y-6">
                        {/* Customer and Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">Customer</label>
                                <select onChange={handleCustomerChange} value={doc.customer?.id || ''} className="w-full p-2 border rounded-md bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700">
                                    <option value="" disabled>Select a customer</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">Status</label>
                                <select value={doc.status} onChange={(e) => setDoc(p => ({ ...p, status: e.target.value as DocumentStatus }))} className="w-full p-2 border rounded-md bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700">
                                    <option value={DocumentStatus.Draft}>Draft</option>
                                    <option value={DocumentStatus.Sent}>Sent</option>
                                    <option value={DocumentStatus.Paid}>Paid</option>
                                    <option value={DocumentStatus.Overdue}>Overdue</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">Document Type</label>
                            <div className="flex space-x-2">
                                <button onClick={() => setDoc(p => ({ ...p, type: DocumentType.Invoice }))} className={`flex-1 py-2 rounded-md transition ${doc.type === DocumentType.Invoice ? 'bg-primary-600 text-white' : 'bg-slate-200 dark:bg-zinc-800'}`}>Invoice</button>
                                <button onClick={() => setDoc(p => ({ ...p, type: DocumentType.Quote }))} className={`flex-1 py-2 rounded-md transition ${doc.type === DocumentType.Quote ? 'bg-primary-600 text-white' : 'bg-slate-200 dark:bg-zinc-800'}`}>Quote</button>
                            </div>
                        </div>
                        
                        {/* Recurrence Settings */}
                        {doc.type === DocumentType.Invoice && (
                            <div>
                                <h2 className="text-lg font-semibold mb-2">Recurrence</h2>
                                <div className="bg-slate-50 dark:bg-zinc-950/50 p-4 rounded-lg space-y-4">
                                    <div className="flex items-center">
                                        <input 
                                            type="checkbox" 
                                            id="isRecurring" 
                                            checked={!!doc.recurrence} 
                                            onChange={e => {
                                                const { ...rest } = doc;
                                                if (e.target.checked) {
                                                    setDoc({ ...rest, recurrence: { frequency: 'monthly' } });
                                                } else {
                                                    setDoc(rest);
                                                }
                                            }}
                                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <label htmlFor="isRecurring" className="ml-2 block text-sm font-medium">
                                            This is a recurring invoice
                                        </label>
                                    </div>
                                    {doc.recurrence && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">Frequency</label>
                                                <select 
                                                    value={doc.recurrence.frequency} 
                                                    onChange={e => setDoc(p => ({...p, recurrence: {...p.recurrence!, frequency: e.target.value as Recurrence['frequency']}}))}
                                                    className="w-full p-2 border rounded-md bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-700"
                                                >
                                                    <option value="daily">Daily</option>
                                                    <option value="weekly">Weekly</option>
                                                    <option value="monthly">Monthly</option>
                                                    <option value="yearly">Yearly</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">End Date (Optional)</label>
                                                <input 
                                                    type="date" 
                                                    value={doc.recurrence.endDate || ''}
                                                    onChange={e => setDoc(p => ({...p, recurrence: {...p.recurrence!, endDate: e.target.value}}))}
                                                    className="w-full p-2 border rounded-md bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-700"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">Issue Date</label>
                                <input type="date" value={doc.issue_date} onChange={e => setDoc(p => ({ ...p, issue_date: e.target.value }))} className="w-full p-2 border rounded-md bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">{doc.type === DocumentType.Quote ? 'Valid To' : 'Due Date'}</label>
                                <input type="date" value={doc.due_date} onChange={e => setDoc(p => ({ ...p, due_date: e.target.value }))} className="w-full p-2 border rounded-md bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700" />
                            </div>
                        </div>

                        {/* Line Items */}
                        <div>
                            <h2 className="text-lg font-semibold mb-2">Items</h2>
                            <div className="space-y-2">
                                {doc.items.map((item) => (
                                    <div key={item.id} className="flex gap-2 items-center">
                                        <input type="text" placeholder="Description" value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} className="flex-grow min-w-0 p-2 border rounded-md bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700" />
                                        <input type="number" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)} className="w-20 p-2 border rounded-md bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700" />
                                        <input type="number" placeholder="Price" value={item.price} onChange={e => handleItemChange(item.id, 'price', parseFloat(e.target.value) || 0)} className="w-24 p-2 border rounded-md bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700" />
                                        <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 flex-shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-4 mt-2">
                                <button onClick={addItem} className="text-primary-600 dark:text-primary-400 font-semibold">+ Add Item</button>
                                {unbilledExpenses.length > 0 && doc.type === DocumentType.Invoice && (
                                    <button onClick={() => setIsExpenseModalOpen(true)} className="text-green-600 dark:text-green-400 font-semibold">+ Add Unbilled Expenses ({unbilledExpenses.length})</button>
                                )}
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end">
                            <div className="w-full md:w-1/2 space-y-2">
                                <div className="flex justify-between"><span>Subtotal:</span><span>{doc.subtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between items-center">
                                    <span>Tax (%):</span>
                                    <input type="number" value={doc.tax} onChange={e => setDoc(p => ({ ...p, tax: parseFloat(e.target.value) || 0}))} className="w-20 p-1 border rounded-md bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 text-right" />
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t pt-2 border-slate-300 dark:border-zinc-700"><span>Total:</span><span>{doc.total.toFixed(2)}</span></div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">Notes</label>
                            <textarea value={doc.notes} onChange={e => setDoc(p => ({ ...p, notes: e.target.value }))} rows={3} className="w-full p-2 border rounded-md bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700"></textarea>
                        </div>

                        {/* Templates */}
                        <div>
                            <h2 className="text-lg font-semibold mb-2">Template</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {TEMPLATES.map(template => (
                                    <div key={template.id} onClick={() => setDoc(p => ({...p, template_id: template.id}))} className={`cursor-pointer border-2 rounded-lg overflow-hidden transition ${doc.template_id === template.id ? 'border-primary-500' : 'border-transparent hover:border-primary-300'}`}>
                                        <div className="w-full h-auto aspect-[5/7] border-b border-slate-200 dark:border-zinc-800">
                                            <template.previewComponent />
                                        </div>
                                        <p className="text-center p-1 text-sm bg-slate-100 dark:bg-zinc-800">{template.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Preview */}
                <div className={`lg:w-1/2 h-full rounded-xl ${mobileView === 'preview' ? 'block' : 'hidden'} lg:block min-w-0`}>
                    <div className="h-full w-full bg-slate-200 dark:bg-zinc-950 rounded-xl p-2 sm:p-4 overflow-hidden">
                        <div className="w-full h-full overflow-y-auto overflow-x-hidden">
                           <DocumentPreview document={currentDocument} companyInfo={companyInfo} />
                        </div>
                    </div>
                </div>
            </div>
            
            <UnbilledExpensesModal
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
                onAdd={handleAddExpensesToDoc}
                expenses={unbilledExpenses}
            />

            {showRecoveryModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl p-6 w-full max-w-sm text-center">
                        <h2 id="modal-title" className="text-xl font-bold my-3 text-slate-800 dark:text-zinc-50">Unsaved Work Found</h2>
                        <p className="text-sm text-slate-500 dark:text-zinc-400">
                            You have an unsaved draft. Would you like to recover it?
                        </p>
                        <div className="flex justify-center space-x-4 mt-6">
                            <button onClick={handleDiscardDraft} className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 transition font-semibold">
                                Discard
                            </button>
                            <button onClick={handleRecoverDraft} className="px-6 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition font-semibold">
                                Recover
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl p-6 w-full max-w-sm text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                            <svg className="h-6 w-6 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                            </svg>
                        </div>
                        <h2 id="modal-title" className="text-xl font-bold my-3 text-slate-800 dark:text-zinc-50">Delete Document</h2>
                        <p className="text-sm text-slate-500 dark:text-zinc-400">
                            Are you sure you want to delete {currentDocument.doc_number}? This action cannot be undone.
                        </p>
                        <div className="flex justify-center space-x-4 mt-6">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 transition font-semibold">
                                Cancel
                            </button>
                            <button onClick={handleDeleteConfirm} className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-semibold">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentEditor;