import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export const useGoogleCalendar = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const connectGoogle = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    scopes: 'https://www.googleapis.com/auth/calendar.events',
                    redirectTo: window.location.origin + '/settings', // Redirect back to settings
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createMeeting = useCallback(async (title: string, startTime: string, endTime: string) => {
        setLoading(true);
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session || !session.provider_token) {
                throw new Error('No Google provider token found. Please reconnect your Google account.');
            }

            const event = {
                summary: title,
                start: { dateTime: startTime },
                end: { dateTime: endTime },
                conferenceData: {
                    createRequest: {
                        requestId: Math.random().toString(36).substring(7),
                        conferenceSolutionKey: { type: 'hangoutsMeet' },
                    },
                },
            };

            const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.provider_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Failed to create Google Meet event');
            }

            const data = await response.json();
            return data.hangoutLink; // Return the Google Meet link
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        connectGoogle,
        createMeeting,
        loading,
        error,
    };
};
