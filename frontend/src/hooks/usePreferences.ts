import { useState, useEffect } from 'react';
import api from '../lib/api';
import type { TravelPreferences } from '../types/preferences';
import { useAuthStore } from '../store/authStore';

export const usePreferences = () => {
    const { user } = useAuthStore();
    const [preferences, setPreferences] = useState<TravelPreferences | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPreferences = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get('/preferences');
            setPreferences(data);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPreferences();
    }, [user]);

    const updatePreferences = async (updates: Partial<TravelPreferences>) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.put('/preferences', updates);
            setPreferences(data);
            return data;
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { preferences, loading, error, updatePreferences, fetchPreferences };
};
