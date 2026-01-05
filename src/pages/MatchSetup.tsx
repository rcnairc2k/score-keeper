import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import type { GameType } from '../types';
import { getGamesNeeded8Ball, getPointsNeeded9Ball } from '../engine/scoring/rules';

export const MatchSetup: React.FC = () => {
    const navigate = useNavigate();
    const { players, addMatch } = useStore();

    const [p1Id, setP1Id] = useState('');
    const [p2Id, setP2Id] = useState('');
    const [gameType, setGameType] = useState<GameType>('8-ball');

    const handleStartMatch = () => {
        if (!p1Id || !p2Id || p1Id === p2Id) return;

        const player1 = players.find(p => p.id === p1Id);
        const player2 = players.find(p => p.id === p2Id);

        if (!player1 || !player2) return;

        // Check Skill Levels
        if (gameType === '8-ball' && (!player1.skillLevel8Ball || !player2.skillLevel8Ball)) {
            alert("Both players must have an 8-Ball skill level defined.");
            return;
        }
        if ((gameType === '9-ball' || gameType === '10-ball') && (!player1.skillLevel9Ball || !player2.skillLevel9Ball)) {
            alert(`Both players must have a ${gameType === '9-ball' ? '9-Ball' : '10-Ball'} skill level defined.`);
            return;
        }

        const matchId = crypto.randomUUID();
        addMatch({
            id: matchId,
            player1,
            player2,
            type: gameType,
            startTime: Date.now(),
            scores: {
                [player1.id]: { playerId: player1.id, totalPoints: 0, gamesWon: 0, innings: 0, defensiveShots: 0, timeouts: 0 },
                [player2.id]: { playerId: player2.id, totalPoints: 0, gamesWon: 0, innings: 0, defensiveShots: 0, timeouts: 0 }
            },
            innings: [],
            status: 'in_progress'
        });

        navigate(`/match/${matchId}`);
    };

    const p1 = players.find(p => p.id === p1Id);
    const p2 = players.find(p => p.id === p2Id);

    // Calculate Race Preview
    let racePreview = '';
    if (p1 && p2) {
        if (gameType === '8-ball' && p1.skillLevel8Ball && p2.skillLevel8Ball) {
            const race = getGamesNeeded8Ball(p1.skillLevel8Ball, p2.skillLevel8Ball);
            racePreview = `Race: ${race[0]} - ${race[1]}`;
        } else if ((gameType === '9-ball' || gameType === '10-ball') && p1.skillLevel9Ball && p2.skillLevel9Ball) {
            const race1 = getPointsNeeded9Ball(p1.skillLevel9Ball);
            const race2 = getPointsNeeded9Ball(p2.skillLevel9Ball);
            racePreview = `Race: ${race1} - ${race2}`;
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold text-white mb-6">Start New Match</h2>

            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 space-y-6">

                {/* Game Type Selection */}
                <div className="space-y-3">
                    <label className="text-gray-400 font-medium">Game Type</label>
                    <div className="grid grid-cols-3 gap-3">
                        {(['8-ball', '9-ball', '10-ball'] as GameType[]).map(type => (
                            <button
                                key={type}
                                onClick={() => setGameType(type)}
                                className={`py-3 rounded-xl font-semibold capitalize border transition-all ${gameType === type
                                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Player Selection */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-gray-400 font-medium">Player 1</label>
                        <select
                            value={p1Id}
                            onChange={(e) => setP1Id(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                        >
                            <option value="">Select Player</option>
                            {players.filter(p => p.id !== p2Id).map(p => (
                                <option key={p.id} value={p.id}>{p.name} (SL {gameType === '8-ball' ? p.skillLevel8Ball : p.skillLevel9Ball})</option>
                            ))}
                        </select>
                        {p1 && (
                            <div className="text-sm text-gray-500 text-center">
                                Skill Level: {gameType === '8-ball' ? p1.skillLevel8Ball : p1.skillLevel9Ball}
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <label className="text-gray-400 font-medium">Player 2</label>
                        <select
                            value={p2Id}
                            onChange={(e) => setP2Id(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                        >
                            <option value="">Select Player</option>
                            {players.filter(p => p.id !== p1Id).map(p => (
                                <option key={p.id} value={p.id}>{p.name} (SL {gameType === '8-ball' ? p.skillLevel8Ball : p.skillLevel9Ball})</option>
                            ))}
                        </select>
                        {p2 && (
                            <div className="text-sm text-gray-500 text-center">
                                Skill Level: {gameType === '8-ball' ? p2.skillLevel8Ball : p2.skillLevel9Ball}
                            </div>
                        )}
                    </div>
                </div>

                {racePreview && (
                    <div className="bg-gray-700/50 p-4 rounded-xl text-center">
                        <span className="text-gray-400 uppercase text-xs font-bold tracking-wider">Race to</span>
                        <div className="text-2xl font-bold text-white mt-1">{racePreview}</div>
                    </div>
                )}

                <button
                    onClick={handleStartMatch}
                    disabled={!p1Id || !p2Id}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
                >
                    Start Match
                </button>

            </div>
        </div>
    );
};
