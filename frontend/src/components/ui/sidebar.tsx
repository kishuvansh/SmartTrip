import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Map, PlaneTakeoff, Settings, User as UserIcon, LogOut, Menu, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useTripStore } from '../../store/tripStore';
import { useProfile } from '../../hooks/useProfile';
import { auth } from '../../lib/firebase';

export const Sidebar: React.FC = () => {
    const { user } = useAuthStore();
    const { profile } = useProfile();
    const { triggerNewTripFlow } = useTripStore();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const handleNewTripClick = () => {
        setIsOpen(false);
        triggerNewTripFlow();
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <Map size={20} /> },
        { name: 'Trip History', path: '/trips', icon: <PlaneTakeoff size={20} /> },
        { name: 'Preferences', path: '/preferences', icon: <Settings size={20} /> },
        { name: 'Profile', path: '/profile', icon: <UserIcon size={20} /> },
    ];

    const SidebarContent = (
        <div className="flex flex-col h-full bg-[#0A0F1C] border-r border-white/10 w-64 md:w-20 lg:w-64 transition-all duration-300">
            {/* Logo Area */}
            <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center border border-accent-500/50 flex-shrink-0">
                        <div className="w-4 h-4 bg-accent-500 rounded-full animate-pulse shadow-[0_0_10px_theme('colors.accent.500')]" />
                    </div>
                    <h1 className="font-display font-bold text-xl tracking-wide hidden lg:block md:hidden">SmartTrip</h1>
                </div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-3">
                {/* New Trip Button */}
                <button
                    onClick={handleNewTripClick}
                    className="w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-3 mb-3 bg-accent-500/15 hover:bg-accent-500/25 text-accent-400 border border-accent-500/40 rounded-xl transition-all font-medium text-xs shadow-[0_0_12px_rgba(59,130,246,0.15)] group"
                    title="Start a new trip"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300 flex-shrink-0 text-accent-400" />
                    <span className="font-mono uppercase tracking-wider hidden lg:block md:hidden font-semibold">
                        New Trip
                    </span>
                </button>
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) => `
                            flex items-center gap-4 px-3 py-3 rounded-sm transition-all relative overflow-hidden group
                            ${isActive ? 'text-white bg-accent-500/10' : 'text-orbit-500 hover:text-white hover:bg-white/5'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <motion.div 
                                        layoutId="activeNavTab"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-accent-500" 
                                    />
                                )}
                                <div className={`${isActive ? 'text-accent-500' : 'text-orbit-500 group-hover:text-white'} transition-colors`}>
                                    {item.icon}
                                </div>
                                <span className="font-mono text-xs uppercase tracking-wider hidden lg:block md:hidden">
                                    {item.name}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User Profile Area */}
            <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-orbit-800 overflow-hidden flex-shrink-0 border border-white/10">
                        {profile?.photoUrl ? (
                            <img src={profile.photoUrl} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-orbit-500 font-bold uppercase">
                                {user?.email?.[0] || 'U'}
                            </div>
                        )}
                    </div>
                    <div className="hidden lg:block md:hidden overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">{profile?.name || 'Traveler'}</p>
                        <p className="text-[10px] text-orbit-500 truncate font-mono">{user?.email}</p>
                    </div>
                </div>
                
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2 text-orbit-500 hover:text-red-400 hover:bg-red-500/10 rounded-sm transition-colors"
                    title="Logout"
                >
                    <LogOut size={18} />
                    <span className="font-mono text-xs uppercase tracking-wider hidden lg:block md:hidden">Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop / Tablet Sidebar */}
            <div className="hidden md:flex h-full z-50">
                {SidebarContent}
            </div>

            {/* Mobile Hamburger Button */}
            <button 
                className="md:hidden fixed top-3 left-4 z-50 p-2 bg-[#0A0F1C] border border-white/10 rounded-sm text-white"
                onClick={() => setIsOpen(true)}
            >
                <Menu size={24} />
            </button>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 z-50 md:hidden"
                        >
                            <button 
                                className="absolute top-4 right-4 text-white hover:text-accent-500 z-50"
                                onClick={() => setIsOpen(false)}
                            >
                                <X size={24} />
                            </button>
                            {SidebarContent}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
