import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMatchScorer } from '../hooks/useMatchScorer';
import { InningHistory } from '../components/InningHistory';
import { RackHistory } from '../components/RackHistory';

import { Shield, Target, Trophy, ArrowLeft, RotateCcw, RotateCcw as UndoIcon } from 'lucide-react';
import { BilliardBall } from '../components/BilliardBall';


export const MatchScorer: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { match, raceTo, addInning, recordGameWin, undoLastInning, resetMatch, addTimeout } = useMatchScorer(id!);

    // Local state for current inning
    const [currentShooter, setCurrentShooter] = useState<string>(''); // Player ID

    // View Toggle State
    const [viewType, setViewType] = useState<'innings' | 'racks'>('innings');

    // Ball State
    const [ballsOnTable, setBallsOnTable] = useState<number[]>([]);
    const [pottedBalls, setPottedBalls] = useState<number[]>([]); // Current inning
    const [deadBalls, setDeadBalls] = useState<number[]>([]);     // Current inning

    const [defensiveShots, setDefensiveShots] = useState(0);

    // Initial Load & State Management
    useEffect(() => {
        if (match && ballsOnTable.length === 0 && pottedBalls.length === 0 && deadBalls.length === 0) {
            // Only reset if empty (initial load)
            // Better: check if we need to load state?
            // For now, simple reset if empty.
            if (match.innings.length === 0) {
                resetRack();
            } else {
                // TODO: Reconstruct state from history if complex?
                // For MVP, if we reload page, we might lose "Rack State" unless we persist it.
                // We will just default to full rack if page reload for safety, user can correct.
                resetRack();
            }

            if (!currentShooter && match.player1) {
                // If match has innings, set shooter to whoever is NEXT
                if (match.innings.length > 0) {
                    const lastInning = match.innings[match.innings.length - 1];
                    const p1Id = match.player1.id;
                    const p2Id = match.player2.id;
                    // If last shooter was P1, now P2.
                    setCurrentShooter(lastInning.playerId === p1Id ? p2Id : p1Id);
                } else {
                    setCurrentShooter(match.player1.id);
                }
            }
        }
    }, [match?.id]);

    if (!match) {
        return <div className="text-white p-8">Match not found</div>;
    }

    const p1 = match.player1;
    const p2 = match.player2;
    const s1 = match.scores[p1.id];
    const s2 = match.scores[p2.id];
    const is8Ball = match.type === '8-ball';
    const moneyBall = match.type === '10-ball' ? 10 : 9;

    // Derived State: Match Over?
    const isMatchOver = (s1.totalPoints >= raceTo[p1.id] && raceTo[p1.id] > 0) ||
        (s2.totalPoints >= raceTo[p2.id] && raceTo[p2.id] > 0) ||
        (s2.totalPoints >= raceTo[p2.id] && raceTo[p2.id] > 0) ||
        (is8Ball && (s1.gamesWon >= raceTo[p1.id] || s2.gamesWon >= raceTo[p2.id]));

    // APA-style Inning Count: Number of turns completed by Player 2 (Bottom Player)
    // We assume Player 2 is always the "Bottom" player in the schema for now.
    const apaInnings = match.innings.filter(i => i.playerId === p2.id).length;

    const resetRack = () => {
        const count = match.type === '10-ball' ? 10 : 9;
        setBallsOnTable(Array.from({ length: count }, (_, i) => i + 1));
        setPottedBalls([]);
        setDeadBalls([]);
    };

    const handleFullReset = () => {
        if (confirm("Reset current Game? This will clear all scores.")) {
            resetMatch(); // Resets match stats
            resetRack();  // Resets balls
        }
    };

    const handleBallClick = (ball: number) => {
        if (ballsOnTable.includes(ball)) {
            setBallsOnTable(ballsOnTable.filter(b => b !== ball));
            setPottedBalls([...pottedBalls, ball].sort((a, b) => a - b));
        } else if (pottedBalls.includes(ball)) {
            setPottedBalls(pottedBalls.filter(b => b !== ball));
            setDeadBalls([...deadBalls, ball].sort((a, b) => a - b));
        } else if (deadBalls.includes(ball)) {
            setDeadBalls(deadBalls.filter(b => b !== ball));
            setBallsOnTable([...ballsOnTable, ball].sort((a, b) => a - b));
        }
    };

    const handleEndInning = () => {
        let points = 0;
        if (!is8Ball) {
            points = pottedBalls.reduce((acc, ball) => {
                const ballPoints = (ball === 9 && match.type === '9-ball') || (ball === 10 && match.type === '10-ball') ? 2 : 1;
                return acc + ballPoints;
            }, 0);
        }

        const moneyBallPotted = pottedBalls.includes(moneyBall);

        // Record Inning
        addInning({
            id: crypto.randomUUID(),
            matchId: match.id,
            inningNumber: match.innings.length + 1,
            playerId: currentShooter,
            ballsPotted: points,
            ballsPottedList: pottedBalls,
            deadBallsList: deadBalls,
            defensiveShots: defensiveShots,
            isSafety: defensiveShots > 0,
            isDeadBall: deadBalls.length > 0,
            timestamp: Date.now()
        });

        if (moneyBallPotted) {
            // Rack Down -> Reset
            // Winner keeps turn (Winner Breaks)
            resetRack();
            // Do NOT switch shooter
        } else {
            // Rack Continues
            // Handle Spotting (Only Money Ball spots in APA usually, others stay down)
            const moneyBallDead = deadBalls.includes(moneyBall);

            if (moneyBallDead) {
                // Spot the money ball
                setBallsOnTable(prev => [...prev, moneyBall].sort((a, b) => a - b));
            }

            // Clear selections
            setPottedBalls([]);
            setDeadBalls([]);

            // Switch shooter
            setCurrentShooter(currentShooter === p1.id ? p2.id : p1.id);
        }

        setDefensiveShots(0);
    };

    const handleUndo = () => {
        const lastInning = undoLastInning();
        if (lastInning) {
            // Reconstruct Table State logic
            const remainingInnings = match.innings.slice(0, match.innings.length - 1);

            let ballsGone: number[] = [];
            let rackStartIndex = -1;

            // Find start of this rack
            for (let i = remainingInnings.length - 1; i >= 0; i--) {
                const inn = remainingInnings[i];
                if (inn.ballsPottedList?.includes(moneyBall) || inn.deadBallsList?.includes(moneyBall)) {
                    rackStartIndex = i;
                    break;
                }
            }

            // Collect balls gone
            const currentRackInnings = remainingInnings.slice(rackStartIndex + 1);
            currentRackInnings.forEach(inn => {
                if (inn.ballsPottedList) ballsGone.push(...inn.ballsPottedList);
                if (inn.deadBallsList) ballsGone.push(...inn.deadBallsList);
            });

            const count = match.type === '10-ball' ? 10 : 9;
            const fullRack = Array.from({ length: count }, (_, i) => i + 1);

            const newState = fullRack.filter(b => !ballsGone.includes(b));

            setBallsOnTable(newState);
            setPottedBalls([]);
            setDeadBalls([]);

            setCurrentShooter(lastInning.playerId);
        }
    };

    const handle8BallWin = (winnerId: string) => {
        recordGameWin(winnerId);
        setCurrentShooter(winnerId);
    };



    if (isMatchOver) {
        return (
            <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700 text-center animate-in zoom-in-95 duration-300">
                    <Trophy size={64} className="mx-auto text-yellow-500 mb-6" />
                    <h2 className="text-3xl font-bold text-white mb-2">Match Complete!</h2>
                    <p className="text-gray-400 mb-8">Final Score</p>

                    <div className="flex justify-center items-center gap-8 mb-8">
                        <div>
                            <div className="text-xl font-bold text-blue-400">{p1.name}</div>
                            <div className="text-4xl font-mono text-white mt-2">
                                {is8Ball ? s1.gamesWon : s1.totalPoints}
                            </div>
                        </div>
                        <div className="text-gray-600 font-bold text-xl">VS</div>
                        <div>
                            <div className="text-xl font-bold text-purple-400">{p2.name}</div>
                            <div className="text-4xl font-mono text-white mt-2">
                                {is8Ball ? s2.gamesWon : s2.totalPoints}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl"
                    >
                        Back to Dashboard
                    </button>

                    <button
                        onClick={handleUndo}
                        className="mt-4 text-gray-400 hover:text-white text-sm"
                    >
                        Undo Last Action (Return to Game)
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => navigate('/')} className="flex items-center text-gray-400 hover:text-white">
                    <ArrowLeft size={20} className="mr-2" /> Back
                </button>
                <div className="flex gap-2">
                    {/* Reset Button (Top Right now) */}
                    <button
                        onClick={handleFullReset}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-red-400 hover:text-red-300 rounded-lg text-sm transition-colors border border-gray-700"
                        title="Reset Game (Clear Scores)"
                    >
                        <RotateCcw size={16} /> Reset
                    </button>
                </div>
            </div>

            {/* Scoreboard Header */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Player 1 Card */}
                <div className={`p-4 rounded-2xl border-2 transition-all ${currentShooter === p1.id ? 'border-blue-500 bg-gray-800' : 'border-transparent bg-gray-800/50'}`}>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-white">{p1.name}</h3>
                        <div className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">SL {is8Ball ? p1.skillLevel8Ball : p1.skillLevel9Ball}</div>
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="text-sm text-gray-400">Score</div>
                            <div className="text-4xl font-mono font-bold text-blue-400">
                                {is8Ball ? s1.gamesWon : s1.totalPoints}
                                <span className="text-lg text-gray-500 font-normal"> / {raceTo[p1.id]}</span>
                            </div>
                        </div>

                        {is8Ball && (
                            <button
                                onClick={() => handle8BallWin(p1.id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
                            >
                                <Trophy size={14} /> Won Rack
                            </button>
                        )}
                        <button
                            onClick={() => addTimeout(p1.id)}
                            className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg flex items-center gap-2 ml-2"
                            title="Record Timeout"
                        >
                            <span className="text-xs font-bold uppercase">T/O</span>
                            <span className="bg-gray-900 px-1.5 rounded text-xs">{s1.timeouts || 0}</span>
                        </button>
                    </div>
                </div>

                {/* Player 2 Card */}
                <div className={`p-4 rounded-2xl border-2 transition-all ${currentShooter === p2.id ? 'border-purple-500 bg-gray-800' : 'border-transparent bg-gray-800/50'}`}>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-white">{p2.name}</h3>
                        <div className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">SL {is8Ball ? p2.skillLevel8Ball : p2.skillLevel9Ball}</div>
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="text-sm text-gray-400">Score</div>
                            <div className="text-4xl font-mono font-bold text-purple-400">
                                {is8Ball ? s2.gamesWon : s2.totalPoints}
                                <span className="text-lg text-gray-500 font-normal"> / {raceTo[p2.id]}</span>
                            </div>
                        </div>

                        {is8Ball && (
                            <button
                                onClick={() => handle8BallWin(p2.id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
                            >
                                <Trophy size={14} /> Won Rack
                            </button>
                        )}
                        <button
                            onClick={() => addTimeout(p2.id)}
                            className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg flex items-center gap-2 ml-2"
                            title="Record Timeout"
                        >
                            <span className="text-xs font-bold uppercase">T/O</span>
                            <span className="bg-gray-900 px-1.5 rounded text-xs">{s2.timeouts || 0}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Inning Controls */}
            <div className="bg-gray-800 rounded-3xl p-6 border border-gray-700 shadow-xl">
                <div className="text-center mb-6">
                    <span className="bg-gray-900 border border-gray-600 text-gray-300 px-4 py-1.5 rounded-full text-sm font-medium">
                        Score Sheet Innings: {apaInnings}
                    </span>
                    <h2 className="text-2xl font-bold text-white mt-4">
                        {currentShooter === p1.id ? p1.name : p2.name}'s Turn
                    </h2>
                </div>

                <div className="space-y-8 max-w-lg mx-auto mb-8">
                    {/* Points (9-Ball Only) */}
                    {!is8Ball && (
                        <div>
                            <label className="text-gray-400 text-sm font-medium mb-3 flex items-center justify-center gap-2">
                                <Target size={16} /> Select Balls (Click to Pot / Mark Dead)
                            </label>

                            {/* Ball Grid */}
                            <div className="flex flex-wrap justify-center gap-3">
                                {/* Display 1-9 or 1-10. Sorted: Table -> Potted -> Dead */}
                                {Array.from({ length: moneyBall }, (_, i) => i + 1).map(ball => {
                                    const isOnTable = ballsOnTable.includes(ball);
                                    const isPotted = pottedBalls.includes(ball);
                                    const isDead = deadBalls.includes(ball);
                                    const isGone = !isOnTable && !isPotted && !isDead;

                                    return (
                                        <button
                                            key={ball}
                                            disabled={isGone}
                                            onClick={() => handleBallClick(ball)}
                                            className={`
                                                relative rounded-full transition-all transform active:scale-95
                                                ${isOnTable ? 'opacity-100 hover:scale-105 shadow-xl' : ''}
                                                ${isPotted ? 'opacity-50 ring-4 ring-green-500 scale-90 grayscale-[0.5]' : ''}
                                                ${isDead ? 'opacity-30 grayscale scale-75 line-through' : ''}
                                                ${isGone ? 'opacity-10 grayscale scale-75 blur-[1px] cursor-default' : ''}
                                            `}
                                        >
                                            <BilliardBall number={ball} size="w-16 h-16" />

                                            {/* Status Overlays */}
                                            {isPotted && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="bg-green-600 text-white rounded-full p-1 shadow-md">
                                                        <Target size={20} />
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                            <div className="flex justify-center gap-6 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-500" /> On Table</span>
                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full border border-green-500" /> Potted</span>
                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full border border-gray-600" /> Dead</span>
                            </div>
                        </div>
                    )}

                    {/* Defensive Shots */}
                    <div className="flex flex-col items-center">
                        <label className="text-gray-400 text-sm font-medium mb-3 flex items-center gap-2">
                            <Shield size={16} /> Defensive Shots
                        </label>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setDefensiveShots(Math.max(0, defensiveShots - 1))}
                                className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-xl"
                            >-</button>
                            <span className="text-3xl font-mono font-bold text-white w-8 text-center">{defensiveShots}</span>
                            <button
                                onClick={() => setDefensiveShots(defensiveShots + 1)}
                                className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-xl"
                            >+</button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    {/* Undo Button (Bottom Main Area now) */}
                    <button
                        onClick={handleUndo}
                        disabled={match.innings.length === 0}
                        className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center transition-all"
                        title="Undo Last Inning"
                    >
                        <UndoIcon size={24} />
                    </button>

                    {(() => {
                        const moneyBallPotted = pottedBalls.includes(moneyBall);
                        const moneyBallDead = deadBalls.includes(moneyBall);

                        let buttonText = "End Inning";
                        let buttonColor = "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500";

                        if (moneyBallPotted) {
                            buttonText = "Rack Won - Keep Turn";
                            buttonColor = "bg-green-600 hover:bg-green-500";
                        } else if (moneyBallDead) {
                            buttonText = "Spot 9 & End Turn";
                            buttonColor = "bg-orange-600 hover:bg-orange-500";
                        }

                        return (
                            <button
                                onClick={handleEndInning}
                                className={`flex-1 ${buttonColor} text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]`}
                            >
                                {buttonText}
                            </button>
                        );
                    })()}
                </div>
            </div>

            {/* View Toggle */}
            <div className="flex justify-end gap-2 mt-8 mb-2">
                <button
                    onClick={() => setViewType('innings')}
                    className={`px-3 py-1 text-sm rounded-lg border transition-colors ${viewType === 'innings' ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-400 border-gray-700 hover:text-white'}`}
                >Innings</button>
                <button
                    onClick={() => setViewType('racks')}
                    className={`px-3 py-1 text-sm rounded-lg border transition-colors ${viewType === 'racks' ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-400 border-gray-700 hover:text-white'}`}
                >Racks</button>
            </div>

            {/* Inning/Rack List */}
            {viewType === 'innings' ? (
                <InningHistory match={match} />
            ) : (
                <RackHistory match={match} />
            )}
        </div>
    );
};
