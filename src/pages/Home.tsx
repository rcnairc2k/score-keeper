import React from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Trophy, Users } from 'lucide-react';

export const Home: React.FC = () => {
    return (
        <div className="space-y-8">
            <div className="text-center py-10">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                    APA ScoreKeeper
                </h1>
                <p className="text-gray-400 max-w-xl mx-auto text-lg">
                    Professional scoring for 8-Ball, 9-Ball, and 10-Ball matches. Manage tournaments and track player stats with ease.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                <Link to="/play" className="group p-6 bg-gray-800 rounded-2xl border border-gray-700 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10">
                    <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <PlayCircle size={28} />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">New Match</h3>
                    <p className="text-gray-400">Start a new singles match using APA scoring rules.</p>
                </Link>

                <Link to="/tournaments" className="group p-6 bg-gray-800 rounded-2xl border border-gray-700 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10">
                    <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Trophy size={28} />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Tournaments</h3>
                    <p className="text-gray-400">Organize Round Robin or Double Elimination brackets.</p>
                </Link>

                <Link to="/players" className="group p-6 bg-gray-800 rounded-2xl border border-gray-700 hover:border-green-500/50 transition-all hover:shadow-lg hover:shadow-green-500/10">
                    <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Users size={28} />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Players</h3>
                    <p className="text-gray-400">Manage player roster and update skill levels.</p>
                </Link>

                <Link to="/history" className="group p-6 bg-gray-800 rounded-2xl border border-gray-700 hover:border-orange-500/50 transition-all hover:shadow-lg hover:shadow-orange-500/10">
                    <div className="w-12 h-12 bg-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Trophy size={28} />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Match History</h3>
                    <p className="text-gray-400">View past game results and scores.</p>
                </Link>
            </div>
        </div>
    );
};
