import React from 'react';
import type { Match } from '../types';
import { Shield, Target } from 'lucide-react';

interface InningHistoryProps {
    match: Match;
}

export const InningHistory: React.FC<InningHistoryProps> = ({ match }) => {
    // Show last 5-10 innings in reverse order
    const history = [...match.innings].reverse();

    if (history.length === 0) return null;

    return (
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-4 mt-8">
            <h3 className="text-gray-400 text-sm font-bold uppercase mb-4">Inning History</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
                {history.map((inning) => {
                    const player = match.player1.id === inning.playerId ? match.player1 : match.player2;
                    return (
                        <div key={inning.id} className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg text-sm border border-gray-700/50">
                            <div className="flex items-center gap-3">
                                <span className="text-gray-500 font-mono w-6">#{inning.inningNumber}</span>
                                <span className="text-white font-medium">{player.name}</span>
                            </div>
                            <div className="flex items-center gap-4 text-gray-400">
                                {inning.defensiveShots > 0 && (
                                    <span className="flex items-center gap-1 text-orange-400">
                                        <Shield size={12} /> {inning.defensiveShots}
                                    </span>
                                )}
                                {match.type !== '8-ball' && inning.ballsPotted > 0 && (
                                    <span className="flex items-center gap-1 text-blue-400">
                                        <Target size={12} /> {inning.ballsPotted} pts
                                    </span>
                                )}
                                {inning.ballsPotted === 0 && inning.defensiveShots === 0 && (
                                    <span className="text-gray-600 italic">Miss</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
