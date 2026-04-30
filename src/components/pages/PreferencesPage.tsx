import React, { useState, useEffect } from 'react';
import { usePreferences } from '../../hooks/usePreferences';
import { Plane, Star, Users, DollarSign, Save } from 'lucide-react';

const AIRLINES = ['IndiGo', 'Air India', 'Emirates', 'SpiceJet', 'Vistara', 'Qatar Airways', 'Singapore Airlines'];
const SEATS = ['window', 'aisle', 'middle'];
const MEALS = ['veg', 'non-veg', 'vegan'];
const INTERESTS = ['🏖️ Beaches', '🏔️ Mountains', '🌙 Nightlife', '🏛️ History', '🌿 Nature', '🛍️ Shopping', '🏂 Adventure', '🍷 Culinary'];
const TRAVELER_TYPES = ['solo', 'couple', 'family'];

export const PreferencesPage: React.FC = () => {
    const { preferences, loading, updatePreferences, error } = usePreferences();
    
    const [formData, setFormData] = useState({
        preferredAirlines: [] as string[],
        hotelStarRating: 3,
        seatPreference: 'window' as 'window' | 'aisle' | 'middle',
        mealPreference: 'non-veg' as 'veg' | 'non-veg' | 'vegan',
        interests: [] as string[],
        budgetRange: { min: 1000, max: 5000, currency: 'USD' },
        travelerType: 'solo' as 'solo' | 'couple' | 'family'
    });

    const [isSaving, setIsSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (preferences) {
            setFormData({
                preferredAirlines: preferences.preferredAirlines || [],
                hotelStarRating: preferences.hotelStarRating || 3,
                seatPreference: preferences.seatPreference || 'window',
                mealPreference: preferences.mealPreference || 'non-veg',
                interests: preferences.interests || [],
                budgetRange: preferences.budgetRange || { min: 1000, max: 5000, currency: 'USD' },
                travelerType: preferences.travelerType || 'solo'
            });
        }
    }, [preferences]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSuccessMsg('');
        try {
            await updatePreferences(formData);
            setSuccessMsg('Preferences saved successfully.');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const toggleArrayItem = (field: 'preferredAirlines' | 'interests', item: string) => {
        setFormData(prev => {
            const arr = prev[field];
            if (arr.includes(item)) {
                return { ...prev, [field]: arr.filter(i => i !== item) };
            } else {
                return { ...prev, [field]: [...arr, item] };
            }
        });
    };

    if (loading) {
        return (
             <div className="h-screen w-full bg-[#00050A] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-orbit-700 border-t-accent-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#00050A] p-6 md:p-10 text-white font-sans overflow-y-auto">
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orbit-900/20 to-transparent pointer-events-none" />
            
            <div className="max-w-4xl mx-auto relative z-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold uppercase tracking-widest text-white/90">Travel Parameters</h1>
                    <p className="text-orbit-400 mt-2 text-sm">Fine-tune your core preferences for better AI-generated itineraries.</p>
                </div>

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

                    <form onSubmit={handleSave} className="space-y-10">
                        {/* FLIGHT PREFERENCES */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-display text-white border-b border-white/10 pb-2 flex items-center gap-2">
                                <Plane size={18} className="text-accent-500" /> Transit Preferences
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-mono font-bold text-orbit-500 uppercase tracking-widest mb-3 block">Preferred Airlines</label>
                                    <div className="flex flex-wrap gap-2">
                                        {AIRLINES.map(airline => (
                                            <button
                                                key={airline}
                                                type="button"
                                                onClick={() => toggleArrayItem('preferredAirlines', airline)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                                    formData.preferredAirlines.includes(airline)
                                                    ? 'bg-accent-500/20 border-accent-500 text-white'
                                                    : 'bg-transparent border-white/10 text-orbit-400 hover:border-white/30'
                                                }`}
                                            >
                                                {airline}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-mono font-bold text-orbit-500 uppercase tracking-widest mb-3 block">Seat Assignment</label>
                                        <div className="flex bg-[#050A10] rounded-sm border border-white/10 overflow-hidden">
                                            {SEATS.map(seat => (
                                                <button
                                                    key={seat}
                                                    type="button"
                                                    onClick={() => setFormData({...formData, seatPreference: seat as 'window' | 'aisle' | 'middle'})}
                                                    className={`flex-1 py-2 text-xs uppercase tracking-wider font-mono transition-colors ${
                                                        formData.seatPreference === seat ? 'bg-accent-500 text-white' : 'text-orbit-500 hover:text-white'
                                                    }`}
                                                >
                                                    {seat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-mono font-bold text-orbit-500 uppercase tracking-widest mb-3 block">Dietary Restrictions</label>
                                        <div className="flex bg-[#050A10] rounded-sm border border-white/10 overflow-hidden">
                                            {MEALS.map(meal => (
                                                <button
                                                    key={meal}
                                                    type="button"
                                                    onClick={() => setFormData({...formData, mealPreference: meal as 'veg' | 'non-veg' | 'vegan'})}
                                                    className={`flex-1 py-2 text-xs uppercase tracking-wider font-mono transition-colors ${
                                                        formData.mealPreference === meal ? 'bg-accent-500 text-white' : 'text-orbit-500 hover:text-white'
                                                    }`}
                                                >
                                                    {meal}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* STAY PREFERENCES */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-display text-white border-b border-white/10 pb-2 flex items-center gap-2">
                                <Star size={18} className="text-accent-500" /> Accommodation Standards
                            </h3>
                            
                            <div>
                                <label className="text-[10px] font-mono font-bold text-orbit-500 uppercase tracking-widest mb-3 block">Minimum Star Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(rating => (
                                        <button
                                            key={rating}
                                            type="button"
                                            onClick={() => setFormData({...formData, hotelStarRating: rating})}
                                            className={`w-12 h-12 flex items-center justify-center rounded-sm border transition-all ${
                                                formData.hotelStarRating >= rating
                                                ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'
                                                : 'bg-[#050A10] border-white/10 text-orbit-600 hover:border-white/30'
                                            }`}
                                        >
                                            <Star size={20} fill={formData.hotelStarRating >= rating ? "currentColor" : "none"} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* EXPERIENCE */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-display text-white border-b border-white/10 pb-2 flex items-center gap-2">
                                <Users size={18} className="text-accent-500" /> Experience Configuration
                            </h3>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-mono font-bold text-orbit-500 uppercase tracking-widest mb-3 block">Traveler Configuration</label>
                                    <div className="flex gap-3">
                                        {TRAVELER_TYPES.map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setFormData({...formData, travelerType: type as 'family' | 'solo' | 'couple'})}
                                                className={`px-6 py-2 rounded-sm text-xs font-mono uppercase tracking-wider border transition-all ${
                                                    formData.travelerType === type 
                                                    ? 'bg-accent-500/20 border-accent-500 text-white' 
                                                    : 'bg-[#050A10] border-white/10 text-orbit-500 hover:border-white/30'
                                                }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-mono font-bold text-orbit-500 uppercase tracking-widest mb-3 block">Core Interests</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {INTERESTS.map(interest => {
                                            const isSelected = formData.interests.includes(interest);
                                            return (
                                                <button
                                                    key={interest}
                                                    type="button"
                                                    onClick={() => toggleArrayItem('interests', interest)}
                                                    className={`p-3 rounded-sm border text-sm text-left transition-all flex items-center gap-2 ${
                                                        isSelected 
                                                        ? 'bg-accent-500/10 border-accent-500 text-white' 
                                                        : 'bg-[#050A10] border-white/5 text-orbit-400 hover:bg-white/5'
                                                    }`}
                                                >
                                                    <div className={`w-4 h-4 border rounded-sm flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-accent-500 bg-accent-500' : 'border-orbit-600'}`}>
                                                        {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                                                    </div>
                                                    <span className="truncate">{interest}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BUDGET */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-display text-white border-b border-white/10 pb-2 flex items-center gap-2">
                                <DollarSign size={18} className="text-accent-500" /> Budget Allocation
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono font-bold text-orbit-500 uppercase tracking-widest">Min per trip</label>
                                    <input 
                                        type="number"
                                        value={formData.budgetRange.min}
                                        onChange={(e) => setFormData({...formData, budgetRange: {...formData.budgetRange, min: parseInt(e.target.value) || 0}})}
                                        className="w-full bg-[#050A10] border border-white/10 rounded-sm px-4 py-2 text-white text-sm focus:outline-none focus:border-accent-500/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono font-bold text-orbit-500 uppercase tracking-widest">Max per trip</label>
                                    <input 
                                        type="number"
                                        value={formData.budgetRange.max}
                                        onChange={(e) => setFormData({...formData, budgetRange: {...formData.budgetRange, max: parseInt(e.target.value) || 0}})}
                                        className="w-full bg-[#050A10] border border-white/10 rounded-sm px-4 py-2 text-white text-sm focus:outline-none focus:border-accent-500/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono font-bold text-orbit-500 uppercase tracking-widest">Currency Code</label>
                                    <input 
                                        type="text"
                                        maxLength={3}
                                        value={formData.budgetRange.currency}
                                        onChange={(e) => setFormData({...formData, budgetRange: {...formData.budgetRange, currency: e.target.value.toUpperCase()}})}
                                        className="w-full bg-[#050A10] border border-white/10 rounded-sm px-4 py-2 text-white text-sm focus:outline-none focus:border-accent-500/50 uppercase"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-6 border-t border-white/10">
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
                                        <span>Lock Parameters</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
