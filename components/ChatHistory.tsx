import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ChatSession, ChatMessage } from '../types';

// FIX: Declare `process` to use `process.env.API_KEY` as per Gemini API guidelines.
declare const process: {
    env: {
        API_KEY: string;
    }
};

// Helper to format dates
const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
        return "Today";
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

interface ChatHistoryProps {
    sessions: ChatSession[];
    addSession: (session: Omit<ChatSession, 'id'>) => ChatSession;
    updateSession: (session: ChatSession) => void;
    deleteSession: (sessionId: string) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ sessions, addSession, updateSession, deleteSession }) => {
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeSession = sessions.find(s => s.id === activeSessionId);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeSession?.messages, isLoading]);

    const handleNewChat = () => {
        const newSessionData = {
            title: 'New Chat',
            createdAt: new Date().toISOString(),
            messages: [],
        };
        const newSession = addSession(newSessionData);
        setActiveSessionId(newSession.id);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentMessage.trim() || !activeSessionId || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: currentMessage.trim() };
        const tempMessage = currentMessage;
        setCurrentMessage('');
        setIsLoading(true);
        
        const currentSession = sessions.find(s => s.id === activeSessionId);
        if (!currentSession) {
            setIsLoading(false);
            return;
        }

        const updatedMessages = [...currentSession.messages, userMessage];
        updateSession({ ...currentSession, messages: updatedMessages });

        try {
            // FIX: Use `process.env.API_KEY` as per the Gemini API guidelines, which resolves the original `import.meta.env` error.
            const apiKey = process.env.API_KEY;
            if (!apiKey) {
                // FIX: Updated error message to reflect the use of process.env.API_KEY.
                throw new Error("Gemini API key is not configured in API_KEY environment variable.");
            }
            
            const ai = new GoogleGenAI({ apiKey });
            const chat: Chat = ai.chats.create({
                model: 'gemini-2.5-flash',
                history: currentSession.messages.map(m => ({
                    role: m.role,
                    parts: [{ text: m.content }],
                })),
            });

            const response: GenerateContentResponse = await chat.sendMessage({ message: userMessage.content });
            const modelMessage: ChatMessage = { role: 'model', content: response.text };
            
            const finalSession = {
                ...currentSession,
                messages: [...updatedMessages, modelMessage]
            };
            
            if (currentSession.messages.length === 0) {
                 const titleResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Generate a short, concise title (4 words max) for this user prompt: "${tempMessage}"`,
                });
                finalSession.title = titleResponse.text.replace(/"/g, '').trim();
            }
            updateSession(finalSession);
        } catch (error) {
            console.error("Error with Gemini API:", error);
            const errorMessage: ChatMessage = { role: 'model', content: 'Sorry, I ran into an issue. Please check your connection or API key and try again.' };
            updateSession({ ...currentSession, messages: [...updatedMessages, errorMessage] });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDelete = (sessionId: string) => {
        if(window.confirm('Are you sure you want to delete this chat?')) {
            deleteSession(sessionId);
            if (activeSessionId === sessionId) {
                setActiveSessionId(sessions.length > 1 ? sessions.find(s => s.id !== sessionId)!.id : null);
            }
        }
    };

    return (
        <div className="flex h-full bg-slate-100 dark:bg-zinc-950">
            <aside className="w-full sm:w-1/3 max-w-xs bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-zinc-800">
                    <button onClick={handleNewChat} className="w-full bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        New Chat
                    </button>
                </div>
                <nav className="flex-1 overflow-y-auto">
                    {sessions.length > 0 ? (
                        sessions.map(session => (
                            <div key={session.id} className={`group flex items-center justify-between p-4 cursor-pointer border-l-4 ${activeSessionId === session.id ? 'border-primary-500 bg-slate-100 dark:bg-zinc-800' : 'border-transparent hover:bg-slate-50 dark:hover:bg-zinc-800/50'}`} onClick={() => setActiveSessionId(session.id)}>
                                <div className="truncate">
                                    <p className="font-semibold text-sm truncate text-slate-800 dark:text-zinc-100">{session.title}</p>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400">{formatDate(session.createdAt)}</p>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(session.id); }} className="p-1 rounded-full text-slate-400 dark:text-zinc-500 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="p-4 text-center text-sm text-slate-500 dark:text-zinc-400">No chat history. Start a new chat!</p>
                    )}
                </nav>
            </aside>
            <main className="flex-1 flex flex-col">
                {activeSession ? (
                    <>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {activeSession.messages.map((message, index) => (
                                <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                                    {message.role === 'model' && (
                                        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white flex-shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009.169 16V4.697l-4.945-1.414A1 1 0 002.5 4.962l7-14zM10 4.697v11.304l4.945 1.414a1 1 0 001.169-1.409l-7-14a1 1 0 00-.28-1.153z" /></svg>
                                        </div>
                                    )}
                                     <div className={`max-w-xl p-3 rounded-lg whitespace-pre-wrap ${message.role === 'user' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-zinc-800'}`}>
                                        {message.content}
                                    </div>
                                    {message.role === 'user' && (
                                        <img className="w-8 h-8 rounded-full flex-shrink-0" src="https://i.pravatar.cc/40?u=user" alt="User avatar" />
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009.169 16V4.697l-4.945-1.414A1 1 0 002.5 4.962l7-14zM10 4.697v11.304l4.945 1.414a1 1 0 001.169-1.409l-7-14a1 1 0 00-.28-1.153z" /></svg>
                                    </div>
                                    <div className="max-w-xl p-3 rounded-lg bg-white dark:bg-zinc-800 flex items-center space-x-1">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={currentMessage}
                                    onChange={e => setCurrentMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 p-3 border rounded-lg bg-slate-100 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    disabled={isLoading}
                                />
                                <button type="submit" disabled={isLoading || !currentMessage.trim()} className="p-3 bg-primary-600 text-white rounded-lg disabled:bg-primary-300 dark:disabled:bg-primary-800 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100">Welcome to Chat History</h2>
                        <p className="text-slate-500 dark:text-zinc-400 mt-2">Select a chat from the side to view it, or start a new one.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ChatHistory;