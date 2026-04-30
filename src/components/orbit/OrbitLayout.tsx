import React from 'react';
import { Sidebar } from '../ui/sidebar';

interface OrbitLayoutProps {
    chatPanel?: React.ReactNode;
    dashboardPanel: React.ReactNode;
}

export const OrbitLayout: React.FC<OrbitLayoutProps> = ({ chatPanel, dashboardPanel }) => {
    return (
        <div className="h-screen w-screen bg-orbit-950 text-text-primary overflow-hidden flex font-sans">
            <Sidebar />
            
            <div className="flex-1 flex flex-col md:flex-row relative w-full h-full">
                {/* Left Panel: Chat / Agent Interface (Optional) */}
                {chatPanel && (
                    <div className="w-full md:w-[400px] lg:w-[450px] flex flex-col border-r border-orbit-700 bg-orbit-900/50 backdrop-blur-sm z-20 relative shadow-2xl flex-shrink-0">
                        {/* We don't need the Orbit logo here anymore since it's in the sidebar, but we can keep a header for the chat context if needed. Let's just render the chatPanel */}
                        <div className="flex-1 overflow-hidden relative pt-12 md:pt-0"> {/* Padding top for mobile menu button */}
                            {chatPanel}
                        </div>
                    </div>
                )}

                {/* Right Panel: Visualization Dashboard */}
                <div className="flex-1 relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orbit-800/40 via-orbit-950 to-orbit-950 overflow-hidden">
                    <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none mix-blend-overlay"></div>
                    <div className="h-full pt-16 md:pt-0">
                        {dashboardPanel}
                    </div>
                </div>
            </div>
        </div>
    );
};
