import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthPage: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLoginView) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        // Fix: Added redirectTo option to the signUp call.
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.href, // This is the magic line!
          },
        });
        if (error) throw error;
        setMessage('Check your email for the confirmation link!');
      }
    } catch (error: unknown) {
      setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400">InvoicyCRM</h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-2">
            {isLoginView ? 'Welcome back! Please sign in.' : 'Create your account to get started.'}
          </p>
        </div>

        <div className="flex border border-slate-200 dark:border-zinc-700 rounded-lg p-1 mb-6">
          <button
            onClick={() => setIsLoginView(true)}
            className={`w-1/2 p-2 rounded-md font-semibold transition-colors ${isLoginView ? 'bg-primary-500 text-white shadow' : 'text-slate-500 dark:text-zinc-400'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLoginView(false)}
            className={`w-1/2 p-2 rounded-md font-semibold transition-colors ${!isLoginView ? 'bg-primary-500 text-white shadow' : 'text-slate-500 dark:text-zinc-400'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleAuthAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border rounded-lg bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border rounded-lg bg-slate-50 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition-colors disabled:bg-primary-300"
          >
            {loading ? 'Processing...' : isLoginView ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}
        {message && <p className="mt-4 text-center text-sm text-green-500">{message}</p>}
      </div>
    </div>
  );
};

export default AuthPage;
