import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ArrowLeft, CheckCircle, Plus, X, LayoutGrid, List } from 'lucide-react';
import { BracketView } from '../components/BracketView';

export const TournamentDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { tournaments, updateTournament, addMatch } = useStore();
    const tournament = tournaments.find(t => t.id === id);

    const [isAddingMatch, setIsAddingMatch] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'bracket'>('bracket');
    const [p1Id, setP1Id] = useState('');
    const [p2Id, setP2Id] = useState('');

    if (!tournament) {
        return <div className="text-white p-8">Tournament not found</div>;
    }

    const handleCreateMatch = async () => {
        if (!p1Id || !p2Id || p1Id === p2Id) return;
        const p1 = tournament.players.find(p => p.id === p1Id);
        const p2 = tournament.players.find(p => p.id === p2Id);
        if (!p1 || !p2) return;

        const newMatch = {
            id: crypto.randomUUID(),
            player1: p1,
            player2: p2,
            type: tournament.matches[0]?.type || '8-ball',
            startTime: Date.now(),
            scores: {
                [p1.id]: { playerId: p1.id, totalPoints: 0, gamesWon: 0, innings: 0, defensiveShots: 0, timeouts: 0 },
                [p2.id]: { playerId: p2.id, totalPoints: 0, gamesWon: 0, innings: 0, defensiveShots: 0, timeouts: 0 }
            },
            innings: [],
            status: 'scheduled' as const
        };

        // Add to global store
        await addMatch(newMatch);

        // Update tournament local match list
        // Note: Ideally backend handles this relation, but for optimistic UI we update manually
        await updateTournament(tournament.id, {
            matches: [...tournament.matches, newMatch]
        });

        setIsAddingMatch(false);
        setP1Id('');
        setP2Id('');
    };

    // Calculate Standings
    const standings = tournament.players.map(p => {
        const pMatches = tournament.matches.filter(m =>
            (m.player1.id === p.id || m.player2.id === p.id) && m.status === 'completed'
        );

        let wins = 0;
        let points = 0;

        pMatches.forEach(m => {
            if (m.winnerId === p.id) wins++;
        });

        return {
            ...p,
            played: pMatches.length,
            wins,
            points
        };
    }).sort((a, b) => b.wins - a.wins);

    return (
        <div className="pb-20 relative">
            <Link to="/tournaments" className="flex items-center text-gray-400 hover:text-white mb-6">
                <ArrowLeft size={20} className="mr-2" /> Back to Tournaments
            </Link>

            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700 mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{tournament.name}</h1>
                    <div className="flex gap-4 text-gray-400 text-sm">
                        <span className="bg-gray-700/50 px-3 py-1 rounded-full capitalize">{tournament.type.replace(/_/g, ' ')}</span>
                        <span className="bg-gray-700/50 px-3 py-1 rounded-full">{tournament.matches.length} Matches</span>
                    </div>
                </div>
                <button
                    onClick={() => setIsAddingMatch(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} /> Add Match
                </button>
            </div>

            {/* View Toggle (Only for brackets) */}
            {(tournament.type === 'single_elimination' || tournament.type === 'double_elimination') && (
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setViewMode('bracket')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${viewMode === 'bracket' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
                    >
                        <LayoutGrid size={18} /> Bracket
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${viewMode === 'list' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
                    >
                        <List size={18} /> Match List
                    </button>
                </div>
            )}

            {/* Add Match Modal */}
            {isAddingMatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md p-6 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Add Match</h3>
                            <button onClick={() => setIsAddingMatch(false)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Player 1</label>
                                <select
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                                    value={p1Id}
                                    onChange={e => setP1Id(e.target.value)}
                                >
                                    <option value="">Select Player</option>
                                    {tournament.players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="text-center text-gray-500 font-bold">VS</div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Player 2</label>
                                <select
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                                    value={p2Id}
                                    onChange={e => setP2Id(e.target.value)}
                                >
                                    <option value="">Select Player</option>
                                    {tournament.players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleCreateMatch}
                            disabled={!p1Id || !p2Id || p1Id === p2Id}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
                        >
                            Create Match
                        </button>
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Standings */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white">Standings</h2>
                    <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                        <table className="w-full text-left">
                            <thead className="bg-gray-900/50 text-gray-400 text-xs uppercase font-medium">
                                <tr>
                                    <th className="px-4 py-3">Player</th>
                                    <th className="px-4 py-3 text-center">Played</th>
                                    <th className="px-4 py-3 text-center">Wins</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-gray-700">
                                {standings.map((p: any, idx: number) => (
                                    <tr key={p.id} className="hover:bg-gray-700/50">
                                        <td className="px-4 py-3 text-white font-medium flex items-center gap-2">
                                            <span className="w-6 text-gray-500 text-xs">{idx + 1}</span>
                                            {p.name}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-300">{p.played}</td>
                                        <td className="px-4 py-3 text-center text-blue-400 font-bold">{p.wins}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white">
                        {tournament.type === 'round_robin' ? 'Matches' : (viewMode === 'bracket' ? 'Bracket' : 'Match List')}
                    </h2>

                    {tournament.type !== 'round_robin' && viewMode === 'bracket' ? (
                        <BracketView matches={tournament.matches} />
                    ) : (
                        <div className="space-y-2">
                            {tournament.matches.map((m: any, idx: number) => (
                                <Link
                                    key={m.id}
                                    to={`/match/${m.id}`}
                                    className={`block bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-colors ${m.status === 'completed' ? 'opacity-75 hover:opacity-100' : ''}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="text-xs text-gray-500 mb-1">Match {idx + 1}</div>
                                        {m.status === 'completed' && <CheckCircle size={14} className="text-green-500" />}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex-1">
                                            <div className={`font-medium ${m.winnerId === m.player1.id ? 'text-green-400' : 'text-white'}`}>
                                                {m.player1.name}
                                            </div>
                                        </div>
                                        <div className="px-3 text-gray-500 text-xs">VS</div>
                                        <div className="flex-1 text-right">
                                            <div className={`font-medium ${m.winnerId === m.player2.id ? 'text-green-400' : 'text-white'}`}>
                                                {m.player2.name}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
