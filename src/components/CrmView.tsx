import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Customer, Document } from '../types';
import TagsModal from './TagsModal';
import PreferencesModal from './PreferencesModal';
import CustomerModal from './CustomerModal';

interface CrmViewProps {
  customers: Customer[];
  documents: Document[];
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at' | 'user_id' | 'activityLog'>) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (customerId: string) => void;
  commonTags: string[];
  setCommonTags: (tags: string[]) => void;
  searchTerm: string;
}

const CrmView: React.FC<CrmViewProps> = ({
  customers,
  documents,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  commonTags,
  setCommonTags,
  searchTerm,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [customerToEditTags, setCustomerToEditTags] = useState<Customer | null>(null);
  const [customerToEditPrefs, setCustomerToEditPrefs] = useState<Customer | null>(null);

  const sortedCustomers = useMemo(
    () => [...customers].sort((a, b) => (a.name > b.name ? 1 : -1)),
    [customers]
  );

  const filteredCustomers = useMemo(() => {
    const customersToFilter = sortedCustomers;
    if (!searchTerm.trim()) return customersToFilter;
    const lowercasedFilter = searchTerm.toLowerCase();
    return customersToFilter.filter(
      (c) =>
        c.name.toLowerCase().includes(lowercasedFilter) ||
        (c.company_name && c.company_name.toLowerCase().includes(lowercasedFilter)) ||
        c.email.toLowerCase().includes(lowercasedFilter)
    );
  }, [sortedCustomers, searchTerm]);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId),
    [customers, selectedCustomerId]
  );

  const customerDocuments = useMemo(() => {
    if (!selectedCustomerId) return [];
    return documents.filter((doc) => doc.customer_id === selectedCustomerId);
  }, [documents, selectedCustomerId]);

  const customerStats = useMemo(() => {
    if (!selectedCustomerId) return { totalBilled: 0, totalPaid: 0 };
    const docs = documents.filter((doc) => doc.customer_id === selectedCustomerId);
    const totalBilled = docs.reduce((sum, doc) => sum + doc.total, 0);
    const totalPaid = docs
      .filter((doc) => doc.status === 'Paid')
      .reduce((sum, doc) => sum + doc.total, 0);
    return { totalBilled, totalPaid };
  }, [documents, selectedCustomerId]);

  const handleAddClick = () => {
    setCustomerToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (customer: Customer) => {
    setCustomerToEdit(customer);
    setIsModalOpen(true);
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
    <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 gap-6 overflow-hidden">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">CRM</h1>
        <button
          onClick={handleAddClick}
          className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Customer
        </button>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* Panel 1: Customer List (3 cols) */}
        <div className="col-span-12 md:col-span-3 bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50">
            <h2 className="font-semibold text-slate-700 dark:text-zinc-200">Customers</h2>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => setSelectedCustomerId(customer.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedCustomerId === customer.id
                    ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-800 border'
                    : 'hover:bg-slate-50 dark:hover:bg-zinc-800 border border-transparent'
                  }`}
              >
                <div className="font-medium text-slate-900 dark:text-white truncate">{customer.name}</div>
                {customer.company_name && (
                  <div className="text-sm text-slate-500 dark:text-zinc-400 truncate">{customer.company_name}</div>
                )}
              </div>
            ))}
            {filteredCustomers.length === 0 && (
              <div className="p-4 text-center text-slate-500 dark:text-zinc-500 text-sm">
                No customers found.
              </div>
            )}
          </div>
        </div>

        {/* Panel 2: Connected Documents (5 cols) */}
        <div className="col-span-12 md:col-span-5 bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50">
            <h2 className="font-semibold text-slate-700 dark:text-zinc-200">
              {selectedCustomer ? `Documents for ${selectedCustomer.name}` : 'Documents'}
            </h2>
          </div>
          <div className="overflow-y-auto flex-1 p-0">
            {!selectedCustomer ? (
              <div className="h-full flex items-center justify-center text-slate-400 dark:text-zinc-600">
                Select a customer to view documents
              </div>
            ) : customerDocuments.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 dark:text-zinc-600">
                No documents found for this customer
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 font-medium">Number</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {customerDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        {doc.doc_number}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-zinc-400">
                        {new Date(doc.issue_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">
                        ${doc.total.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${doc.status === 'Paid'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : doc.status === 'Overdue'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-slate-100 text-slate-800 dark:bg-zinc-700 dark:text-zinc-300'
                            }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Panel 3: Profile Card (4 cols) */}
        <div className="col-span-12 md:col-span-4 bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 flex justify-between items-center">
            <h2 className="font-semibold text-slate-700 dark:text-zinc-200">Profile</h2>
            {selectedCustomer && (
              <button
                onClick={() => handleEditClick(selectedCustomer)}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Edit
              </button>
            )}
          </div>
          <div className="overflow-y-auto flex-1 p-6">
            {!selectedCustomer ? (
              <div className="h-full flex items-center justify-center text-slate-400 dark:text-zinc-600">
                Select a customer to view profile
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-full flex items-center justify-center text-2xl font-bold text-primary-700 dark:text-primary-300 mb-3">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedCustomer.name}</h3>
                  {selectedCustomer.company_name && (
                    <p className="text-slate-500 dark:text-zinc-400">{selectedCustomer.company_name}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-lg text-center">
                    <div className="text-sm text-slate-500 dark:text-zinc-400 mb-1">Total Billed</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      ${customerStats.totalBilled.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-lg text-center">
                    <div className="text-sm text-slate-500 dark:text-zinc-400 mb-1">Total Paid</div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      ${customerStats.totalPaid.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact Info</label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-zinc-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        {selectedCustomer.email}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-zinc-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                        {selectedCustomer.phone}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-zinc-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        {selectedCustomer.address}
                      </div>
                    </div>
                  </div>

                  {selectedCustomer.industry && (
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Industry</label>
                      <div className="mt-1 text-sm text-slate-700 dark:text-zinc-300">{selectedCustomer.industry}</div>
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tags</label>
                      <button onClick={() => setCustomerToEditTags(selectedCustomer)} className="text-xs text-primary-600 hover:text-primary-700">Manage</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCustomer.tags && selectedCustomer.tags.length > 0 ? (
                        selectedCustomer.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-xs rounded-md">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-400 italic">No tags</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addCustomer}
        onUpdate={updateCustomer}
        customerToEdit={customerToEdit}
      />
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