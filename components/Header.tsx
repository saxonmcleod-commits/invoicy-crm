import React from 'react';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
  setIsSidebarOpen: (isOpen: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const Header: React.FC<HeaderProps> = ({ setIsSidebarOpen, searchTerm, setSearchTerm }) => {
  const location = useLocation();

  const pageInfo: { [key: string]: { title: string; subtitle: string } } = {
    '/dashboard': {
      title: 'Dashboard',
      subtitle: "Welcome back! Here's a summary of your business.",
    },
    '/new': { title: 'New Document', subtitle: 'Choose a template to get started.' },
    '/files': { title: 'All Files', subtitle: 'Browse and manage all your documents.' },
    '/crm': { title: 'Customer Management', subtitle: 'View and manage your customer list.' },
    '/projects': { title: 'Projects', subtitle: 'Manage your ongoing projects.' },
    '/bills-and-expenses': {
      title: 'Bills & Expenses',
      subtitle: 'Track your bills and company expenses.',
    },
    '/calendar': { title: 'Calendar', subtitle: 'View your schedule and events.' },
    '/settings': { title: 'Settings', subtitle: 'Configure your application and company details.' },
    '/editor': { title: 'Document Editor', subtitle: 'Create or edit an invoice or quote.' },
    '/letter-editor': { title: 'Letter Editor', subtitle: 'Create or edit a business letter.' },
  };

  const getPageInfo = (pathname: string) => {
    if (pathname.startsWith('/crm/'))
      return { title: 'Customer Details', subtitle: 'View customer history and activity.' };
    const key = Object.keys(pageInfo).find((key) => pathname.startsWith(key));
    return key ? pageInfo[key] : { title: 'InvoicyCRM', subtitle: '' };
  };

  const { title, subtitle } = getPageInfo(location.pathname);

  return (
    <header className="flex-shrink-0 bg-slate-900 dark:bg-black border-b border-slate-700 dark:border-zinc-800 grid grid-cols-3 items-center p-3 gap-4 z-10 text-white">
      {/* Left side: Title and mobile toggle */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden p-2 rounded-md text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-white truncate">{title}</h1>
          {subtitle && (
            <p className="text-xs text-slate-400 hidden sm:block truncate">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Center: Search bar */}
      <div className="flex justify-center px-4">
        <div className="w-full max-w-md relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border rounded-lg bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Right side: Actions and User */}
      <div className="flex items-center justify-end gap-2 sm:gap-4">
        <button className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>

        <div className="flex items-center gap-1 sm:gap-2 text-slate-300">
          <button className="p-2 rounded-full hover:bg-slate-800 hover:text-white relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
            <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-900 dark:ring-black"></span>
          </button>
          <button className="p-2 rounded-full hover:bg-slate-800 hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.004.827c-.292.24-.437.613-.43.992a6.759 6.759 0 010 1.255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.333.183-.582.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613-.43.992a6.759 6.759 0 010-1.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.49l1.217.456c.355.133.75.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.213-1.28zM15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>

        <div className="h-6 w-px bg-slate-700 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <img
            className="w-8 h-8 rounded-full"
            src="https://i.pravatar.cc/40?u=user"
            alt="User avatar"
          />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-white">Saxon</p>
            <p className="text-xs text-slate-400">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
