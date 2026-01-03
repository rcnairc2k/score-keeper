import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Users, PlayCircle, Home } from 'lucide-react';

import { twMerge } from 'tailwind-merge';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();

    const navItems = [
        { label: 'Home', path: '/', icon: Home },
        { label: 'Play', path: '/play', icon: PlayCircle },
        { label: 'Players', path: '/players', icon: Users },
        { label: 'Tournaments', path: '/tournaments', icon: Trophy },
        // { label: 'Settings', path: '/settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-gray-800 border-r border-gray-700">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                        ScoreKeeper
                    </h1>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={twMerge(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                    isActive
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-400 hover:bg-gray-700 hover:text-white"
                                )}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative">
                <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 pb-safe z-50">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={twMerge(
                                    "flex flex-col items-center justify-center w-full h-full space-y-1",
                                    isActive ? "text-blue-500" : "text-gray-400"
                                )}
                            >
                                <Icon size={24} />
                                <span className="text-xs font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};
