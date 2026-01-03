import React, { useMemo } from 'react';
import type { Match } from '../types';
import { CircleOff } from 'lucide-react';

interface RackHistoryProps {
    match: Match;
}

interface RackStats {
    rackNumber: number;
    p1Score: number;
    p2Score: number;
    deadBalls: number;
    winnerId?: string;
    isComplete: boolean;
}

export const RackHistory: React.FC<RackHistoryProps> = ({ match }) => {
    const moneyBall = match.type === '10-ball' ? 10 : 9;

    const racks = useMemo(() => {
        const history: RackStats[] = [];
        let currentRack: RackStats = {
            rackNumber: 1,
            p1Score: 0,
            p2Score: 0,
            deadBalls: 0,
            isComplete: false
        };

        match.innings.forEach((inning) => {
            // Add points
            if (inning.playerId === match.player1.id) {
                currentRack.p1Score += inning.ballsPotted;
            } else {
                currentRack.p2Score += inning.ballsPotted;
            }

            // Count dead balls
            if (inning.deadBallsList) {
                currentRack.deadBalls += inning.deadBallsList.length;
            }

            // Check if Rack Ended (Money Ball Potted)
            // Note: If Money Ball is DEAD, it is spotted, so rack continues.
            // Only if POTTED does the rack end.
            if (inning.ballsPottedList && inning.ballsPottedList.includes(moneyBall)) {
                currentRack.winnerId = inning.playerId;
                currentRack.isComplete = true;
                history.push({ ...currentRack });

                // Start new rack
                currentRack = {
                    rackNumber: history.length + 1,
                    p1Score: 0,
                    p2Score: 0,
                    deadBalls: 0,
                    isComplete: false
                };
            }
        });

        // Add incomplete rack if it has any stats
        if (!currentRack.isComplete && (currentRack.p1Score > 0 || currentRack.p2Score > 0 || currentRack.deadBalls > 0)) {
            history.push(currentRack);
        } else if (history.length === 0) {
            // If no history at all, show empty rack 1
            history.push(currentRack);
        }

        return history.reverse(); // Newest first
    }, [match.innings, match.player1.id, moneyBall]);

    return (
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-4 mt-8">
            <h3 className="text-gray-400 text-sm font-bold uppercase mb-4">Rack History</h3>

            <div className="space-y-3 max-h-60 overflow-y-auto">
                {racks.map((rack) => (
                    <div key={rack.rackNumber} className={`p-3 rounded-lg border ${rack.isComplete ? 'bg-gray-900/50 border-gray-700/50' : 'bg-blue-900/20 border-blue-500/30'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 font-mono font-bold text-xs uppercase tracking-wider">Rack {rack.rackNumber}</span>
                                {!rack.isComplete && <span className="text-xs bg-blue-500 text-white px-1.5 rounded">Active</span>}
                            </div>
                            {rack.deadBalls > 0 && (
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <CircleOff size={12} /> {rack.deadBalls} Dead
                                </span>
                            )}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <div className={`flex items-center gap-2 ${rack.winnerId === match.player1.id ? 'text-green-400 font-bold' : 'text-gray-300'}`}>
                                <span>{match.player1.name}</span>
                                <span className="font-mono">{rack.p1Score}</span>
                            </div>
                            <div className="text-gray-600">vs</div>
                            <div className={`flex items-center gap-2 ${rack.winnerId === match.player2.id ? 'text-green-400 font-bold' : 'text-gray-300'}`}>
                                <span className="font-mono">{rack.p2Score}</span>
                                <span>{match.player2.name}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
