import React, { useState, useEffect } from 'react';
import { Customer } from '../types';

interface CustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (customerData: Omit<Customer, 'id' | 'created_at' | 'user_id' | 'activityLog'>) => void;
    onUpdate: (customer: Customer) => void;
    customerToEdit?: Customer | null;
}

const CustomerModal: React.FC<CustomerModalProps> = ({
    isOpen,
    onClose,
    onSave,
    onUpdate,
    customerToEdit,
}) => {
    const [formData, setFormData] = useState({
        name: '',
        company_name: '',
        industry: '',
        email: '',
        phone: '',
        address: '',
        tags: '',
    });

    useEffect(() => {
        if (customerToEdit) {
            setFormData({
                name: customerToEdit.name,
                company_name: customerToEdit.company_name || '',
                industry: customerToEdit.industry || '',
                email: customerToEdit.email,
                phone: customerToEdit.phone,
                address: customerToEdit.address,
                tags: customerToEdit.tags?.join(', ') || '',
            });
        } else {
            setFormData({
                name: '',
                company_name: '',
                industry: '',
                email: '',
                phone: '',
                address: '',
                tags: '',
            });
        }
    }, [customerToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const tagsArray = formData.tags.split(',').map((t) => t.trim()).filter(Boolean);

        if (customerToEdit && onUpdate) {
            onUpdate({
                ...customerToEdit,
                name: formData.name,
                company_name: formData.company_name,
                industry: formData.industry,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                tags: tagsArray,
            });
        } else {
            onSave({
                name: formData.name,
                company_name: formData.company_name,
                industry: formData.industry,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                tags: tagsArray,
                preferences: [],
            });
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-zinc-50">
                            {customerToEdit ? 'Edit Customer' : 'Add Customer'}
                        </h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                                        Company Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.company_name}
                                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                        className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                        className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                                        Industry
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.industry}
                                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                        className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                                        Tags (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                            {customerToEdit ? 'Save Changes' : 'Add Customer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerModal;
