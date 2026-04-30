import { useState, useEffect } from 'react';
import api from '../lib/api';
import type { Trip } from '../types/trip';
import { useAuthStore } from '../store/authStore';

export const useTrips = () => {
    const { user } = useAuthStore();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTrips = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get('/trips');
            setTrips(data);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrips();
    }, [user]);

    const saveTrip = async (tripData: Partial<Trip>) => {
        try {
            const { data } = await api.post('/trips', tripData);
            setTrips(prev => [data, ...prev]);
            return data;
        } catch (err: any) {
            throw err;
        }
    };

    const toggleFavorite = async (id: string) => {
        try {
            const { data } = await api.put(`/trips/${id}/favorite`);
            setTrips(prev => prev.map(t => t._id === id ? data : t));
        } catch (err) {
            console.error('Failed to toggle favorite', err);
        }
    };

    const deleteTrip = async (id: string) => {
        try {
            await api.delete(`/trips/${id}`);
            setTrips(prev => prev.filter(t => t._id !== id));
        } catch (err) {
            console.error('Failed to delete trip', err);
        }
    };

    return { trips, loading, error, saveTrip, toggleFavorite, deleteTrip, fetchTrips };
};
