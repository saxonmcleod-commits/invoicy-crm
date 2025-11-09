import React from 'react';
import { NavLink } from 'react-router-dom';

const NavIcon: React.FC<{ path: string }> = ({ path }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  clearActiveDocuments: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  clearActiveDocuments,
  isDarkMode,
  setIsDarkMode,
}) => {
  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      iconPath:
        'M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 1.5m1-1.5l1 1.5m0 0l.5 1.5m-1.5-1.5l-1.5-1.5m0 0l1.5 1.5m-1.5-1.5l-1.5-1.5m-6.75 12.75h16.5',
    },
    {
      to: '/new',
      label: 'New Document',
      iconPath:
        'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
      action: clearActiveDocuments,
    },
    {
      to: '/files',
      label: 'Files',
      iconPath:
        'M3.75 9.75h16.5v11.25a2.25 2.25 0 01-2.25 2.25h-12a2.25 2.25 0 01-2.25-2.25V9.75zM3.75 9.75A2.25 2.25 0 001.5 7.5v-2.25A2.25 2.25 0 013.75 3h16.5a2.25 2.25 0 012.25 2.25v2.25a2.25 2.25 0 00-2.25 2.25H3.75z',
    },
    {
      to: '/crm',
      label: 'CRM',
      iconPath:
        'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z',
    },
    {
      to: '/productivity-hub',
      label: 'Productivity',
      iconPath:
        'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
    },
    {
      to: '/projects',
      label: 'Projects',
      iconPath:
        'M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z',
    },
    {
      to: '/bills-and-expenses',
      label: 'Bills & Expenses',
      iconPath:
        'M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-1.5h5.25m-5.25 0h5.25m0 0h5.25m-5.25 0h5.25M3.75 6H7.5v3.75H3.75V6zM3.75 14.25H7.5v3.75H3.75v-3.75z',
    },
    {
      to: '/calendar',
      label: 'Calendar',
      iconPath:
        'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18',
    },
  ];

  const linkClasses = 'flex items-center space-x-3 p-3 rounded-lg transition-colors';
  const activeLinkClasses = 'bg-primary-500 text-white';
  const inactiveLinkClasses = 'text-slate-300 hover:bg-slate-800 hover:text-white';

  const handleLinkClick = (action?: () => void) => {
    if (action) action();
    onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <aside
        className={`w-64 bg-slate-900 dark:bg-black p-4 flex-shrink-0 border-r border-slate-700 dark:border-zinc-800 flex flex-col fixed md:relative z-40 h-full transform transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="flex items-center space-x-2 p-3 mb-6">
          <div className="bg-primary-500 rounded-lg p-2 text-white">
            <NavIcon path="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12" />
          </div>
          <h1 className="text-2xl font-bold text-white">InvoicyCRM</h1>
        </div>
        <nav className="flex flex-col space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => handleLinkClick(item.action)}
              className={({ isActive }) =>
                `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
              }
            >
              <NavIcon path={item.iconPath} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto">
          <nav className="flex flex-col space-y-2 py-4 border-t border-slate-700 dark:border-zinc-800">
            <NavLink
              to="/settings"
              onClick={() => handleLinkClick()}
              className={({ isActive }) =>
                `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
              }
            >
              <NavIcon path="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.004.827c-.292.24-.437.613-.43.992a6.759 6.759 0 010 1.255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.333.183-.582.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613-.43.992a6.759 6.759 0 010-1.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.49l1.217.456c.355.133.75.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.213-1.28zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <span className="font-medium">Settings</span>
            </NavLink>
          </nav>
          <div className="p-3 mb-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="darkModeToggle"
                className="text-slate-300 font-medium flex items-center gap-2"
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
                    d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                  />
                </svg>
                Dark Mode
              </label>
              <button
                id="darkModeToggle"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isDarkMode ? 'bg-primary-600' : 'bg-slate-700'}`}
              >
                <span className="sr-only">Toggle Dark Mode</span>
                <span
                  className={`inline-flex items-center justify-center transform transition-transform duration-200 ease-in-out h-4 w-4 rounded-full bg-white shadow ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`}
                >
                  {isDarkMode ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-primary-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-slate-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.706-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm-.707 10.607a1 1 0 011.414 0l.707-.707a1 1 0 11-1.414-1.414l-.707.707zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </span>
              </button>
            </div>
          </div>
          <div className="p-4 bg-slate-950 dark:bg-black/50 rounded-lg text-center">
            <p className="text-sm text-slate-400">© 2024 InvoicyCRM</p>
            <p className="text-xs text-slate-500 mt-1">All rights reserved.</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
