import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
    onAddCustomer: () => void;
    onAddNote: () => void;
    onSendEmail: () => void;
    onSetGoal: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
    onAddCustomer,
    onAddNote,
    onSendEmail,
    onSetGoal,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const actions = [
        {
            label: 'New Invoice',
            path: '/editor',
            color: 'from-blue-500 to-cyan-400',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
            ),
        },
        {
            label: 'Add Customer',
            action: onAddCustomer,
            color: 'from-green-500 to-emerald-400',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
            ),
        },
        {
            label: 'Settings',
            path: '/settings',
            color: 'from-slate-500 to-gray-400',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.004.827c-.292.24-.437.613-.43.992a6.759 6.759 0 010 1.255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.333.183-.582.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613-.43.992a6.759 6.759 0 010-1.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.49l1.217.456c.355.133.75.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.213-1.28zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
        },
        {
            label: 'Note',
            action: onAddNote,
            color: 'from-yellow-500 to-amber-400',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
            ),
        },
        {
            label: 'Email',
            action: onSendEmail,
            color: 'from-indigo-500 to-violet-400',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
            ),
        },
        {
            label: 'Set Goal',
            action: onSetGoal,
            color: 'from-red-500 to-rose-400',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
                </svg>
            ),
        },
        {
            label: 'Click Me',
            action: () => alert('You clicked me! Have a great day!'),
            color: 'from-pink-500 to-fuchsia-400',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
            ),
        },
    ];

    const handleAction = (action: any) => {
        if (action.path) {
            navigate(action.path);
        } else if (action.action) {
            action.action();
        }
        setIsOpen(false);
    };

    // Dual-radius calculation
    const getPosition = (index: number) => {
        if (!isOpen) return { x: 0, y: 0 };

        // Split items into two rings
        // Inner ring: 3 items
        // Outer ring: 4 items
        const isInner = index < 3;
        const radius = isInner ? 120 : 200; // Increased spacing

        // Angles (from top 270deg to left 180deg)
        // Inner: 3 items spread over 90 deg
        // Outer: 4 items spread over 90 deg
        const totalAngle = 90;
        const startAngle = 180; // Left

        // Calculate step based on ring count
        const countInRing = isInner ? 3 : 4;
        const indexInRing = isInner ? index : index - 3;

        const step = totalAngle / (countInRing - 1);
        const angle = (startAngle + indexInRing * step) * (Math.PI / 180);

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return { x, y };
    };

    return (
        <div
            className={`fixed bottom-12 right-12 z-50 transition-all duration-300 ${isOpen ? 'w-96 h-96' : 'w-20 h-20'}`}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            {/* Main Toggle Button - Anchored to bottom right */}
            <div className="absolute bottom-0 right-0 z-50 p-2">
                <button
                    className={`relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-500 ease-out
            ${isOpen ? 'rotate-180 scale-110' : 'rotate-0 scale-100'}
            bg-gradient-to-br from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500
            border-2 border-white/20 backdrop-blur-md
          `}
                    style={{
                        boxShadow: isOpen
                            ? '0 0 30px rgba(79, 70, 229, 0.6), 0 0 60px rgba(79, 70, 229, 0.3)'
                            : '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                    }}
                >
                    {/* Inner Glow Ring */}
                    <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse"></div>

                    {/* Unique Sparkles Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white relative z-10">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                </button>

                {/* "Hover" Label */}
                <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 transition-opacity duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`}>
                    Hover
                </div>
            </div>

            {/* Actions Fan-out */}
            <div className="absolute bottom-4 right-4 flex items-center justify-center pointer-events-none">
                {actions.map((action, index) => {
                    const pos = getPosition(index);
                    const delay = isOpen ? index * 30 : 0;

                    return (
                        <button
                            key={index}
                            onClick={() => handleAction(action)}
                            className={`absolute w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) pointer-events-auto
                bg-gradient-to-br ${action.color} border border-white/20 group hover:scale-110 hover:z-50
              `}
                            style={{
                                transform: `translate(${pos.x}px, ${pos.y}px) scale(${isOpen ? 1 : 0})`,
                                opacity: isOpen ? 1 : 0,
                                transitionDelay: `${delay}ms`,
                                zIndex: isOpen ? 40 - index : 0
                            }}
                        >
                            {action.icon}

                            {/* Tooltip Label */}
                            <span
                                className={`absolute px-3 py-1.5 bg-slate-900/90 text-white text-xs font-bold rounded-lg shadow-xl backdrop-blur-sm whitespace-nowrap transition-all duration-300
                  opacity-0 group-hover:opacity-100 pointer-events-none
                `}
                                style={{
                                    bottom: '100%',
                                    marginBottom: '8px',
                                    zIndex: 100
                                }}
                            >
                                {action.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default QuickActions;
