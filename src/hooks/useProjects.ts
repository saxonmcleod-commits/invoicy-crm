import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Project } from '../types';
import { useAuth } from '../AuthContext';

export const useProjects = () => {
    const { session } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = useCallback(async () => {
        if (!session?.user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProjects(data || []);
        } catch (err: any) {
            console.error('Error fetching projects:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [session]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const addProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'user_id'>) => {
        if (!session?.user) return;
        try {
            const { data, error } = await supabase
                .from('projects')
                .insert([{ ...projectData, user_id: session.user.id }])
                .select()
                .single();

            if (error) throw error;
            setProjects((prev) => [data, ...prev]);
            return data;
        } catch (err: any) {
            console.error('Error adding project:', err);
            throw err;
        }
    };

    const updateProject = async (project: Project) => {
        try {
            const { error } = await supabase
                .from('projects')
                .update(project)
                .eq('id', project.id);

            if (error) throw error;
            setProjects((prev) =>
                prev.map((p) => (p.id === project.id ? project : p))
            );
        } catch (err: any) {
            console.error('Error updating project:', err);
            throw err;
        }
    };

    const deleteProject = async (id: string) => {
        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setProjects((prev) => prev.filter((p) => p.id !== id));
        } catch (err: any) {
            console.error('Error deleting project:', err);
            throw err;
        }
    };

    return {
        projects,
        loading,
        error,
        addProject,
        updateProject,
        deleteProject,
        refreshProjects: fetchProjects,
    };
};
