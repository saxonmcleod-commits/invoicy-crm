import { useEffect, useRef } from 'react';

/**
 * A custom hook that periodically saves a piece of state to localStorage.
 * @param key The key to use in localStorage.
 * @param data The data to be saved. This can be null to disable saving.
 * @param interval The auto-save interval in milliseconds. Defaults to 3000ms.
 */
export const useAutoSave = <T>(key: string, data: T | null, interval = 3000) => {
  const savedDataRef = useRef<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      // If data is null, it means auto-save is disabled (e.g., in edit mode), so we do nothing.
      if (data === null) {
        return;
      }

      const stringifiedData = JSON.stringify(data);

      // Only write to localStorage if the data has actually changed to avoid unnecessary writes.
      if (savedDataRef.current !== stringifiedData) {
        window.localStorage.setItem(key, stringifiedData);
        savedDataRef.current = stringifiedData;
      }
    }, interval);

    return () => {
      clearInterval(timer);
    };
  }, [key, data, interval]);
};

/**
 * Clears an auto-saved draft from localStorage.
 * @param key The key of the draft to clear.
 */
export const clearAutoSavedDraft = (key: string) => {
  window.localStorage.removeItem(key);
};

/**
 * Loads an auto-saved draft from localStorage.
 * @param key The key of the draft to load.
 * @returns The parsed draft data, or null if not found or on error.
 */
export const loadAutoSavedDraft = <T>(key: string): T | null => {
  try {
    const item = window.localStorage.getItem(key);
    if (!item) return null;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error loading auto-saved draft for key "${key}":`, error);
    clearAutoSavedDraft(key); // Clear corrupted data to prevent future errors
    return null;
  }
};
