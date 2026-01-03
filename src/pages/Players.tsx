import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import type { Player, SkillLevel8Ball, SkillLevel9Ball } from '../types';
import { UserPlus, Trash2, User } from 'lucide-react';


export const Players: React.FC = () => {
    const { players, addPlayer, deletePlayer } = useStore();
    const [isOpen, setIsOpen] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [sl8, setSl8] = useState<SkillLevel8Ball | ''>('');
    const [sl9, setSl9] = useState<SkillLevel9Ball | ''>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        const newPlayer: Player = {
            id: crypto.randomUUID(),
            name: name.trim(),
            skillLevel8Ball: sl8 ? (Number(sl8) as SkillLevel8Ball) : undefined,
            skillLevel9Ball: sl9 ? (Number(sl9) as SkillLevel9Ball) : undefined,
        };

        addPlayer(newPlayer);

        // Reset
        setName('');
        setSl8('');
        setSl9('');
        setIsOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white">Players</h2>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <UserPlus size={20} />
                    Add Player
                </button>
            </div>

            {isOpen && (
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-xl font-semibold mb-4 text-white">New Player</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Enter player name"
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">8-Ball Skill Level</label>
                                <select
                                    value={sl8}
                                    onChange={(e) => setSl8(e.target.value as any)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Select Level</option>
                                    {[2, 3, 4, 5, 6, 7].map(l => (
                                        <option key={l} value={l}>SL {l}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">9/10-Ball Skill Level</label>
                                <select
                                    value={sl9}
                                    onChange={(e) => setSl9(e.target.value as any)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Select Level</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(l => (
                                        <option key={l} value={l}>SL {l}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!name.trim()}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Save Player
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {players.length === 0 ? (
                <div className="text-center py-20 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
                    <User size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">No players added yet. Click "Add Player" to get started.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {players.map((player) => (
                        <div key={player.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center justify-between group hover:border-blue-500/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white">
                                    {player.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">{player.name}</h3>
                                    <div className="flex gap-2 text-xs text-gray-400 mt-1">
                                        <span className="bg-gray-900 px-2 py-0.5 rounded">8-Ball: {player.skillLevel8Ball || '-'}</span>
                                        <span className="bg-gray-900 px-2 py-0.5 rounded">9-Ball: {player.skillLevel9Ball || '-'}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => deletePlayer(player.id)}
                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
