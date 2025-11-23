import React, { useState } from 'react';

interface SetGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (description: string, dueDate: string) => void;
}

const SetGoalModal: React.FC<SetGoalModalProps> = ({ isOpen, onClose, onSave }) => {
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(description, dueDate);
        setDescription('');
        setDueDate('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-zinc-50">
                            Set New Goal
                        </h2>
                        <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-400 rounded flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">Under development, some feature may not work as intended</span>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                                    Goal Description
                                </label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    placeholder="e.g., Reach $10k revenue"
                                    className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                                    Target Date
                                </label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    required
                                    className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-slate-50 dark:bg-zinc-900/50 flex justify-end gap-2 rounded-b-xl">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-md font-semibold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-md font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                        >
                            Set Goal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SetGoalModal;
