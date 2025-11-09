


import React, { useState, useMemo } from 'react';
import { CalendarEvent, Task, Document } from '../types';

type View = 'month' | 'week' | 'day' | 'agenda';

interface CalendarProps {
    events: CalendarEvent[];
    tasks: Task[];
    documents: Document[];
    editDocument: (doc: Document) => void;
    addEvent: (event: Omit<CalendarEvent, 'id' | 'created_at' | 'user_id'>) => void;
    updateEvent: (event: CalendarEvent) => void;
    deleteEvent: (eventId: string) => void;
    updateTask: (task: Task) => void;
}

const Calendar: React.FC<CalendarProps> = ({ events, tasks, documents, editDocument, addEvent, updateEvent, deleteEvent, updateTask }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<View>('month');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [modalData, setModalData] = useState<{ title: string; start: string; end: string; color: string; meetingLink?: string; }>({ title: '', start: '', end: '', color: '#3b82f6', meetingLink: '' });
    const [copySuccess, setCopySuccess] = useState('');

    const handlePrev = () => {
        if (view === 'month') setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
        if (view === 'week') setCurrentDate(d => new Date(d.setDate(d.getDate() - 7)));
        if (view === 'day') setCurrentDate(d => new Date(d.setDate(d.getDate() - 1)));
    };
    
    const handleNext = () => {
        if (view === 'month') setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
        if (view === 'week') setCurrentDate(d => new Date(d.setDate(d.getDate() + 7)));
        if (view === 'day') setCurrentDate(d => new Date(d.setDate(d.getDate() + 1)));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const openModalForNew = (date: Date) => {
        setSelectedEvent(null);
        const start = new Date(date);
        start.setHours(new Date().getHours(), 0, 0, 0);
        const end = new Date(date);
        end.setHours(new Date().getHours() + 1, 0, 0, 0);
        setModalData({ title: '', start: formatDateTimeLocal(start), end: formatDateTimeLocal(end), color: '#3b82f6', meetingLink: '' });
        setIsModalOpen(true);
    };

    const openModalForEdit = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setModalData({ title: event.title, start: formatDateTimeLocal(new Date(event.start_time)), end: formatDateTimeLocal(new Date(event.end_time)), color: event.color, meetingLink: event.meeting_link || '' });
        setIsModalOpen(true);
    };

    const handleModalSave = () => {
        const { title, start, end, color, meetingLink } = modalData;
        if (!title || !start || !end) {
            alert('Please fill in all fields.');
            return;
        }

        const eventData = { title, start_time: new Date(start).toISOString(), end_time: new Date(end).toISOString(), color, meeting_link: meetingLink?.trim() ? meetingLink.trim() : undefined };
        
        if (selectedEvent) {
            updateEvent({ ...selectedEvent, ...eventData });
        } else {
            addEvent(eventData);
        }
        setIsModalOpen(false);
    };

    const handleModalDelete = () => {
        if (selectedEvent) {
            deleteEvent(selectedEvent.id);
        }
        setIsModalOpen(false);
    }
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Failed');
        });
    };
    
    return (
        <div className="flex flex-col h-full bg-slate-100 dark:bg-zinc-950 text-slate-800 dark:text-slate-200">
            <header className="p-4 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex-shrink-0 z-10 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-50 w-48">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
                        <div className="flex items-center gap-1">
                            <button onClick={handlePrev} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800" title="Previous"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg></button>
                            <button onClick={handleNext} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800" title="Next"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg></button>
                        </div>
                        <button onClick={handleToday} className="px-4 py-2 text-sm font-semibold rounded-md border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">Today</button>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-200 dark:bg-zinc-800 p-1 rounded-lg">
                        {(['month', 'week', 'day', 'agenda'] as View[]).map(v => (
                            <button key={v} onClick={() => setView(v)} className={`px-3 py-1 text-sm font-semibold rounded-md capitalize transition-colors ${view === v ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-zinc-600'}`}>{v}</button>
                        ))}
                    </div>
                </div>
            </header>
            <div className="flex-1 flex overflow-hidden">
                <main className="flex-1 flex flex-col overflow-auto bg-white dark:bg-zinc-900">
                    {view === 'month' && <MonthView date={currentDate} events={events} tasks={tasks} documents={documents} onDayClick={openModalForNew} onEventClick={openModalForEdit} onTaskClick={updateTask} onDocumentClick={editDocument} />}
                    {view === 'agenda' && <AgendaView date={currentDate} events={events} tasks={tasks} onEventClick={openModalForEdit} onTaskClick={updateTask} />}
                    {view === 'day' && <p className="p-8 text-center text-slate-500">Day View Coming Soon</p>}
                    {view === 'week' && <p className="p-8 text-center text-slate-500">Week View Coming Soon</p>}
                </main>
            </div>
            
            {isModalOpen && (
                 <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-zinc-50">{selectedEvent ? 'Edit Event' : 'New Event'}</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">Title</label>
                                    <input type="text" value={modalData.title} onChange={e => setModalData(d => ({...d, title: e.target.value}))} className="w-full p-2 border rounded-md bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 focus:ring-primary-500 focus:border-primary-500" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">Start</label>
                                        <input type="datetime-local" value={modalData.start} onChange={e => setModalData(d => ({...d, start: e.target.value}))} className="w-full p-2 border rounded-md bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 focus:ring-primary-500 focus:border-primary-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">End</label>
                                        <input type="datetime-local" value={modalData.end} onChange={e => setModalData(d => ({...d, end: e.target.value}))} className="w-full p-2 border rounded-md bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 focus:ring-primary-500 focus:border-primary-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">Color</label>
                                    <input type="color" value={modalData.color} onChange={e => setModalData(d => ({...d, color: e.target.value}))} className="w-full p-1 h-10 border rounded-md bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">Video Meeting Link</label>
                                    <div className="flex items-center gap-2">
                                        <input type="url" placeholder="Paste meeting link here..." value={modalData.meetingLink || ''} onChange={e => setModalData(d => ({...d, meetingLink: e.target.value}))} className="flex-1 w-full p-2 border rounded-md bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 focus:ring-primary-500 focus:border-primary-500" />
                                        {modalData.meetingLink && <button onClick={() => copyToClipboard(modalData.meetingLink!)} className="p-2 text-xs font-semibold rounded bg-slate-200 dark:bg-zinc-700 flex-shrink-0">{copySuccess || 'Copy'}</button>}
                                    </div>
                                    <div className="mt-2 flex gap-2">
                                        <button type="button" onClick={() => window.open('https://meet.new', '_blank')} className="flex-1 p-2 text-sm font-semibold rounded-md bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600">Create Google Meet</button>
                                        <button type="button" onClick={() => window.open('https://zoom.us/start/meeting', '_blank')} className="flex-1 p-2 text-sm font-semibold rounded-md bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600">Create Zoom Meeting</button>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Create a meeting in a new tab and paste the link above.</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 dark:bg-zinc-800 flex justify-between rounded-b-lg">
                            <div>{selectedEvent && <button onClick={handleModalDelete} className="px-4 py-2 rounded-md font-semibold text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">Delete</button>}</div>
                            <div className="flex gap-2">
                                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-md font-semibold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">Cancel</button>
                                <button onClick={handleModalSave} className="px-4 py-2 rounded-md font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors">Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MonthView: React.FC<{date: Date, events: CalendarEvent[], tasks: Task[], documents: Document[], onDayClick: (date: Date) => void, onEventClick: (event: CalendarEvent) => void, onTaskClick: (task: Task) => void, onDocumentClick: (doc: Document) => void}> = ({ date, events, tasks, documents, onDayClick, onEventClick, onTaskClick, onDocumentClick }) => {
    const days = useMemo(() => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const daysArray = [];
        for (let i = 0; i < firstDay; i++) daysArray.push({ date: null });
        for (let i = 1; i <= daysInMonth; i++) daysArray.push({ date: new Date(year, month, i) });
        return daysArray;
    }, []);

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="grid grid-cols-7 flex-1">
            {weekDays.map(day => <div key={day} className="p-2 text-center text-xs font-bold uppercase text-slate-500 dark:text-zinc-400 border-r border-b border-slate-200 dark:border-zinc-800">{day}</div>)}
            {days.map((day, i) => {
                const dayEvents = day.date ? events.filter(e => isSameDay(new Date(e.start_time), day.date!)) : [];
                const dayTasks = day.date ? tasks.filter(t => t.due_date && isSameDay(new Date(t.due_date), day.date!)) : [];
                const dayDocs = day.date ? documents.filter(d => d.due_date && isSameDay(new Date(d.due_date), day.date!)) : [];


                return (
                    <div key={i} onClick={() => day.date && onDayClick(day.date)} className="relative border-r border-b border-slate-200 dark:border-zinc-800 p-1 min-h-[120px] transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800/50">
                        {day.date && <span className={`text-sm font-medium ${isSameDay(day.date, new Date()) ? 'bg-primary-600 text-white rounded-full h-6 w-6 flex items-center justify-center' : 'text-slate-600 dark:text-zinc-300'}`}>{day.date.getDate()}</span>}
                        <div className="mt-1 space-y-1 overflow-hidden">
                            {dayEvents.map(event => (
                                <button key={`evt-${event.id}`} onClick={(e) => { e.stopPropagation(); onEventClick(event); }} className="w-full text-left text-xs p-1 rounded text-white truncate flex items-center gap-1" style={{ backgroundColor: event.color }}>
                                    {event.meeting_link && <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 001.553.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>}
                                    <span className="font-semibold">{event.title}</span>
                                </button>
                            ))}
                             {dayDocs.map(doc => (
                                <button key={`doc-${doc.id}`} onClick={(e) => { e.stopPropagation(); onDocumentClick(doc); }} className="w-full text-left text-xs p-1 rounded truncate flex items-center gap-1.5 bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span className="font-semibold">DUE: {doc.doc_number}</span>
                                </button>
                            ))}
                            {dayTasks.map(task => (
                                <button key={`task-${task.id}`} onClick={(e) => { e.stopPropagation(); onTaskClick({...task, completed: !task.completed})}} className={`w-full text-left text-xs p-1 rounded truncate flex items-center gap-1.5 ${task.completed ? 'bg-slate-100 text-slate-500 line-through dark:bg-zinc-800' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span>{task.text}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    );
};

const AgendaView: React.FC<{date: Date, events: CalendarEvent[], tasks: Task[], onEventClick: (event: CalendarEvent) => void, onTaskClick: (task: Task) => void}> = ({date, events, tasks, onEventClick, onTaskClick}) => {
    const groupedItems = useMemo(() => {
        const items: { date: Date, event?: CalendarEvent, task?: Task }[] = [
            ...events.map(e => ({ date: new Date(e.start_time), event: e })),
            ...tasks.filter(t => t.due_date).map(t => ({ date: new Date(new Date(t.due_date!).setHours(9)), task: t }))
        ];

        const sorted = items.sort((a,b) => a.date.getTime() - b.date.getTime());

        const grouped = sorted.reduce((acc, item) => {
            const dateStr = item.date.toISOString().split('T')[0];
            if (!acc[dateStr]) acc[dateStr] = [];
            acc[dateStr].push(item);
            return acc;
        }, {} as Record<string, { date: Date, event?: CalendarEvent, task?: Task }[]>);

        return Object.entries(grouped);
    }, [date, events, tasks]);
    
    return (
         <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {groupedItems.length > 0 ? groupedItems.map(([dateStr, items]) => (
                <div key={dateStr}>
                    <h3 className="font-bold text-lg mb-3 pb-2 border-b border-slate-200 dark:border-zinc-800">
                        {new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h3>
                    <div className="space-y-3">
                        {items.map((item, index) => item.event ? (
                            <button key={`evt-${item.event.id}-${index}`} onClick={() => onEventClick(item.event!)} className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                                <div className="w-1.5 h-10 rounded-full flex-shrink-0" style={{backgroundColor: item.event.color}}></div>
                                <div className="text-left">
                                    <p className="font-semibold flex items-center gap-2 text-slate-800 dark:text-zinc-100">{item.event.title}</p>
                                    <p className="text-sm text-slate-500 dark:text-zinc-400">{new Date(item.event.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(item.event.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                            </button>
                        ) : (
                             <button key={`tsk-${item.task!.id}-${index}`} onClick={() => onTaskClick({...item.task!, completed: !item.task!.completed})} className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                                <div className="w-1.5 h-10 rounded-full flex-shrink-0 bg-amber-400"></div>
                                <div className="text-left">
                                    <p className={`font-semibold text-slate-800 dark:text-zinc-100 ${item.task!.completed ? 'line-through' : ''}`}>{item.task!.text}</p>
                                    <p className="text-sm text-slate-500 dark:text-zinc-400">Task</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )) : <p className="text-center text-slate-500 py-16">No upcoming events or tasks.</p>}
        </div>
    )
};


// Helpers
const isSameDay = (d1: Date, d2: Date) => {
    // A simple date comparison that ignores time and timezone differences.
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
}

const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default Calendar;