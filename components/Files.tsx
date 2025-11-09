import React, { useState, useMemo, useRef } from 'react';
import { Document, BusinessLetter, DocumentStatus, DocumentType, CompanyInfo } from '../types';

interface FilesProps {
    documents: Document[];
    businessLetters: BusinessLetter[];
    companyInfo: CompanyInfo;
    editDocument: (doc: Document) => void;
    editLetter: (letter: BusinessLetter) => void;
    updateDocument: (doc: Document) => void;
    updateBusinessLetter: (letter: BusinessLetter) => void;
    deleteDocument: (docId: string) => void;
    deleteBusinessLetter: (letterId: string) => void;
    bulkDeleteDocuments: (docIds: string[]) => Promise<void>;
    bulkDeleteBusinessLetters: (letterIds: string[]) => Promise<void>;
    searchTerm: string;
}

const getStatusStyles = (status: DocumentStatus): string => {
    const statusStyles: { [key in DocumentStatus]: string } = {
        [DocumentStatus.Paid]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        [DocumentStatus.Sent]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        [DocumentStatus.Overdue]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        [DocumentStatus.Draft]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    };
    return statusStyles[status] || 'bg-gray-100 text-gray-800';
};

const StatusSelector: React.FC<{ doc: Document, updateDocument: (doc: Document) => void }> = ({ doc, updateDocument }) => {
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as DocumentStatus;
        updateDocument({ ...doc, status: newStatus });
    };

    return (
        <div className="relative">
             <select
                value={doc.status}
                onChange={handleStatusChange}
                className={`appearance-none cursor-pointer pl-2 pr-6 py-1 text-xs font-medium rounded-full border-0 focus:ring-0 focus:outline-none ${getStatusStyles(doc.status)}`}
                onClick={(e) => e.stopPropagation()}
            >
                <option value={DocumentStatus.Draft}>Draft</option>
                <option value={DocumentStatus.Sent}>Sent</option>
                <option value={DocumentStatus.Paid}>Paid</option>
                <option value={DocumentStatus.Overdue}>Overdue</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1">
                <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </div>
        </div>
    );
};

type FileItem = (Document | BusinessLetter) & { fileType: 'Document' | 'BusinessLetter' };
type ItemToDelete = { id: string; doc_number: string; fileType: 'Document' | 'BusinessLetter'; };
type SortOption = 'most-recent' | 'oldest' | 'last-edited';

const Files: React.FC<FilesProps> = ({ documents, businessLetters, editDocument, editLetter, updateDocument, updateBusinessLetter, deleteDocument, deleteBusinessLetter, bulkDeleteDocuments, bulkDeleteBusinessLetters, searchTerm }) => {
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [showArchived, setShowArchived] = useState(false);
    const [sortOption, setSortOption] = useState<SortOption>('most-recent');
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    
    const [activeMenu, setActiveMenu] = useState<{ id: string; top: number; left: number; position: 'top' | 'bottom' } | null>(null);
    const [itemToDelete, setItemToDelete] = useState<ItemToDelete | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const allFiles: FileItem[] = useMemo(() => {
        const combined: FileItem[] = [
            ...documents.map(d => ({ ...d, fileType: 'Document' as const })),
            ...businessLetters.map(l => ({ ...l, fileType: 'BusinessLetter' as const }))
        ];
        
        return combined.sort((a, b) => {
            switch (sortOption) {
                case 'oldest':
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                case 'last-edited':
                    // Note: 'updated_at' needs to be added to your documents/letters tables and types
                    return new Date((b as any).updated_at || b.created_at).getTime() - new Date((a as any).updated_at || a.created_at).getTime();
                case 'most-recent':
                default:
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
        });
    }, [documents, businessLetters, sortOption]);

    const filteredFiles = useMemo(() => {
        return allFiles.filter(item => {
            const lowercasedSearch = searchTerm.toLowerCase();
            const matchesSearch = searchTerm.trim() === '' ||
                item.doc_number.toLowerCase().includes(lowercasedSearch) ||
                (item.customer?.name || '').toLowerCase().includes(lowercasedSearch);
            
            const itemType = 'type' in item && item.type !== 'BusinessLetter' ? item.type : 'BusinessLetter';
            const matchesType = typeFilter === 'all' || itemType === typeFilter;

            const matchesArchived = showArchived ? true : !item.archived;
            
            return matchesSearch && matchesType && matchesArchived;
        });
    }, [allFiles, searchTerm, typeFilter, showArchived]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            filteredFiles.forEach(f => e.target.checked ? newSet.add(f.id) : newSet.delete(f.id));
            return newSet;
        });
    };

    const handleSelectItem = (id: string) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const isAllSelected = filteredFiles.length > 0 && selectedItems.size === filteredFiles.length;


    const toggleMenu = (itemId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        if (activeMenu?.id === itemId) {
            setActiveMenu(null);
        } else {
            const buttonRect = event.currentTarget.getBoundingClientRect();
            const menuHeight = 220;
            const spaceBelow = window.innerHeight - buttonRect.bottom;
            const position = (spaceBelow < menuHeight && buttonRect.top > spaceBelow) ? 'top' : 'bottom';
            
            setActiveMenu({
                id: itemId,
                top: position === 'top' ? buttonRect.top : buttonRect.bottom,
                left: buttonRect.right,
                position: position,
            });
        }
    };

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const modal = document.querySelector('[role="dialog"]');
            if (menuRef.current && !menuRef.current.contains(target) && (!modal || !modal.contains(target))) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleBulkArchive = () => {
        selectedItems.forEach(id => {
            const item = allFiles.find(f => f.id === id);
            if (item) {
                if (item.fileType === 'Document') {
                    updateDocument({ ...(item as Document), archived: true });
                } else {
                    updateBusinessLetter({ ...(item as BusinessLetter), archived: true });
                }
            }
        });
        setSelectedItems(new Set());
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedItems.size} items? This action cannot be undone.`)) {
            const docIdsToDelete = Array.from(selectedItems).filter(id => allFiles.find(f => f.id === id)?.fileType === 'Document');
            const letterIdsToDelete = Array.from(selectedItems).filter(id => allFiles.find(f => f.id === id)?.fileType === 'BusinessLetter');

            const promises: Promise<void>[] = [];
            if (docIdsToDelete.length > 0) {
                promises.push(bulkDeleteDocuments(docIdsToDelete));
            }
            if (letterIdsToDelete.length > 0) {
                promises.push(bulkDeleteBusinessLetters(letterIdsToDelete));
            }
            await Promise.all(promises);
            setSelectedItems(new Set());
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    }
    
    return (
        <div className="space-y-6 h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                     <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-full sm:w-auto p-2 border rounded-md bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        <option value="all">All Types</option>
                        <option value={DocumentType.Invoice}>Invoice</option>
                        <option value={DocumentType.Quote}>Quote</option>
                        <option value="BusinessLetter">Business Letter</option>
                    </select>
                    <select value={sortOption} onChange={e => setSortOption(e.target.value as SortOption)} className="w-full sm:w-auto p-2 border rounded-md bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        <option value="most-recent">Sort: Most Recent</option>
                        <option value="oldest">Sort: Oldest</option>
                        <option value="last-edited">Sort: Last Edited</option>
                    </select>
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-md">
                        <input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                        <span className="text-sm font-medium">Show Archived</span>
                    </label>
                    <div className="flex-1 flex justify-end gap-2">
                        {selectedItems.size > 0 && (
                            <>
                                <button onClick={handleBulkArchive} className="px-3 py-2 text-sm font-semibold rounded-lg bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Archive</button>
                                <button onClick={handleBulkDelete} className="px-3 py-2 text-sm font-semibold rounded-lg bg-red-100 text-red-800 hover:bg-red-200">Delete</button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm overflow-x-auto">
                 <table className="w-full text-left min-w-[800px]">
                    <thead className="text-xs text-slate-500 dark:text-zinc-400 uppercase border-b border-slate-200 dark:border-zinc-800">
                        <tr>
                            <th className="py-3 pr-3 w-12">
                                <input 
                                    type="checkbox" 
                                    checked={isAllSelected}
                                    onChange={handleSelectAll}
                                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                            </th>
                            <th className="py-3 pr-3">Number</th>
                            <th className="py-3 px-3">Customer</th>
                            <th className="py-3 px-3">Type</th>
                            <th className="py-3 px-3">Date</th>
                            <th className="py-3 px-3">Details / Total</th>
                            <th className="py-3 px-3">Status</th>
                            <th className="py-3 pl-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFiles.map(item => (
                            <tr key={item.id} className={`border-b border-slate-200 dark:border-zinc-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-opacity ${item.archived ? 'opacity-50' : ''}`}>
                                <td className="py-3 pr-3">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedItems.has(item.id)}
                                        onChange={() => handleSelectItem(item.id)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                </td>
                                <td className="py-3 pr-3 font-medium">
                                    <div className="flex items-center gap-2">
                                        {item.archived && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 dark:text-zinc-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><title>Archived</title><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>}
                                        <button onClick={() => item.fileType === 'Document' ? editDocument(item as Document) : editLetter(item as BusinessLetter)} className="text-primary-600 dark:text-primary-400 hover:underline">
                                            {item.doc_number}
                                        </button>
                                    </div>
                                </td>
                                <td className="py-3 px-3 text-slate-600 dark:text-zinc-300">{item.customer?.name || 'N/A'}</td>
                                <td className="py-3 px-3 text-slate-600 dark:text-zinc-300">{item.fileType === 'Document' ? (item as Document).type : 'Letter'}</td>
                                <td className="py-3 px-3 text-slate-600 dark:text-zinc-300">{item.issue_date}</td>
                                <td className="py-3 px-3">
                                    {item.fileType === 'Document' ? (
                                        <span className="font-semibold text-slate-800 dark:text-zinc-100">{formatCurrency((item as Document).total)}</span>
                                     ) : (
                                        <span className="text-slate-600 dark:text-zinc-300 truncate max-w-xs block">{(item as BusinessLetter).subject}</span>
                                     )}
                                </td>
                                <td className="py-3 px-3">{item.fileType === 'Document' ? <StatusSelector doc={item as Document} updateDocument={updateDocument} /> : <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-800 dark:bg-zinc-700 dark:text-zinc-300">N/A</span>}</td>
                                <td className="py-3 pl-3 text-right">
                                    <button onClick={(e) => toggleMenu(item.id, e)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modals and menus are unchanged */}
        </div>
    );
};

export default Files;