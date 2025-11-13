import React, { useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Customer } from '../types';
import TagsModal from './TagsModal'; // Added import
import PreferencesModal from './PreferencesModal'; // Added import

interface CrmViewProps {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at' | 'user_id' | 'activityLog'>) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (customerId: string) => void;
  commonTags: string[];
  setCommonTags: (tags: string[]) => void;
  searchTerm: string;
}

const formatDistanceToNow = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  return 'Just now';
};

type ViewType = 'all' | 'active' | 'inactive' | 'high-value';

// --- TagsModal component removed from here ---

// --- PreferencesModal component removed from here ---

const CrmView: React.FC<CrmViewProps> = ({
  customers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  commonTags,
  setCommonTags,
  searchTerm,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    tags: '',
  });
  const [view] = useState<ViewType>('all');

  const [activeMenu, setActiveMenu] = useState<{
    id: string;
    top: number;
    left: number;
    position: 'top' | 'bottom';
  } | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [customerToEditTags, setCustomerToEditTags] = useState<Customer | null>(null);
  const [customerToEditPrefs, setCustomerToEditPrefs] = useState<Customer | null>(null);

  const activeCustomer = useMemo(
    () => (activeMenu ? customers.find((c) => c.id === activeMenu.id) : null),
    [activeMenu, customers]
  );

  const sortedCustomers = useMemo(
    () => [...customers].sort((a, b) => (a.name > b.name ? 1 : -1)),
    [customers]
  );

  const filteredCustomers = useMemo(() => {
    const customersToFilter = sortedCustomers;

    // Filter by search term
    if (!searchTerm.trim()) return customersToFilter;
    const lowercasedFilter = searchTerm.toLowerCase();
    return customersToFilter.filter(
      (c) =>
        c.name.toLowerCase().includes(lowercasedFilter) ||
        c.email.toLowerCase().includes(lowercasedFilter) ||
        (c.tags && c.tags.some((tag) => tag.toLowerCase().includes(lowercasedFilter)))
    );
  }, [sortedCustomers, searchTerm]);

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

  const toggleMenu = (customerId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (activeMenu?.id === customerId) {
      setActiveMenu(null);
    } else {
      const buttonRect = event.currentTarget.getBoundingClientRect();
      const menuHeight = 120;
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const position = spaceBelow < menuHeight && buttonRect.top > spaceBelow ? 'top' : 'bottom';

      setActiveMenu({
        id: customerId,
        top: position === 'top' ? buttonRect.top : buttonRect.bottom,
        left: buttonRect.right,
        position: position,
      });
    }
  };

  const handleAddClick = () => {
    setCustomerToEdit(null);
    setFormData({ name: '', email: '', phone: '', address: '', tags: '' });
    setIsModalOpen(true);
  };

  const handleEditClick = (customer: Customer) => {
    setCustomerToEdit(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      tags: customer.tags?.join(', ') || '',
    });
    setActiveMenu(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setActiveMenu(null);
  };

  const confirmDelete = () => {
    if (customerToDelete) {
      deleteCustomer(customerToDelete.id);
      setCustomerToDelete(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formData.tags.split(',').map((t) => t.trim()).filter(Boolean);

    if (customerToEdit) {
      updateCustomer({
        ...customerToEdit,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        tags: tagsArray,
      });
    } else {
      addCustomer({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        tags: tagsArray,
        preferences: [],
      });
    }
    setIsModalOpen(false);
  };

  const handleSaveTags = (tags: string[]) => {
    if (customerToEditTags) {
      updateCustomer({ ...customerToEditTags, tags });
    }
    setCustomerToEditTags(null);
  };

  const handleSavePrefs = (preferences: string[]) => {
    if (customerToEditPrefs) {
      updateCustomer({ ...customerToEditPrefs, preferences });
    }
    setCustomerToEditPrefs(null);
  };

  return (
    <div className="space-y-6 h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-end">
        <button
          onClick={handleAddClick}
          className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2 flex-shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Add Customer</span>
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="text-xs text-slate-500 dark:text-zinc-400 uppercase border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 pr-3">Name</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Tags</th>
                  <th className="py-3 px-3">Preferences</th>
                  <th className="py-3 px-3">Added</th>
                  <th className="py-3 pl-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-slate-200 dark:border-zinc-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                  >
                    <td className="py-4 pr-3 font-medium">
                      <Link
                        to={`/crm/${customer.id}`}
                        className="text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {customer.name}
                      </Link>
                    </td>
                    <td className="py-4 px-3 text-slate-600 dark:text-zinc-300">
                      <a
                        href={`mailto:${customer.email}`}
                        className="text-sm hover:underline hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        {customer.email}
                      </a>
                      <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                        {customer.phone}
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <div
                        className="flex flex-wrap gap-1 cursor-pointer min-h-[26px]"
                        onClick={() => setCustomerToEditTags(customer)}
                      >
                        {customer.tags?.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300"
                          >
                            {tag}
                          </span>
                        ))}
                        {customer.tags && customer.tags.length > 3 && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-800 dark:bg-zinc-700 dark:text-zinc-300">
                            +{customer.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <div
                        className="flex flex-wrap gap-1 cursor-pointer min-h-[26px]"
                        onClick={() => setCustomerToEditPrefs(customer)}
                      >
                        {customer.preferences?.map((pref) => (
                          <span
                            key={pref}
                            className="px-2 py-1 text-xs font-medium rounded-full bg-slate-200 text-slate-800 dark:bg-zinc-700 dark:text-zinc-200"
                          >
                            {pref}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-3 text-sm text-slate-500 dark:text-zinc-400">
                      {formatDistanceToNow(customer.created_at)}
                    </td>
                    <td className="py-4 pl-3 text-right">
                      <div className="inline-block text-left">
                        <button
                          onClick={(e) => toggleMenu(customer.id, e)}
                          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {activeMenu && activeCustomer && (
        <div
          ref={menuRef}
          className="fixed z-20 w-48 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-slate-200 dark:border-zinc-700 text-sm"
          style={{
            top: activeMenu.position === 'bottom' ? activeMenu.top + 8 : 'auto',
            bottom: activeMenu.position === 'top' ? window.innerHeight - activeMenu.top + 8 : 'auto',
            left: activeMenu.left - 192,
          }}
        >
          <div className="p-1">
            <button
              onClick={() => handleEditClick(activeCustomer)}
              className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
              <span>Edit</span>
            </button>
            <button
              onClick={() => handleDeleteClick(activeCustomer)}
              className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
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
              </div>
              <div className="px-6 py-4 bg-slate-50 dark:bg-zinc-900/50 flex justify-end gap-2 rounded-b-xl">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
      )}

      {customerToDelete && (
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
            <h2 id="modal-title" className="text-xl font-bold my-3 text-slate-800 dark:text-zinc-50">
              Delete Customer
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Are you sure you want to delete {customerToDelete.name}? All associated documents will
              also be deleted. This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={() => setCustomerToDelete(null)}
                className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <TagsModal
        customer={customerToEditTags}
        onClose={() => setCustomerToEditTags(null)}
        onSave={handleSaveTags}
        commonTags={commonTags}
        setCommonTags={setCommonTags}
      />
      <PreferencesModal
        customer={customerToEditPrefs}
        onClose={() => setCustomerToEditPrefs(null)}
        onSave={handleSavePrefs}
      />
    </div>
  );
};

export default CrmView;