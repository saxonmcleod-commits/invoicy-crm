import React, { useState } from 'react';
import { Project, ProjectLink, ProjectChecklistItem } from '../types';

interface ProjectsProps {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'created_at' | 'user_id'>) => Promise<any>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

// --- Project Card Component ---
const ProjectCard: React.FC<{ project: Project; onUpdate: (p: Project) => void; onDelete: (id: string) => void }> = ({ project, onUpdate, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusColors = {
    'Not Started': 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400',
    'In Progress': 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    'Completed': 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    'On Hold': 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  };

  return (
    <div
      className="relative h-80 z-10"
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className={`absolute top-0 left-0 w-full h-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm overflow-hidden transition-all duration-300 ease-out ${isExpanded ? 'w-[120%] h-[140%] z-50 shadow-2xl scale-105' : ''}`}>
        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-zinc-100 mb-1">{project.name}</h3>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColors[project.status]}`}>
                {project.status}
              </span>
            </div>
            {/* Options (Delete) */}
            <button onClick={() => onDelete(project.id)} className="text-slate-400 hover:text-red-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>

          {/* Description */}
          <p className="text-slate-600 dark:text-zinc-400 text-sm mb-4 line-clamp-2">{project.description}</p>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tech_stack.slice(0, 3).map((tech, i) => (
              <span key={i} className="text-xs bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 px-2 py-1 rounded">
                {tech}
              </span>
            ))}
            {project.tech_stack.length > 3 && (
              <span className="text-xs text-slate-500 dark:text-zinc-500 px-1 py-1">+{project.tech_stack.length - 3}</span>
            )}
          </div>

          {/* Dates */}
          <div className="mt-auto text-xs text-slate-500 dark:text-zinc-500">
            <p>Start: {new Date(project.start_date).toLocaleDateString()}</p>
            {project.end_date && <p>End: {new Date(project.end_date).toLocaleDateString()}</p>}
          </div>

          {/* Expanded Content: TRACK */}
          <div className={`mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200 mb-3">Track Project</h4>
            <div className="space-y-2">
              <div className="bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-lg">
                <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Notes</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-3">{project.notes || 'No notes yet.'}</p>
              </div>
              <div className="flex gap-2">
                {project.links.map(link => (
                  <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded hover:underline">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trigger Icon */}
        <div
          className={`absolute top-4 right-4 z-[60] transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-100'}`}
          onMouseEnter={() => setIsExpanded(true)}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border border-white/20 backdrop-blur-md cursor-pointer transition-all duration-700 ease-out bg-gradient-to-br from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 ${isExpanded ? 'rotate-180 scale-110' : 'hover:rotate-180 hover:scale-110'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- New Project Modal (Wizard) ---
const NewProjectModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (p: any) => void }> = ({ isOpen, onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goals: '',
    tech_stack: [] as string[],
    tools: [] as string[],
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    status: 'Not Started',
    notes: '',
    links: [] as ProjectLink[],
    checklist: [] as ProjectChecklistItem[],
  });

  const [currentTech, setCurrentTech] = useState('');
  const [currentTool, setCurrentTool] = useState('');

  if (!isOpen) return null;

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);
  const handleSubmit = () => {
    onSave(formData);
    onClose();
    setStep(1);
    setFormData({
      name: '', description: '', goals: '', tech_stack: [], tools: [], start_date: new Date().toISOString().split('T')[0], end_date: '', status: 'Not Started', notes: '', links: [], checklist: []
    });
  };

  const addTech = () => {
    if (currentTech) {
      setFormData(prev => ({ ...prev, tech_stack: [...prev.tech_stack, currentTech] }));
      setCurrentTech('');
    }
  };

  const addTool = () => {
    if (currentTool) {
      setFormData(prev => ({ ...prev, tools: [...prev.tools, currentTool] }));
      setCurrentTool('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-800/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100">Create New Project</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400">Step {step} of 4: {['What', 'How', 'When', 'Track'][step - 1]}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto flex-1">
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-lg font-semibold text-primary-600">1. What are you making?</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Project Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Invoicy CRM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Description</label>
                <textarea
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all h-24 resize-none"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Briefly describe what this project is about..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Goals</label>
                <textarea
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all h-24 resize-none"
                  value={formData.goals}
                  onChange={e => setFormData({ ...formData, goals: e.target.value })}
                  placeholder="What do you want to achieve?"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-lg font-semibold text-primary-600">2. How are you making it?</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Tech Stack</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-primary-500 outline-none"
                    value={currentTech}
                    onChange={e => setCurrentTech(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTech()}
                    placeholder="Add technology (e.g., React, Node.js)"
                  />
                  <button onClick={addTech} className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700">+</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tech_stack.map((tech, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-sm">{tech}</span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Tools</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-primary-500 outline-none"
                    value={currentTool}
                    onChange={e => setCurrentTool(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTool()}
                    placeholder="Add tool (e.g., Figma, VS Code)"
                  />
                  <button onClick={addTool} className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700">+</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tools.map((tool, i) => (
                    <span key={i} className="px-3 py-1 bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 rounded-full text-sm">{tool}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-lg font-semibold text-primary-600">3. When are you making it?</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-primary-500 outline-none"
                    value={formData.start_date}
                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-primary-500 outline-none"
                    value={formData.end_date}
                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Initial Status</label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-primary-500 outline-none"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-lg font-semibold text-primary-600">4. Track your project</h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400">Add some initial notes to get started. You can add more links and checklists later.</p>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Initial Notes</label>
                <textarea
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all h-32 resize-none"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Jot down some initial thoughts or a todo list..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-zinc-800 flex justify-between bg-slate-50/50 dark:bg-zinc-800/50">
          {step > 1 ? (
            <button onClick={handleBack} className="px-6 py-2 text-slate-600 dark:text-zinc-300 font-medium hover:bg-slate-100 dark:hover:bg-zinc-700 rounded-lg transition-colors">
              Back
            </button>
          ) : <div></div>}

          {step < 4 ? (
            <button onClick={handleNext} className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30">
              Next Step
            </button>
          ) : (
            <button onClick={handleSubmit} className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-500/30">
              Create Project
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main Projects Component ---
const Projects: React.FC<ProjectsProps> = ({ projects, addProject, updateProject, deleteProject }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">Projects</h1>
          <p className="text-slate-500 dark:text-zinc-400">Manage your ideas from conception to completion.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Project
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700">
          <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-800 dark:text-zinc-200">No projects yet</h3>
          <p className="text-slate-500 dark:text-zinc-400 mb-6">Start by defining what you want to build.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Create your first project &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onUpdate={updateProject}
              onDelete={deleteProject}
            />
          ))}
        </div>
      )}

      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addProject}
      />
    </div>
  );
};

export default Projects;
