import React from 'react';

const Projects: React.FC = () => {
  return (
    <div className="space-y-8 h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white dark:bg-zinc-900 p-10 rounded-xl shadow-sm text-center">
        <h2 className="text-xl font-semibold text-slate-700 dark:text-zinc-300">Coming Soon!</h2>
        <p className="text-slate-500 dark:text-zinc-400 mt-2">
          This section for managing your projects is currently under construction.
        </p>
      </div>
    </div>
  );
};

export default Projects;
