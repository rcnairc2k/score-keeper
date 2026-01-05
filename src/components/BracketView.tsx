import React from 'react';
import type { Match } from '../types';
import { Link } from 'react-router-dom';
import { CheckCircle, Trophy } from 'lucide-react';

interface BracketViewProps {
    matches: Match[];
}

export const BracketView: React.FC<BracketViewProps> = ({ matches }) => {
    // Group matches by round
    const rounds = Array.from(new Set(matches.map(m => m.round || 1))).sort((a, b) => a - b);

    return (
        <div className="flex gap-12 overflow-x-auto pb-8 pt-4 px-4 min-h-[600px] scrollbar-hide">
            {rounds.map((round) => {
                const roundMatches = matches.filter(m => m.round === round && m.bracket !== 'losers');
                if (roundMatches.length === 0) return null;

                return (
                    <div key={round} className="flex flex-col justify-around gap-8 min-w-[240px]">
                        <div className="text-center">
                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Round {round}</h3>
                        </div>
                        {roundMatches.map((m) => {
                            const p1 = m.player1;
                            const p2 = m.player2;
                            const s1 = m.scores[p1.id];
                            const s2 = m.scores[p2.id];
                            const isCompleted = m.status === 'completed';
                            const is8 = m.type === '8-ball';

                            return (
                                <Link
                                    key={m.id}
                                    to={`/match/${m.id}`}
                                    className={`relative bg-gray-800 rounded-2xl border-2 transition-all group overflow-hidden ${isCompleted ? 'border-gray-700 opacity-80' : 'border-gray-700 hover:border-blue-500/50 shadow-xl'
                                        }`}
                                >
                                    {isCompleted && (
                                        <div className="absolute top-0 right-0 p-1 bg-green-500/10 rounded-bl-xl">
                                            <CheckCircle size={14} className="text-green-500" />
                                        </div>
                                    )}

                                    {/* Player 1 Slot */}
                                    <div className={`flex items-center justify-between px-4 py-3 border-b border-gray-700/50 ${m.winnerId === p1.id ? 'bg-green-500/5' : ''}`}>
                                        <div className="flex items-center gap-2 max-w-[140px]">
                                            <span className={`truncate text-sm font-bold ${m.winnerId === p1.id ? 'text-green-400' : p1.id === 'tbd' ? 'text-gray-600' : 'text-white'}`}>
                                                {p1.name}
                                            </span>
                                            {m.winnerId === p1.id && <Trophy size={12} className="text-yellow-500" />}
                                        </div>
                                        <span className="font-mono text-sm text-gray-400">
                                            {isCompleted ? (is8 ? s1?.gamesWon : s1?.totalPoints) : '-'}
                                        </span>
                                    </div>

                                    {/* Player 2 Slot */}
                                    <div className={`flex items-center justify-between px-4 py-3 ${m.winnerId === p2.id ? 'bg-green-500/5' : ''}`}>
                                        <div className="flex items-center gap-2 max-w-[140px]">
                                            <span className={`truncate text-sm font-bold ${m.winnerId === p2.id ? 'text-green-400' : p2.id === 'tbd' ? 'text-gray-600' : 'text-white'}`}>
                                                {p2.name}
                                            </span>
                                            {m.winnerId === p2.id && <Trophy size={12} className="text-yellow-500" />}
                                        </div>
                                        <span className="font-mono text-sm text-gray-400">
                                            {isCompleted ? (is8 ? s2?.gamesWon : s2?.totalPoints) : '-'}
                                        </span>
                                    </div>

                                    {/* Visual Connector Line Placeholder (CSS can bridge these) */}
                                    {m.nextMatchId && (
                                        <div className="absolute -right-6 top-1/2 w-6 h-[2px] bg-gray-700 group-hover:bg-blue-500/30 transition-colors" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};
