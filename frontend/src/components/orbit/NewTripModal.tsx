import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Save, Trash2, X } from 'lucide-react';
import { useTripStore } from '../../store/tripStore';
import { useTrips } from '../../hooks/useTrips';
import { useNavigate } from 'react-router-dom';

export const NewTripModal: React.FC = () => {
    const navigate = useNavigate();
    const { saveTrip } = useTrips();
    const [isSaving, setIsSaving] = useState(false);

    const {
        isNewTripModalOpen,
        setIsNewTripModalOpen,
        resetSession,
        travelContext,
        itinerary,
        selectedFlight,
        selectedHotel
    } = useTripStore();

    if (!isNewTripModalOpen) return null;

    const handleSaveAndStartNew = async () => {
        setIsSaving(true);
        try {
            await saveTrip({
                destination: travelContext.destination || 'Unnamed Destination',
                origin: travelContext.origin || 'Unknown Origin',
                dates: travelContext.dates || 'Flexible Dates',
                itineraryJson: itinerary,
                selectedFlight: selectedFlight || undefined,
                selectedHotel: selectedHotel || undefined
            });
            await resetSession();
            setIsNewTripModalOpen(false);
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to save trip before starting new session:', error);
            alert('Could not save trip. Starting new trip anyway...');
            await resetSession();
            setIsNewTripModalOpen(false);
            navigate('/dashboard');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDiscardAndStartNew = async () => {
        await resetSession();
        setIsNewTripModalOpen(false);
        navigate('/dashboard');
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsNewTripModalOpen(false)}
                    className="absolute inset-0 bg-black/75 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-md bg-orbit-900 border border-orbit-700 rounded-2xl shadow-2xl p-6 overflow-hidden z-10 text-white"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-orbit-700/60">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-accent-500/10 text-accent-400 border border-accent-500/20">
                                <Sparkles size={20} />
                            </div>
                            <h3 className="font-display font-bold text-lg text-white">Start New Trip?</h3>
                        </div>
                        <button
                            onClick={() => setIsNewTripModalOpen(false)}
                            className="p-1.5 text-orbit-500 hover:text-white hover:bg-orbit-800 rounded-lg transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="py-5 space-y-3">
                        <p className="text-sm text-text-secondary leading-relaxed">
                            You have an active travel plan in progress for{' '}
                            <span className="font-semibold text-white">
                                {travelContext.destination || 'your destination'}
                            </span>
                            . Would you like to save this trip to your trip history before starting a new chat session?
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2.5 pt-2">
                        <button
                            onClick={handleSaveAndStartNew}
                            disabled={isSaving}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-accent-600 hover:bg-accent-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-accent-600/25 text-sm disabled:opacity-50"
                        >
                            {isSaving ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save size={16} />
                                    <span>Save & Start New Trip</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleDiscardAndStartNew}
                            disabled={isSaving}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-orbit-800 hover:bg-red-500/15 text-text-secondary hover:text-red-400 border border-orbit-700 hover:border-red-500/30 font-medium rounded-xl transition-all text-sm disabled:opacity-50"
                        >
                            <Trash2 size={16} />
                            <span>Discard & Start New Trip</span>
                        </button>

                        <button
                            onClick={() => setIsNewTripModalOpen(false)}
                            disabled={isSaving}
                            className="w-full py-2 text-xs font-mono text-orbit-500 hover:text-white transition-colors uppercase tracking-wider"
                        >
                            Cancel
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
