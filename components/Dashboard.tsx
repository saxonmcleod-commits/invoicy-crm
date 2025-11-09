import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Document, DocumentStatus, DocumentType, ProductivityPage } from '../types';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const RevenueChart: React.FC<{ documents: Document[], totalRevenue: number, pendingAmount: number }> = ({ documents, totalRevenue, pendingAmount }) => {
    const chartData = useMemo(() => {
        const data: { [key: string]: number } = {};
        const monthLabels: string[] = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const month = d.toLocaleString('default', { month: 'short' });
            const key = `${month} ${d.getFullYear()}`;
            data[key] = 0;
            monthLabels.push(month);
        }

        documents.forEach(doc => {
            if (doc.type === DocumentType.Invoice && doc.status === DocumentStatus.Paid) {
                const issueDate = new Date(doc.issue_date.replace(/-/g, '/'));
                const month = issueDate.toLocaleString('default', { month: 'short' });
                const year = issueDate.getFullYear();
                const key = `${month} ${year}`;
                if (key in data) {
                    data[key] += doc.total;
                }
            }
        });
        
        const revenues = Object.values(data);
        return { labels: monthLabels, revenues, fullKeys: Object.keys(data) };
    }, [documents]);

    const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; value: number } | null>(null);
    const maxRevenue = Math.max(...chartData.revenues, 1);
    const chartHeight = 200;
    const barWidth = 30;
    const barMargin = 15;

    return (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm h-full relative flex flex-col">
             <div>
                <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-zinc-100">Revenue</h2>
                    <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Last 6 Months</span>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 mb-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
                    <div>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">Total Revenue (Paid)</p>
                        <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-500">{formatCurrency(totalRevenue)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">Pending (Sent)</p>
                        <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-500">{formatCurrency(pendingAmount)}</p>
                    </div>
                </div>
            </div>
            <div className="w-full h-[220px] flex-grow" onMouseLeave={() => setTooltip(null)}>
                <svg width="100%" height="100%" viewBox={`0 0 ${chartData.labels.length * (barWidth + barMargin)} ${chartHeight + 30}`}>
                    {[...Array(5)].map((_, i) => (
                        <line 
                            key={i}
                            x1="0"
                            y1={chartHeight - (i * chartHeight / 4)}
                            x2={chartData.labels.length * (barWidth + barMargin)}
                            y2={chartHeight - (i * chartHeight / 4)}
                            className="stroke-slate-200 dark:stroke-zinc-800"
                            strokeDasharray="2,2"
                        />
                    ))}
                    {chartData.revenues.map((value, index) => {
                        const barHeight = (value / maxRevenue) * chartHeight;
                        const x = index * (barWidth + barMargin);
                        const y = chartHeight - barHeight;

                        return (
                            <g key={index}>
                                <rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={barHeight}
                                    className="fill-primary-500 hover:fill-primary-600 transition-colors"
                                    rx="4"
                                    onMouseEnter={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const svgRect = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
                                        setTooltip({
                                            x: rect.left - svgRect.left + rect.width / 2,
                                            y: rect.top - svgRect.top - 10,
                                            label: chartData.fullKeys[index],
                                            value: value,
                                        });
                                    }}
                                />
                                <text
                                    x={x + barWidth / 2}
                                    y={chartHeight + 20}
                                    textAnchor="middle"
                                    className="text-xs fill-slate-500 dark:fill-zinc-400"
                                >
                                    {chartData.labels[index]}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
            {tooltip && (
                <div
                    className="absolute bg-slate-900 text-white text-sm rounded-md p-2 shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
                    style={{ left: tooltip.x, top: tooltip.y }}
                >
                    <p className="font-bold">{tooltip.label}</p>
                    <p>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(tooltip.value)}</p>
                </div>
            )}
        </div>
    );
};

const QuickActions: React.FC = () => {
    const navigate = useNavigate();
    const actions = [
        { label: 'New Invoice/Quote', path: '/new', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
        { label: 'New Customer', path: '/crm', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg> },
    ];
    return (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-zinc-100">Quick Actions</h2>
            <div className="space-y-3">
                {actions.map(action => (
                    <button key={action.path} onClick={() => navigate(action.path)} className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
                        <div className="text-primary-600 dark:text-primary-400">{action.icon}</div>
                        <span className="font-semibold text-slate-700 dark:text-zinc-200">{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

const OverdueInvoices: React.FC<{ documents: Document[], editDocument: (doc: Document) => void, overdueAmount: number }> = ({ documents, editDocument, overdueAmount }) => {
    const overdue = useMemo(() => documents.filter(doc => doc.status === DocumentStatus.Overdue), [documents]);

    if (overdue.length === 0) {
        return (
             <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm h-full">
                 <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    All Caught Up!
                </h2>
                <p className="text-slate-500 dark:text-zinc-400">There are no overdue invoices.</p>
             </div>
        )
    }

    return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 p-6 rounded-xl shadow-sm h-full flex flex-col">
            <div className="flex-shrink-0">
                <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L2.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Overdue Invoices
                    </h2>
                     <span className="px-2 py-1 text-xs font-bold text-red-800 bg-red-200 dark:bg-red-800 dark:text-red-100 rounded-full">{overdue.length}</span>
                </div>
                <p className="text-xs text-red-600 dark:text-red-300 mt-2">Total Amount Overdue</p>
                <p className="text-3xl font-bold text-red-700 dark:text-red-200 mt-1 mb-4">{formatCurrency(overdueAmount)}</p>
            </div>
            <ul className="space-y-2 overflow-y-auto flex-grow pr-2 -mr-2">
                {overdue.map(doc => (
                    <li key={doc.id}>
                        <button onClick={() => editDocument(doc)} className="w-full text-left p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-red-700 dark:text-red-200">{doc.doc_number}</p>
                                    <p className="text-sm text-red-600 dark:text-red-300">{doc.customer?.name || 'N/A'}</p>
                                </div>
                                <p className="font-bold text-red-700 dark:text-red-200">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(doc.total)}</p>
                            </div>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const RecentPagesPanel: React.FC<{ pages: ProductivityPage[] }> = ({ pages }) => {
    const recentPages = useMemo(() => {
        return [...pages]
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .slice(0, 5);
    }, [pages]);

    return (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm flex flex-col h-full">
            <Link to="/productivity-hub" className="text-xl font-semibold mb-4 text-slate-800 dark:text-zinc-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Recent Pages &rarr;
            </Link>
            <div className="flex-1">
                {recentPages.length > 0 ? (
                    <ul className="space-y-2">
                        {recentPages.map(page => (
                             <li key={page.id}>
                                <Link to="/productivity-hub" state={{ activePageId: page.id }} className="block p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                                    <p className="font-semibold flex items-center gap-2">
                                        <span>{page.icon || '📄'}</span>
                                        <span>{page.title}</span>
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                                        Updated {new Date(page.updated_at).toLocaleDateString()}
                                    </p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="text-slate-500 dark:text-zinc-400">No pages yet.</p>
                        <Link to="/productivity-hub" className="mt-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                            Create your first page
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};


interface DashboardProps {
    documents: Document[];
    editDocument: (doc: Document) => void;
    pages: ProductivityPage[];
}

const Dashboard: React.FC<DashboardProps> = ({ documents, editDocument, pages }) => {
    
    const activeDocuments = useMemo(() => documents.filter(doc => !doc.archived), [documents]);

    const totalRevenue = activeDocuments
        .filter(doc => doc.status === DocumentStatus.Paid && doc.type === DocumentType.Invoice)
        .reduce((sum, doc) => sum + doc.total, 0);

    const pendingAmount = activeDocuments
        .filter(doc => doc.status === DocumentStatus.Sent)
        .reduce((sum, doc) => sum + doc.total, 0);

    const overdueAmount = activeDocuments
        .filter(doc => doc.status === DocumentStatus.Overdue)
        .reduce((sum, doc) => sum + doc.total, 0);

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* FIX: Pass activeDocuments to OverdueInvoices to ensure consistency with overdueAmount calculation. */}
                <OverdueInvoices 
                    documents={activeDocuments} 
                    editDocument={editDocument}
                    overdueAmount={overdueAmount}
                />
                <RevenueChart 
                    documents={activeDocuments}
                    totalRevenue={totalRevenue}
                    pendingAmount={pendingAmount}
                />
                <RecentPagesPanel pages={pages} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-1">
                    <QuickActions />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;