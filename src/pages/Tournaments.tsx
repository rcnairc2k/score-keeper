import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import type { GameType, TournamentType, Match } from '../types';
import { generateRoundRobinMatches } from '../engine/tournament/roundRobin';
import { generateDoubleEliminationMatches } from '../engine/tournament/doubleElimination';
import { Plus, Trophy, Calendar, Users, ChevronRight } from 'lucide-react';

export const Tournaments: React.FC = () => {
    const { tournaments, players, addTournament } = useStore();
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [type, setType] = useState<TournamentType>('round_robin');
    const [gameType, setGameType] = useState<GameType>('8-ball');
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

    const handleCreate = () => {
        if (!name || selectedPlayers.length < 2) return;

        const tournamentPlayers = players.filter(p => selectedPlayers.includes(p.id));

        let matches: Match[] = [];
        if (type === 'round_robin') {
            matches = generateRoundRobinMatches(tournamentPlayers, gameType);
        } else if (type === 'modified_double_elimination') {
            matches = generateDoubleEliminationMatches(tournamentPlayers, gameType);
        }

        const newTournament = {
            id: crypto.randomUUID(),
            name,
            type,
            players: tournamentPlayers,
            matches,
            status: 'active' as const,
            dateCreated: Date.now()
        };

        addTournament(newTournament);
        setIsCreating(false);
        resetForm();
    };

    const resetForm = () => {
        setName('');
        setSelectedPlayers([]);
        setType('round_robin');
    };

    const togglePlayer = (id: string) => {
        if (selectedPlayers.includes(id)) {
            setSelectedPlayers(selectedPlayers.filter(pid => pid !== id));
        } else {
            setSelectedPlayers([...selectedPlayers, id]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white">Tournaments</h2>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={20} />
                    New Tournament
                </button>
            </div>

            {isCreating && (
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 animate-in fade-in slide-in-from-top-4 space-y-6">
                    <h3 className="text-xl font-semibold text-white">Create Tournament</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Tournament Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Saturday Night 8-Ball"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Format</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value as TournamentType)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none"
                                >
                                    <option value="round_robin">Round Robin</option>
                                    <option value="modified_double_elimination">Double Elimination</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Game Type</label>
                                <select
                                    value={gameType}
                                    onChange={(e) => setGameType(e.target.value as GameType)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none"
                                >
                                    <option value="8-ball">8-Ball</option>
                                    <option value="9-ball">9-Ball</option>
                                    <option value="10-ball">10-Ball</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Select Players ({selectedPlayers.length})</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-900 rounded-lg">
                                {players.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => togglePlayer(p.id)}
                                        className={`px-3 py-2 rounded text-sm text-left transition-colors ${selectedPlayers.includes(p.id)
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                            }`}
                                    >
                                        {p.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setIsCreating(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={!name || selectedPlayers.length < 2}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Create & Generate Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {tournaments.length === 0 ? (
                <div className="text-center py-20 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
                    <Trophy size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">No tournaments found.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {tournaments.map(t => (
                        <Link
                            key={t.id}
                            to={`/tournaments/${t.id}`}
                            className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
                                    <Trophy size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{t.name}</h3>
                                    <div className="flex gap-4 text-sm text-gray-400 mt-1">
                                        <span className="flex items-center gap-1"><Users size={14} /> {t.players.length} Players</span>
                                        <span className="capitalize">{t.type.replace(/_/g, ' ')}</span>
                                        <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(t.dateCreated).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <ChevronRight className="text-gray-600 group-hover:text-blue-500 transition-colors" />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};
