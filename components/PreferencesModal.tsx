import React, { useState } from 'react';
import { Customer } from '@/types';
import { PREFERENCE_TAGS } from '@/constants';

interface PreferencesModalProps {
  customer: Customer | null;
  onClose: () => void;
  onSave: (preferences: string[]) => void;
}

const PreferencesModal: React.FC<PreferencesModalProps> = ({ customer, onClose, onSave }) => {
  const [selectedPrefs, setSelectedPrefs] = useState<Set<string>>(new Set<string>());
  const [customPref, setCustomPref] = useState('');
  const [isOtherChecked, setIsOtherChecked] = useState(false);

  React.useEffect(() => {
    if (customer) {
      const initialPrefs = new Set<string>(customer.preferences || []);
      const custom = [...initialPrefs].find((p) => !PREFERENCE_TAGS.includes(p));
      if (custom) {
        setIsOtherChecked(true);
        setCustomPref(custom);
      } else {
        setIsOtherChecked(false);
        setCustomPref('');
      }
      setSelectedPrefs(initialPrefs);
    }
  }, [customer]);

  if (!customer) return null;

  const handleTogglePref = (pref: string) => {
    setSelectedPrefs((prev) => {
      const newSet = new Set<string>(prev);
      if (newSet.has(pref)) {
        newSet.delete(pref);
      } else {
        newSet.add(pref);
      }
      return newSet;
    });
  };

  const handleSave = () => {
    const finalPrefs = new Set<string>(selectedPrefs);
    const oldCustom = [...finalPrefs].find((p) => !PREFERENCE_TAGS.includes(p));
    if (oldCustom) finalPrefs.delete(oldCustom);

    if (isOtherChecked && customPref.trim()) {
      finalPrefs.add(customPref.trim());
    }
    onSave([...finalPrefs]);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Edit Preferences for {customer.name}</h2>
          <div className="space-y-3">
            {PREFERENCE_TAGS.map((pref) => (
              <label
                key={pref}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedPrefs.has(pref)}
                  onChange={() => handleTogglePref(pref)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span>{pref}</span>
              </label>
            ))}
            <label className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isOtherChecked}
                onChange={() => setIsOtherChecked(!isOtherChecked)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span>Other</span>
            </label>
            {isOtherChecked && (
              <div className="pl-9">
                <input
                  type="text"
                  value={customPref}
                  onChange={(e) => setCustomPref(e.target.value)}
                  placeholder="Specify preference..."
                  className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
                />
              </div>
            )}
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 dark:bg-zinc-900/50 flex justify-end gap-2 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md font-semibold hover:bg-slate-200 dark:hover:bg-zinc-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md font-semibold bg-primary-600 text-white hover:bg-primary-700"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesModal;