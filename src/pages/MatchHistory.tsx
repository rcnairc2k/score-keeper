import React from 'react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';
import { History, Trophy, Calendar, ChevronRight, User } from 'lucide-react';

export const MatchHistory: React.FC = () => {
    const { matches, tournaments } = useStore();

    const completedMatches = matches.filter(m => m.status === 'completed')
        .sort((a, b) => (b.endTime || 0) - (a.endTime || 0));

    const completedTournaments = tournaments.filter(t => t.status === 'completed')
        .sort((a, b) => b.dateCreated - a.dateCreated);

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-500">
                    <History size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">History</h1>
                    <p className="text-gray-400">Your past glory and classic matches</p>
                </div>
            </div>

            {/* Tournaments Section */}
            {completedTournaments.length > 0 && (
                <section className="space-y-6">
                    <div className="flex items-center gap-2 text-xl font-bold text-white px-2">
                        <Trophy className="text-yellow-500" size={24} />
                        <h2>Completed Tournaments</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {completedTournaments.map(t => (
                            <Link
                                key={t.id}
                                to={`/tournaments/${t.id}`}
                                className="group bg-gray-800 rounded-3xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{t.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <Calendar size={14} />
                                            {new Date(t.dateCreated).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="bg-gray-900 px-3 py-1 rounded-full text-xs font-bold text-blue-400 uppercase tracking-wider">
                                        {t.type.replace(/_/g, ' ')}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-gray-400 pt-4 border-t border-gray-700">
                                    <span className="text-sm">{t.players.length} Players</span>
                                    <div className="flex items-center gap-1 text-blue-500 text-sm font-bold">
                                        View Bracket <ChevronRight size={16} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Matches Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 text-xl font-bold text-white px-2">
                    <User className="text-purple-500" size={24} />
                    <h2>Individual Matches</h2>
                </div>

                <div className="bg-gray-800 rounded-3xl border border-gray-700 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-900/50 text-gray-400 text-xs uppercase font-bold tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Players</th>
                                    <th className="px-6 py-4">Score</th>
                                    <th className="px-6 py-4">Game</th>
                                    <th className="px-6 py-4 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/50">
                                {completedMatches.map(m => {
                                    const s1 = m.scores[m.player1.id];
                                    const s2 = m.scores[m.player2.id];
                                    const is8 = m.type === '8-ball';

                                    return (
                                        <tr key={m.id} className="hover:bg-gray-700/30 transition-colors group cursor-pointer" onClick={() => window.location.href = `/match/${m.id}`}>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex flex-col">
                                                        <span className={`font-bold ${m.winnerId === m.player1.id ? 'text-green-400' : 'text-white'}`}>
                                                            {m.player1.name}
                                                        </span>
                                                        <span className={`font-bold ${m.winnerId === m.player2.id ? 'text-green-400' : 'text-white'}`}>
                                                            {m.player2.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col font-mono text-lg">
                                                    <span className={m.winnerId === m.player1.id ? 'text-green-400' : 'text-gray-400'}>
                                                        {is8 ? s1?.gamesWon : s1?.totalPoints}
                                                    </span>
                                                    <span className={m.winnerId === m.player2.id ? 'text-green-400' : 'text-gray-400'}>
                                                        {is8 ? s2?.gamesWon : s2?.totalPoints}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-xs bg-gray-900 px-2 py-1 rounded text-gray-400 font-bold uppercase">
                                                    {m.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right text-sm text-gray-500 whitespace-nowrap">
                                                {m.endTime ? new Date(m.endTime).toLocaleDateString() : 'N/A'}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {completedMatches.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center text-gray-500 h-60">
                                            <History size={48} className="mx-auto mb-4 opacity-10" />
                                            <p>No completed matches found yet.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
};
