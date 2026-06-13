import { useState, useEffect } from 'react';
import api from '../lib/api';
import type { UserProfile } from '../types/user';
import { useAuthStore } from '../store/authStore';

export const useProfile = () => {
    const { user } = useAuthStore();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get('/profile');
            setProfile(data);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [user]);

    const updateProfile = async (updates: Partial<UserProfile>) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.put('/profile', updates);
            setProfile(data);
            return data;
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const uploadPhoto = async (file: File) => {
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('photo', file);
            
            const { data } = await api.post('/profile/photo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setProfile(data.user);
            return data.photoUrl;
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { profile, loading, error, updateProfile, uploadPhoto, fetchProfile };
};
