import React, { useState, useEffect, useRef } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { useAuthStore } from '../../store/authStore';
import { Camera, Save, MapPin, DollarSign, Type } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TRAVEL_STYLES = ['luxury', 'budget', 'backpacking', 'adventure', 'family'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'AED'];

export const ProfilePage: React.FC = () => {
    const { profile, loading, updateProfile, uploadPhoto, error } = useProfile();
    const { user, loading: authLoading } = useAuthStore();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        homeCity: '',
        preferredCurrency: 'USD',
        travelStyle: 'luxury' as 'luxury' | 'budget' | 'backpacking' | 'adventure' | 'family',
        bio: '',
        favoriteDestinations: [] as string[]
    });
    
    const [destInput, setDestInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                homeCity: profile.homeCity || '',
                preferredCurrency: profile.preferredCurrency || 'USD',
                travelStyle: profile.travelStyle || 'luxury',
                bio: profile.bio || '',
                favoriteDestinations: profile.favoriteDestinations || []
            });
        }
    }, [profile]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSuccessMsg('');
        try {
            await updateProfile(formData);
            setSuccessMsg('Profile updated successfully.');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                await uploadPhoto(e.target.files[0]);
            } catch (err) {
                console.error("Photo upload failed", err);
            }
        }
    };

    const handleAddDestination = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && destInput.trim()) {
            e.preventDefault();
            if (!formData.favoriteDestinations.includes(destInput.trim())) {
                setFormData(prev => ({
                    ...prev,
                    favoriteDestinations: [...prev.favoriteDestinations, destInput.trim()]
                }));
            }
            setDestInput('');
        }
    };

    const removeDestination = (dest: string) => {
        setFormData(prev => ({
            ...prev,
            favoriteDestinations: prev.favoriteDestinations.filter(d => d !== dest)
        }));
    };

    if (loading || authLoading) {
        return (
             <div className="h-screen w-full bg-[#00050A] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-orbit-700 border-t-accent-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#00050A] p-6 md:p-10 text-white font-sans overflow-y-auto">
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orbit-900/20 to-transparent pointer-events-none" />
            <div className="max-w-5xl mx-auto relative z-10">
                <h1 className="text-3xl font-display font-bold mb-8 uppercase tracking-widest text-white/90">Identity Profile</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Panel: Avatar & Basics */}
                    <div className="col-span-1 space-y-6">
                        <div className="bg-[#0A0F1C]/80 backdrop-blur-xl border border-white/10 p-6 shadow-xl flex flex-col items-center rounded-sm">
                            <div 
                                className="relative w-32 h-32 rounded-full mb-6 cursor-pointer group"
                                onClick={handlePhotoClick}
                            >
                                <img 
                                    src={profile?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&background=random`} 
                                    alt="Profile" 
                                    className="w-full h-full rounded-full object-cover border-2 border-white/10 group-hover:border-accent-500/50 transition-colors"
                                />
                                <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Camera size={24} className="text-white" />
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                />
                            </div>
                            
                            <h2 className="text-xl font-display font-semibold text-white/90 text-center">{profile?.name}</h2>
                            <p className="text-sm font-mono text-orbit-400 mt-1">{profile?.email}</p>
                            
                            <div className="mt-6 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono uppercase text-orbit-300 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Authenticated via {profile?.authProvider}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Form */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="bg-[#0A0F1C]/80 backdrop-blur-xl border border-white/10 p-8 shadow-xl rounded-sm">
                             {error && (
                                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-sm text-red-400 text-xs">
                                    {error}
                                </div>
                            )}
                            {successMsg && (
                                <div className="mb-6 p-3 bg-green-500/10 border border-green-500/50 rounded-sm text-green-400 text-xs">
                                    {successMsg}
                                </div>
                            )}

                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono font-bold text-orbit-500 uppercase tracking-widest ml-1">Display Name</label>
                                        <div className="relative group">
                                            <Type className="absolute left-4 top-3.5 text-orbit-500 group-focus-within:text-white transition-colors" size={16} />
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                className="w-full bg-[#050A10] border border-white/10 rounded-sm px-12 py-3 text-white text-sm focus:outline-none focus:border-accent-500/50 focus:bg-[#0A0F1C] transition-all font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono font-bold text-orbit-500 uppercase tracking-widest ml-1">Home City</label>
                                        <div className="relative group">
                                            <MapPin className="absolute left-4 top-3.5 text-orbit-500 group-focus-within:text-white transition-colors" size={16} />
                                            <input
                                                type="text"
                                                value={formData.homeCity}
                                                onChange={(e) => setFormData({...formData, homeCity: e.target.value})}
                                                placeholder="e.g., New York, Tokyo"
                                                className="w-full bg-[#050A10] border border-white/10 rounded-sm px-12 py-3 text-white text-sm focus:outline-none focus:border-accent-500/50 focus:bg-[#0A0F1C] transition-all font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono font-bold text-orbit-500 uppercase tracking-widest ml-1">Preferred Currency</label>
                                        <div className="relative group">
                                            <DollarSign className="absolute left-4 top-3.5 text-orbit-500 group-focus-within:text-white transition-colors" size={16} />
                                            <select
                                                value={formData.preferredCurrency}
                                                onChange={(e) => setFormData({...formData, preferredCurrency: e.target.value})}
                                                className="w-full bg-[#050A10] border border-white/10 rounded-sm px-12 py-3 text-white text-sm focus:outline-none focus:border-accent-500/50 focus:bg-[#0A0F1C] transition-all font-mono appearance-none"
                                            >
                                                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono font-bold text-orbit-500 uppercase tracking-widest ml-1">Travel Style</label>
                                    <div className="flex flex-wrap gap-3">
                                        {TRAVEL_STYLES.map(style => (
                                            <button
                                                key={style}
                                                type="button"
                                                onClick={() => setFormData({...formData, travelStyle: style as 'family' | 'luxury' | 'budget' | 'backpacking' | 'adventure'})}
                                                className={`px-4 py-2 rounded-sm text-xs font-mono uppercase tracking-wider border transition-all ${
                                                    formData.travelStyle === style 
                                                    ? 'bg-accent-500/20 border-accent-500 text-white' 
                                                    : 'bg-[#050A10] border-white/10 text-orbit-500 hover:border-white/30'
                                                }`}
                                            >
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono font-bold text-orbit-500 uppercase tracking-widest ml-1">Favorite Destinations</label>
                                    <div className="bg-[#050A10] border border-white/10 rounded-sm p-3 min-h-[60px] flex flex-wrap gap-2 focus-within:border-accent-500/50 transition-colors">
                                        {formData.favoriteDestinations.map(dest => (
                                            <span key={dest} className="px-3 py-1 bg-white/5 border border-white/10 rounded-sm text-xs flex items-center gap-2">
                                                {dest}
                                                <button type="button" onClick={() => removeDestination(dest)} className="text-orbit-500 hover:text-red-400">×</button>
                                            </span>
                                        ))}
                                        <input
                                            type="text"
                                            value={destInput}
                                            onChange={(e) => setDestInput(e.target.value)}
                                            onKeyDown={handleAddDestination}
                                            placeholder="Type and press Enter..."
                                            className="flex-1 bg-transparent border-none outline-none text-sm font-mono placeholder:text-orbit-700 min-w-[150px]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono font-bold text-orbit-500 uppercase tracking-widest ml-1">Bio (Optional)</label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                        rows={4}
                                        className="w-full bg-[#050A10] border border-white/10 rounded-sm px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-500/50 focus:bg-[#0A0F1C] transition-all font-mono resize-none"
                                        placeholder="Tell us about your travel dreams..."
                                    />
                                </div>

                                <div className="flex justify-end pt-4 border-t border-white/10">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="bg-white text-black hover:bg-orbit-200 font-bold py-3 px-8 rounded-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs uppercase tracking-wider"
                                    >
                                        {isSaving ? (
                                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Save size={14} />
                                                <span>Save Changes</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
