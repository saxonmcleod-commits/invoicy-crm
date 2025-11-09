import React from 'react';
import { Link } from 'react-router-dom';

const TemplateCard: React.FC<{
  to: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}> = ({ to, title, description, icon }) => (
  <Link
    to={to}
    className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm hover:shadow-lg hover:scale-105 transform transition-all duration-300 group"
  >
    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/50 mb-4 transition-colors group-hover:bg-primary-200 dark:group-hover:bg-primary-800">
      {icon}
    </div>
    <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-50 mb-2">{title}</h2>
    <p className="text-slate-500 dark:text-zinc-400">{description}</p>
    <div className="mt-4 text-primary-600 dark:text-primary-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
      Create Now &rarr;
    </div>
  </Link>
);

const NewDocument: React.FC = () => {
  return (
    <div className="space-y-8 h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <p className="text-lg text-slate-600 dark:text-zinc-400">
        Choose a template to get started. Each one is designed for a specific purpose.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
        <TemplateCard
          to="/editor"
          title="Invoice or Quote"
          description="Create professional invoices and quotes for your clients with customizable line items, tax, and totals."
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-primary-600 dark:text-primary-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        />
        <TemplateCard
          to="/letter-editor"
          title="Business Letter"
          description="Write and format professional business correspondence for clients, partners, and official communications."
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-primary-600 dark:text-primary-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          }
        />
      </div>
    </div>
  );
};

export default NewDocument;
