import React, { useState, useMemo, useEffect } from 'react';
import { ActivityLog, Customer } from '../types';

// We export ActivityIcon so we can use it in CustomerDetail again
export const ActivityIcon: React.FC<{ type: ActivityLog['type'] }> = ({ type }) => {
  const iconStyles = 'w-5 h-5';
  const icons: { [key in ActivityLog['type']]: React.ReactNode } = {
    Note: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={iconStyles}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    Email: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={iconStyles}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
        />
      </svg>
    ),
    Call: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={iconStyles}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 6.75z"
        />
      </svg>
    ),
    Meeting: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={iconStyles}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 14.15v4.098a2.25 2.25 0 01-2.25 2.25H6.002a2.25 2.25 0 01-2.25-2.25v-4.098m16.5 0a2.25 2.25 0 00-2.25-2.25H6.002a2.25 2.25 0 00-2.25 2.25m16.5 0v-4.098a2.25 2.25 0 00-2.25-2.25H6.002a2.25 2.25 0 00-2.25 2.25v4.098m7.5-10.332v2.25m0 0v2.25m0-2.25h.008v.008H12v-.008z"
        />
      </svg>
    ),
    Task: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={iconStyles}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };
  return (
    <div className="absolute top-0 left-0 -ml-5 mt-1 h-10 w-10 flex items-center justify-center bg-white dark:bg-zinc-900 rounded-full border-2 border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400">
      {icons[type]}
    </div>
  );
};

interface ActivityLogProps {
  activityLogs: ActivityLog[];
  customers: Customer[];
  addActivityLog: (activity: Omit<ActivityLog, 'id' | 'created_at' | 'user_id'>) => void;
  defaultCustomerId?: string; // If provided, hides the customer selector
  showCustomerName?: boolean; // If true, shows customer name on timeline entries
}

const ActivityLogComponent: React.FC<ActivityLogProps> = ({
  activityLogs,
  customers,
  addActivityLog,
  defaultCustomerId,
  showCustomerName = false,
}) => {
  const [activityType, setActivityType] = useState<ActivityLog['type']>('Note');
  const [activityContent, setActivityContent] = useState('');
  const [activitySubject, setActivitySubject] = useState('');
  const [activityLink, setActivityLink] = useState('');
  const [activityAttendees, setActivityAttendees] = useState('');

  // This is new: We track the selected customer in state
  const [selectedCustomerId, setSelectedCustomerId] = useState(defaultCustomerId || '');

  // If a default customer is provided (like on CustomerDetail page), set it
  useEffect(() => {
    if (defaultCustomerId) {
      setSelectedCustomerId(defaultCustomerId);
    }
  }, [defaultCustomerId]);

  const groupedActivities = useMemo(() => {
    const sorted = [...activityLogs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const groups = sorted.reduce(
      (acc, activity) => {
        const dateStr = new Date(activity.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        if (!acc[dateStr]) {
          acc[dateStr] = [];
        }
        acc[dateStr].push(activity);
        return acc;
      },
      {} as Record<string, ActivityLog[]>
    );

    return Object.entries(groups);
  }, [activityLogs]);

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    // We now check selectedCustomerId from our state
    if (!activityContent.trim() || !selectedCustomerId) {
      // You could add a toast error here: "Please select a customer."
      return;
    }

    const newActivity: Omit<ActivityLog, 'id' | 'created_at' | 'user_id'> = {
      customer_id: selectedCustomerId, // Use the ID from state
      type: activityType,
      content: activityContent.trim(),
      date: new Date().toISOString(),
      ...(activitySubject.trim() && { subject: activitySubject.trim() }),
      ...(activityLink.trim() && { link: activityLink.trim() }),
      ...(activityAttendees.trim() && { attendees: activityAttendees.trim() }),
    };

    addActivityLog(newActivity);

    setActivityContent('');
    setActivitySubject('');
    setActivityLink('');
    setActivityAttendees('');
    setActivityType('Note');
    // Don't reset selectedCustomerId if it's not the default view
    if (!defaultCustomerId) {
      setSelectedCustomerId('');
    }
  };

  return (
    <div>
      <form onSubmit={handleAddActivity} className="mb-6 bg-slate-50 dark:bg-zinc-950 p-4 rounded-lg">
        <div className="flex items-center gap-1 p-1 mb-2 bg-slate-200 dark:bg-zinc-800 rounded-lg">
          {(['Note', 'Email', 'Call', 'Meeting'] as ActivityLog['type'][]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setActivityType(type)}
              className={`flex-1 py-1 px-2 text-sm rounded-md font-semibold transition-colors ${
                activityType === type
                  ? 'bg-white dark:bg-zinc-700 shadow-sm'
                  : 'hover:bg-slate-100 dark:hover:bg-zinc-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {/* This is the new Customer Selector! It only shows if no defaultCustomerId is provided */}
          {!defaultCustomerId && (
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
                Customer
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full p-2 border rounded-md bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-700"
                required
              >
                <option value="" disabled>
                  Select a customer...
                </option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(activityType === 'Email' || activityType === 'Meeting') && (
            <input
              value={activitySubject}
              onChange={(e) => setActivitySubject(e.target.value)}
              type="text"
              placeholder="Subject"
              className="w-full p-2 border rounded-md bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-700"
            />
          )}
          <textarea
            value={activityContent}
            onChange={(e) => setActivityContent(e.target.value)}
            rows={3}
            className="w-full p-2 border rounded-md bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-700"
            placeholder={`Add a ${activityType.toLowerCase()} summary...`}
            required
          />
          {activityType === 'Meeting' && (
            <>
              <input
                value={activityLink}
                onChange={(e) => setActivityLink(e.target.value)}
                type="text"
                placeholder="Meeting Link (optional)"
                className="w-full p-2 border rounded-md bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-700"
              />
              <input
                value={activityAttendees}
                onChange={(e) => setActivityAttendees(e.target.value)}
                type="text"
                placeholder="Attendees (comma-separated)"
                className="w-full p-2 border rounded-md bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-700"
              />
            </>
          )}
        </div>
        <div className="text-right mt-3">
          <button
            type="submit"
            className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-primary-700 transition-colors"
          >
            Add to Log
          </button>
        </div>
      </form>

      <div className="relative pl-5 max-h-96 overflow-y-auto">
        <div className="absolute left-0 top-6 h-full border-l-2 border-slate-200 dark:border-zinc-700"></div>
        {groupedActivities.length > 0 ? (
          groupedActivities.map(([dateStr, activities]) => (
            <div key={dateStr} className="relative mb-6">
              <h3 className="font-semibold text-slate-600 dark:text-zinc-400 mb-4 pl-8">
                {dateStr}
              </h3>
              {activities.map((activity) => {
                // This fulfills your request to show the customer name
                const customer =
                  showCustomerName && customers.find((c) => c.id === activity.customer_id);
                return (
                  <div key={activity.id} className="relative pl-8 pb-8">
                    <ActivityIcon type={activity.type} />
                    <p className="font-semibold text-sm flex items-baseline gap-2 flex-wrap">
                      <span>{activity.subject || activity.type}</span>
                      <span className="text-xs font-normal text-slate-500 dark:text-zinc-400">
                        {new Date(activity.date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {/* This is the new part! */}
                      {showCustomerName && customer && (
                        <span className="text-xs font-normal text-primary-600 dark:text-primary-400">
                          for {customer.name}
                        </span>
                      )}
                    </p>
                    <p className="text-slate-600 dark:text-zinc-300 whitespace-pre-wrap text-sm mt-1">
                      {activity.content}
                    </p>
                    {activity.link && (
                      <a
                        href={activity.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 dark:text-primary-400 text-sm hover:underline mt-1 inline-block"
                      >
                        Meeting Link
                      </a>
                    )}
                    {activity.attendees && (
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                        Attendees: {activity.attendees}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <p className="text-center text-slate-500 dark:text-zinc-400 py-8">
            No activity logged.
          </p>
        )}
      </div>
    </div>
  );
};

export default ActivityLogComponent;