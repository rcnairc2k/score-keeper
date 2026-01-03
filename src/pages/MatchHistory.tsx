import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Calendar, Trophy, ArrowLeft, CheckCircle } from 'lucide-react';

export const MatchHistory: React.FC = () => {
    const { matches } = useStore();

    // Filter and sort matches (Completed, Newest First)
    const completedMatches = matches
        .filter(m => m.status === 'completed')
        .sort((a, b) => b.startTime - a.startTime);

    return (
        <div className="pb-20">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Link to="/" className="flex items-center text-gray-400 hover:text-white mb-4">
                        <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Match History</h1>
                    <p className="text-gray-400 mt-1">Archive of all completed games</p>
                </div>
            </div>

            {completedMatches.length === 0 ? (
                <div className="text-center py-20 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
                    <Trophy size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">No completed matches found.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {completedMatches.map(m => {
                        const is8Ball = m.type === '8-ball';
                        const p1Score = is8Ball ? m.scores[m.player1.id].gamesWon : m.scores[m.player1.id].totalPoints;
                        const p2Score = is8Ball ? m.scores[m.player2.id].gamesWon : m.scores[m.player2.id].totalPoints;
                        const isP1Winner = m.winnerId === m.player1.id;

                        return (
                            <Link
                                key={m.id}
                                to={`/match/${m.id}`}
                                className="block bg-gray-800 p-5 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all hover:bg-gray-800/80 group"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    {/* Match Info Header (Mobile Top) */}
                                    <div className="flex items-center gap-3 text-sm text-gray-400 sm:hidden">
                                        <span className="capitalize bg-gray-700 px-2 py-0.5 rounded text-xs">{m.type}</span>
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(m.startTime).toLocaleDateString()}</span>
                                    </div>

                                    {/* Players & Scores */}
                                    <div className="flex-1 grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                                        {/* Player 1 */}
                                        <div className={`text-right ${isP1Winner ? 'text-green-400 font-bold' : 'text-gray-300'}`}>
                                            <div className="text-lg">{m.player1.name}</div>
                                        </div>

                                        {/* Score Badge */}
                                        <div className="bg-gray-900 px-4 py-2 rounded-lg font-mono text-xl text-white font-bold border border-gray-700 flex items-center justify-center min-w-[100px]">
                                            <span className={isP1Winner ? 'text-green-400' : ''}>{p1Score}</span>
                                            <span className="mx-2 text-gray-600">-</span>
                                            <span className={!isP1Winner ? 'text-green-400' : ''}>{p2Score}</span>
                                        </div>

                                        {/* Player 2 */}
                                        <div className={`text-left ${!isP1Winner ? 'text-green-400 font-bold' : 'text-gray-300'}`}>
                                            <div className="text-lg">{m.player2.name}</div>
                                        </div>
                                    </div>

                                    {/* Meta Info (Desktop) */}
                                    <div className="hidden sm:flex flex-col items-end text-sm text-gray-400 gap-1 w-32 border-l border-gray-700 pl-4">
                                        <span className="capitalize font-medium text-white">{m.type}</span>
                                        <span>{new Date(m.startTime).toLocaleDateString()}</span>
                                        {m.winnerId && <span className="text-green-500 flex items-center gap-1"><CheckCircle size={12} /> Complete</span>}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
