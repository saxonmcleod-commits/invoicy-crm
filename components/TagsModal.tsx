import React, { useState } from 'react';
import { Customer } from '../types';

interface TagsModalProps {
  customer: Customer | null;
  onClose: () => void;
  onSave: (tags: string[]) => void;
  commonTags: string[];
  setCommonTags: (tags: string[]) => void;
}

const TagsModal: React.FC<TagsModalProps> = ({
  customer,
  onClose,
  onSave,
  commonTags,
  setCommonTags,
}) => {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set<string>());
  const [customTag, setCustomTag] = useState('');

  React.useEffect(() => {
    if (customer) {
      setSelectedTags(new Set<string>(customer.tags || []));
    }
  }, [customer]);

  if (!customer) return null;

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const newSet = new Set<string>(prev);
      if (newSet.has(tag)) {
        newSet.delete(tag);
      } else {
        newSet.add(tag);
      }
      return newSet;
    });
  };

  const handleDeleteCommonTag = (tagToDelete: string) => {
    setCommonTags(commonTags.filter((t) => t !== tagToDelete));
    setSelectedTags((prev) => {
      const newSet = new Set<string>(prev);
      newSet.delete(tagToDelete);
      return newSet;
    });
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.has(customTag.trim())) {
      const newTag = customTag.trim();
      setSelectedTags((prev) => {
        const newSet = new Set<string>(prev);
        newSet.add(newTag);
        return newSet;
      });
      // This logic was slightly different between your files.
      // I've used the version from CustomerDetail.tsx which seems more correct
      // (it adds the new custom tag to commonTags if it's not already there).
      if (!commonTags.includes(newTag)) {
        setCommonTags([...commonTags, newTag]);
      }
      setCustomTag('');
    }
  };

  const handleSave = () => {
    // The logic from CrmView.tsx (which also updated commonTags on save)
    // is now handled by handleAddCustomTag, making this cleaner.
    onSave([...selectedTags]);
  };

  const allPossibleTags = Array.from(new Set([...commonTags, ...selectedTags]));

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
          <h2 className="text-xl font-bold mb-4">Edit Tags for {customer.name}</h2>
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-zinc-300">
              Select from common tags or add your own.
            </p>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-slate-100 dark:bg-zinc-900 rounded-md">
              {allPossibleTags.map((tag) => (
                <div key={tag} className="relative group">
                  <button
                    onClick={() => handleToggleTag(tag)}
                    className={`pl-3 pr-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                      selectedTags.has(tag)
                        ? 'bg-primary-600 text-white'
                        : 'bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600'
                    }`}
                  >
                    {tag}
                  </button>
                  <button
                    onClick={() => handleDeleteCommonTag(tag)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    title={`Delete "${tag}" from common tags`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
                placeholder="Add a custom tag..."
                className="w-full p-2 border rounded-md bg-slate-100 dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
              />
              <button
                onClick={handleAddCustomTag}
                className="px-4 py-2 rounded-md font-semibold bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600"
              >
                Add
              </button>
            </div>
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
            Save Tags
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagsModal;