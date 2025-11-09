import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Customer, ProductivityPage, PageBlock, TableBlock, ChartBlock, Document, DocumentStatus, DocumentType, DocumentItem, Expense } from '../types';

// TipTap Imports
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';

// Chart Imports
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Emoji Picker Import
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';

// --- HOOKS ---
const useDebounce = (value: any, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
};


// --- SUB-COMPONENTS ---
const EditorToolbar: React.FC<{ editor: ReturnType<typeof useEditor> | null }> = ({ editor }) => {
    if (!editor) return null;
    const items = [
        { id: 'bold', action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive('bold'), icon: 'B' },
        { id: 'italic', action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive('italic'), icon: 'I' },
        { id: 'highlight', action: () => editor.chain().focus().toggleHighlight().run(), isActive: editor.isActive('highlight'), icon: 'H' },
        { id: 'h1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: editor.isActive('heading', { level: 1 }), icon: 'H1' },
        { id: 'h2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editor.isActive('heading', { level: 2 }), icon: 'H2' },
        { id: 'h3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: editor.isActive('heading', { level: 3 }), icon: 'H3' },
        { id: 'code', action: () => editor.chain().focus().toggleCode().run(), isActive: editor.isActive('code'), icon: '<>' as any },
    ];
    return (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex items-center gap-1 bg-white dark:bg-zinc-800 p-1 rounded-lg shadow-lg border border-slate-200 dark:border-zinc-700">
            {items.map(item => (
                <button key={item.id} onClick={item.action} className={`px-2 py-1 text-sm font-semibold rounded transition-colors ${item.isActive ? 'bg-primary-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-zinc-700'}`}>
                    {item.icon}
                </button>
            ))}
        </BubbleMenu>
    );
};

const TableBlockComponent: React.FC<{ block: TableBlock; onUpdate: (block: PageBlock) => void; onDelete: () => void; }> = ({ block, onUpdate, onDelete }) => {
    const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
        const newData = block.data.map((row, rIdx) => rIdx === rowIndex ? row.map((cell, cIdx) => cIdx === colIndex ? value : cell) : row);
        onUpdate({ ...block, data: newData });
    };
    const addRow = () => onUpdate({ ...block, data: [...block.data, Array(block.data[0]?.length || 1).fill('')] });
    const addCol = () => onUpdate({ ...block, data: block.data.map(row => [...row, '']) });
    const removeRow = (index: number) => onUpdate({ ...block, data: block.data.filter((_, i) => i !== index) });

    return (
        <div className="p-4 bg-white dark:bg-zinc-800/50 rounded-lg shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <tbody>
                        {block.data.map((row, rIdx) => (
                            <tr key={rIdx}>
                                {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="p-1 border border-slate-200 dark:border-zinc-700">
                                        <input type="text" value={cell} onChange={e => handleCellChange(rIdx, cIdx, e.target.value)} className="w-full p-1 bg-transparent focus:outline-none focus:bg-slate-100 dark:focus:bg-zinc-700 rounded"/>
                                    </td>
                                ))}
                                <td className="p-1"><button onClick={() => removeRow(rIdx)} className="text-red-500 text-xs hover:underline">Del</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex gap-2 mt-2 text-xs">
                <button onClick={addRow} className="font-semibold hover:underline">Add Row</button>
                <button onClick={addCol} className="font-semibold hover:underline">Add Column</button>
                <button onClick={onDelete} className="ml-auto text-red-500 font-semibold hover:underline">Delete Table</button>
            </div>
        </div>
    );
};

const ChartBlockComponent: React.FC<{ block: ChartBlock; onUpdate: (block: PageBlock) => void; onDelete: () => void; }> = ({ block, onUpdate, onDelete }) => {
    const handleDataChange = (index: number, field: 'label' | 'value', value: string) => {
        const newData = block.data.map((item, i) => i === index ? { ...item, [field]: field === 'value' ? Number(value) : value } : item);
        onUpdate({ ...block, data: newData });
    };
    const addDataPoint = () => onUpdate({ ...block, data: [...block.data, { label: 'New', value: 10 }] });
    const removeDataPoint = (index: number) => onUpdate({ ...block, data: block.data.filter((_, i) => i !== index) });

    const chartData = { labels: block.data.map(d => d.label), datasets: [{ data: block.data.map(d => d.value), backgroundColor: ['#3b82f6', '#16a34a', '#f97316', '#8b5cf6', '#f43f5e'] }] };
    return (
        <div className="p-4 bg-white dark:bg-zinc-800/50 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-64">{block.chartType === 'bar' ? <Bar data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} /> : <Pie data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />}</div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {block.data.map((d, i) => (
                        <div key={i} className="flex gap-2 items-center text-sm">
                            <input type="text" value={d.label} onChange={e => handleDataChange(i, 'label', e.target.value)} placeholder="Label" className="w-full p-1 border rounded bg-slate-100 dark:bg-zinc-700 border-slate-200 dark:border-zinc-600"/>
                            <input type="number" value={d.value} onChange={e => handleDataChange(i, 'value', e.target.value)} placeholder="Value" className="w-20 p-1 border rounded bg-slate-100 dark:bg-zinc-700 border-slate-200 dark:border-zinc-600"/>
                            <button onClick={() => removeDataPoint(i)} className="text-red-500 hover:text-red-700">&times;</button>
                        </div>
                    ))}
                    <button onClick={addDataPoint} className="text-xs font-semibold hover:underline">Add Data</button>
                </div>
            </div>
            <div className="flex gap-2 mt-2 text-xs">
                <button onClick={() => onUpdate({ ...block, chartType: 'bar' })} className={`font-semibold ${block.chartType === 'bar' ? 'underline' : ''}`}>Bar</button>
                <button onClick={() => onUpdate({ ...block, chartType: 'pie' })} className={`font-semibold ${block.chartType === 'pie' ? 'underline' : ''}`}>Pie</button>
                <button onClick={onDelete} className="ml-auto text-red-500 font-semibold hover:underline">Delete Chart</button>
            </div>
        </div>
    );
};

const PageContent: React.FC<{
    page: ProductivityPage;
    customers: Customer[];
    documents: Document[];
    updatePage: (p: ProductivityPage) => void;
    updateDocument: (d: Document) => void;
    onDelete: () => void;
    openExpenseModal: (initialData?: Partial<Omit<Expense, 'id'>>, expense?: Expense | null) => void;
}> = ({ page: initialPage, customers, documents, updatePage, updateDocument, onDelete, openExpenseModal }) => {
    const [page, setPage] = useState(initialPage);
    const debouncedPage = useDebounce(page, 1000);
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (JSON.stringify(debouncedPage) !== JSON.stringify(initialPage)) {
            updatePage(debouncedPage);
        }
    }, [debouncedPage, updatePage, initialPage]);

    const editor = useEditor({
        extensions: [StarterKit, Highlight, Typography],
        content: page.content,
        onUpdate: ({ editor }) => setPage(p => ({ ...p, content: editor.getJSON() })),
        editorProps: { attributes: { class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none w-full max-w-full' } },
    });

    const addBlock = (type: 'table' | 'chart') => {
        const newBlock: PageBlock = type === 'table' ?
            { id: `tbl-${Date.now()}`, type: 'table', data: [['Header 1', 'Header 2'], ['Cell 1', 'Cell 2']] } :
            { id: `cht-${Date.now()}`, type: 'chart', chartType: 'bar', data: [{ label: 'A', value: 10 }, { label: 'B', value: 20 }] };
        setPage(p => ({ ...p, blocks: [...p.blocks, newBlock] }));
    };

    const updateBlock = (updatedBlock: PageBlock) => {
        setPage(p => ({ ...p, blocks: p.blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b) }));
    };

    const deleteBlock = (blockId: string) => {
        setPage(p => ({ ...p, blocks: p.blocks.filter(b => b.id !== blockId) }));
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [location.pathname]);

    const handleCreateExpense = () => {
        if (!editor) return;
        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to);

        // Regex to find description and amount (e.g., "New microphone $150.99" or "Lunch 25")
        const match = text.match(/(.+?)\s*\$?(\d+(\.\d{1,2})?)/);
        let description = text;
        let amount: number | undefined = undefined;

        if (match) {
            description = match[1].trim();
            amount = parseFloat(match[2]);
        }

        openExpenseModal({
            description,
            amount,
            customer_id: page.customer_id || undefined,
        });
    };

    const handleSendToInvoice = () => {
        if (!editor || !page.customer_id) {
            alert("This page isn't linked to a customer.");
            return;
        }

        const draftInvoice = documents.find(doc =>
            doc.customer_id === page.customer_id &&
            doc.type === DocumentType.Invoice &&
            doc.status === DocumentStatus.Draft
        );

        if (!draftInvoice) {
            alert("No draft invoice found for this customer. Please create one first.");
            return;
        }

        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to);

        const newItem: DocumentItem = {
            id: `item-${Date.now()}`,
            description: text,
            quantity: 1,
            price: 0, // Default price, user can edit in invoice
        };

        const updatedItems = [...draftInvoice.items, newItem];
        updateDocument({ ...draftInvoice, items: updatedItems });
        alert(`"${text}" was added to invoice ${draftInvoice.doc_number}.`);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8">
            <header className="mb-8 group">
                <div className="relative">
                    <button onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)} className="text-5xl mb-4 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg p-1">
                        {page.icon || '📄'}
                    </button>
                    {isEmojiPickerOpen && (
                        <div className="absolute z-10" onMouseLeave={() => setIsEmojiPickerOpen(false)}>
                            <EmojiPicker onEmojiClick={(emoji) => { setPage(p => ({ ...p, icon: emoji.emoji })); setIsEmojiPickerOpen(false); }} emojiStyle={EmojiStyle.NATIVE} />
                        </div>
                    )}
                </div>
                <input
                    type="text"
                    value={page.title}
                    onChange={e => setPage(p => ({ ...p, title: e.target.value }))}
                    className="text-4xl font-bold w-full bg-transparent focus:outline-none mb-2"
                />
                <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-zinc-400">
                        <span>Link to customer:</span>
                        <select value={page.customer_id || ''} onChange={e => setPage(p => ({ ...p, customer_id: e.target.value || null }))} className="bg-transparent border-0 focus:ring-0">
                            <option value="">None</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="relative" ref={menuRef}>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700">...</button>
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-slate-200 dark:border-zinc-700 z-10">
                                <button onClick={onDelete} className="w-full text-left p-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50">Delete Page</button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            <div className="min-h-[200px]">
                {editor && (
                    <BubbleMenu editor={editor} tippyOptions={{ duration: 100, placement: 'bottom' }}>
                        <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 p-1 rounded-lg shadow-lg border border-slate-200 dark:border-zinc-700">
                             <EditorToolbar editor={editor} />
                             <div className="w-px h-5 bg-slate-200 dark:bg-zinc-700 mx-1"></div>
                             <button onClick={handleCreateExpense} className="px-2 py-1 text-sm font-semibold rounded hover:bg-slate-100 dark:hover:bg-zinc-700">Create Expense</button>
                            {page.customer_id && <button onClick={handleSendToInvoice} className="px-2 py-1 text-sm font-semibold rounded hover:bg-slate-100 dark:hover:bg-zinc-700">Add to Invoice</button>}
                        </div>
                    </BubbleMenu>
                )}
                <EditorContent editor={editor} />
            </div>
            <div className="space-y-4 mt-8">
                {page.blocks.map(block => (
                    block.type === 'table' ? <TableBlockComponent key={block.id} block={block} onUpdate={updateBlock} onDelete={() => deleteBlock(block.id)} />
                        : <ChartBlockComponent key={block.id} block={block} onUpdate={updateBlock} onDelete={() => deleteBlock(block.id)} />
                ))}
            </div>
            <div className="mt-8 pt-4 border-t border-dashed border-slate-300 dark:border-zinc-700 flex gap-2">
                <button onClick={() => addBlock('table')} className="text-sm p-2 rounded-md hover:bg-slate-200 dark:hover:bg-zinc-800">Add Table</button>
                <button onClick={() => addBlock('chart')} className="text-sm p-2 rounded-md hover:bg-slate-200 dark:hover:bg-zinc-800">Add Chart</button>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
