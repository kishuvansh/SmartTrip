import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrips } from '../../hooks/useTrips';
import { Map, Calendar, Plane, Building, Star, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TripHistoryPage: React.FC = () => {
    const { trips, loading, toggleFavorite, deleteTrip } = useTrips();
    const [activeTab, setActiveTab] = useState<'all' | 'saved' | 'favorites'>('all');
    const navigate = useNavigate();

    if (loading) {
        return (
             <div className="h-screen w-full bg-[#00050A] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-orbit-700 border-t-accent-500 rounded-full animate-spin" />
            </div>
        );
    }

    const filteredTrips = trips.filter(trip => {
        if (activeTab === 'favorites') return trip.isFavorite;
        if (activeTab === 'saved') return trip.isSaved;
        return true;
    });

    return (
        <div className="min-h-screen bg-[#00050A] p-6 md:p-10 text-white font-sans overflow-y-auto">
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orbit-900/20 to-transparent pointer-events-none" />
            
            <div className="max-w-6xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold uppercase tracking-widest text-white/90">Mission History</h1>
                        <p className="text-orbit-400 mt-2 text-sm">Review your past and upcoming travel itineraries.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="bg-accent-500 hover:bg-accent-400 text-white font-bold py-2 px-6 rounded-sm transition-all flex items-center gap-2 text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                    >
                        <span>New Mission</span>
                        <ArrowRight size={14} />
                    </button>
                </div>

                <div className="flex gap-4 border-b border-white/10 mb-8 overflow-x-auto scrollbar-hide">
                    {['all', 'saved', 'favorites'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`pb-3 px-4 text-sm font-mono uppercase tracking-wider whitespace-nowrap transition-all ${
                                activeTab === tab 
                                ? 'text-accent-500 border-b-2 border-accent-500' 
                                : 'text-orbit-500 hover:text-white'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {filteredTrips.length === 0 ? (
                    <div className="bg-[#0A0F1C]/80 backdrop-blur-xl border border-white/10 p-12 shadow-xl rounded-sm text-center">
                        <Map size={48} className="mx-auto text-orbit-700 mb-4" />
                        <h3 className="text-xl font-display font-medium text-white mb-2">No itineraries found</h3>
                        <p className="text-orbit-400 text-sm max-w-md mx-auto">
                            {activeTab === 'favorites' ? 'You haven\'t starred any trips yet.' : 'Your travel log is empty. Start a new mission to generate your first AI itinerary.'}
                        </p>
                    </div>
                ) : (
                    <motion.div 
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        <AnimatePresence>
                            {filteredTrips.map(trip => (
                                <motion.div
                                    key={trip._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-[#0A0F1C]/80 backdrop-blur-xl border border-white/10 shadow-xl rounded-sm overflow-hidden group hover:border-accent-500/50 transition-colors flex flex-col"
                                >
                                    {/* Card Header Image Placeholder (could use Unsplash API later) */}
                                    <div className="h-32 bg-orbit-900 relative overflow-hidden flex items-center justify-center">
                                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
                                        <Map size={40} className="text-orbit-700/50" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C] to-transparent" />
                                        
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <button 
                                                onClick={() => trip._id && toggleFavorite(trip._id)}
                                                className="p-2 bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60 transition-colors"
                                            >
                                                <Star size={16} fill={trip.isFavorite ? "#EAB308" : "none"} className={trip.isFavorite ? "text-yellow-500" : ""} />
                                            </button>
                                            <button 
                                                onClick={() => trip._id && deleteTrip(trip._id)}
                                                className="p-2 bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-red-500/80 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-display font-bold text-white leading-tight">{trip.destination}</h3>
                                                <p className="text-xs text-orbit-400 font-mono mt-1">From {trip.origin}</p>
                                            </div>
                                            <span className="px-2 py-1 bg-accent-500/10 text-accent-500 border border-accent-500/20 text-[10px] font-mono uppercase tracking-widest rounded-sm">
                                                {trip.status}
                                            </span>
                                        </div>

                                        <div className="space-y-3 mb-6 flex-1">
                                            <div className="flex items-center gap-3 text-sm text-orbit-300">
                                                <Calendar size={14} className="text-accent-500" />
                                                <span>{trip.dates}</span>
                                            </div>
                                            {trip.selectedFlight && (
                                                <div className="flex items-center gap-3 text-sm text-orbit-300">
                                                    <Plane size={14} className="text-accent-500" />
                                                    <span className="truncate">{trip.selectedFlight.airline}</span>
                                                </div>
                                            )}
                                            {trip.selectedHotel && (
                                                <div className="flex items-center gap-3 text-sm text-orbit-300">
                                                    <Building size={14} className="text-accent-500" />
                                                    <span className="truncate">{trip.selectedHotel.name}</span>
                                                </div>
                                            )}
                                        </div>

                                        <button className="w-full py-2 border border-white/10 rounded-sm text-xs font-mono uppercase tracking-wider text-orbit-300 hover:text-white hover:bg-white/5 transition-colors">
                                            View Itinerary
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
};