interface ProductivityHubProps {
    pages: ProductivityPage[];
    customers: Customer[];
    documents: Document[];
    updateDocument: (doc: Document) => void;
    addPage: (pageData: Partial<ProductivityPage>) => Promise<ProductivityPage | null>;
    updatePage: (page: ProductivityPage) => void;
    deletePage: (pageId: string) => void;
    openExpenseModal: (initialData?: Partial<Omit<Expense, 'id'>>, expense?: Expense | null) => void;
}

const ProductivityHub: React.FC<ProductivityHubProps> = ({ pages, customers, documents, updateDocument, addPage, updatePage, deletePage, openExpenseModal }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activePageId, setActivePageId] = useState<string | null>(null);
    const [pageToDelete, setPageToDelete] = useState<ProductivityPage | null>(null);

    const activePage = useMemo(() => pages.find(p => p.id === activePageId), [pages, activePageId]);
    const sortedPages = useMemo(() => [...pages].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()), [pages]);

    useEffect(() => {
        if (location.state?.activePageId && pages.some(p => p.id === location.state.activePageId)) {
            setActivePageId(location.state.activePageId);
            navigate(location.pathname, { replace: true, state: {} });
        } else if (!activePageId && sortedPages.length > 0) {
            setActivePageId(sortedPages[0].id);
        }
    }, [location.state, pages, activePageId, sortedPages, navigate]);

    const handleAddPage = async () => {
        const newPage = await addPage({});
        if (newPage) setActivePageId(newPage.id);
    };

    const confirmDeletePage = () => {
        if (pageToDelete) {
            const pageIndex = sortedPages.findIndex(p => p.id === pageToDelete.id);
            deletePage(pageToDelete.id);
            if (activePageId === pageToDelete.id) {
                if (sortedPages.length > 1) {
                    const nextIndex = pageIndex > 0 ? pageIndex - 1 : 0;
                    setActivePageId(sortedPages[nextIndex].id);
                } else {
                    setActivePageId(null);
                }
            }
            setPageToDelete(null);
        }
    };

    return (
        <div className="flex h-full bg-slate-50 dark:bg-zinc-950">
            <aside className="w-full sm:w-1/3 max-w-xs bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col h-full">
                <div className="p-4 border-b border-slate-200 dark:border-zinc-800">
                    <h1 className="text-xl font-bold">Productivity Hub</h1>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {sortedPages.map(page => (
                        <button key={page.id} onClick={() => setActivePageId(page.id)} className={`w-full text-left flex items-center gap-3 p-3 border-l-4 transition-colors ${activePageId === page.id ? 'border-primary-500 bg-slate-100 dark:bg-zinc-800' : 'border-transparent hover:bg-slate-100/50 dark:hover:bg-zinc-800/50'}`}>
                            <span className="text-xl">{page.icon || '📄'}</span>
                            <span className="truncate font-medium">{page.title}</span>
                        </button>
                    ))}
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-zinc-800">
                    <button onClick={handleAddPage} className="w-full flex items-center justify-center gap-2 p-2 rounded-lg font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                        New Page
                    </button>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto">
                {activePage ? (
                    <PageContent key={activePage.id} page={activePage} customers={customers} documents={documents} updateDocument={updateDocument} updatePage={updatePage} onDelete={() => setPageToDelete(activePage)} openExpenseModal={openExpenseModal} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <h2 className="text-xl font-semibold">No pages found</h2>
                        <p className="text-slate-500 dark:text-zinc-400">Create a new page to get started.</p>
                    </div>
                )}
            </main>
            {pageToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl p-6 w-full max-w-sm text-center">
                        <h2 className="text-xl font-bold my-3">Delete Page</h2>
                        <p className="text-sm text-slate-500 dark:text-zinc-400">Are you sure you want to delete "{pageToDelete.title}"? This cannot be undone.</p>
                        <div className="flex justify-center space-x-4 mt-6">
                            <button onClick={() => setPageToDelete(null)} className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 font-semibold">Cancel</button>
                            <button onClick={confirmDeletePage} className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductivityHub;