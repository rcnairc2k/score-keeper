import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';
import type { MatchScore, Inning } from '../types';
import { getGamesNeeded8Ball, getPointsNeeded9Ball } from '../engine/scoring/rules';

export const useMatchScorer = (matchId: string) => {
    const { matches, updateMatch } = useStore();
    const match = matches.find(m => m.id === matchId);

    const [raceTo, setRaceTo] = useState<{ [playerId: string]: number }>({});

    useEffect(() => {
        if (!match) return;

        // Calculate Race Target
        const p1 = match.player1;
        const p2 = match.player2;
        const target: { [key: string]: number } = {};

        if (match.type === '8-ball') {
            if (p1.skillLevel8Ball && p2.skillLevel8Ball) {
                const races = getGamesNeeded8Ball(p1.skillLevel8Ball, p2.skillLevel8Ball);
                target[p1.id] = races[0];
                target[p2.id] = races[1];
            }
        } else { // 9/10 ball
            if (p1.skillLevel9Ball && p2.skillLevel9Ball) {
                target[p1.id] = getPointsNeeded9Ball(p1.skillLevel9Ball);
                target[p2.id] = getPointsNeeded9Ball(p2.skillLevel9Ball);
            }
        }
        setRaceTo(target);
    }, [match?.id]); // Only re-calc if match ID changes (or simplified dependency)

    const updateScore = useCallback((scoreUpdates: Record<string, Partial<MatchScore>>) => {
        if (!match) return;
        const newScores = { ...match.scores };

        Object.keys(scoreUpdates).forEach(pid => {
            if (newScores[pid]) {
                newScores[pid] = { ...newScores[pid], ...scoreUpdates[pid] };
            }
        });

        updateMatch(matchId, { scores: newScores });
    }, [match, matchId, updateMatch]);

    const addInning = useCallback((inning: Inning) => {
        if (!match) return;

        // Update Match Statistics
        const pId = inning.playerId;
        const currentScore = match.scores[pId];
        if (!currentScore) return;

        const updates: Partial<MatchScore> = {
            innings: currentScore.innings + 1,
            defensiveShots: currentScore.defensiveShots + inning.defensiveShots
        };

        if (match.type === '9-ball' || match.type === '10-ball') {
            updates.totalPoints = currentScore.totalPoints + inning.ballsPotted;
        }

        // For 8-ball, games won is usually manual or triggered by "Game Win" button, not just inning

        updateMatch(matchId, {
            innings: [...match.innings, inning],
            scores: {
                ...match.scores,
                [pId]: { ...currentScore, ...updates }
            }
        });
    }, [match, matchId, updateMatch]);

    const recordGameWin = useCallback((winnerId: string) => {
        if (!match) return;
        if (match.type !== '8-ball') return; // Only for 8-ball usually

        const currentScore = match.scores[winnerId];
        updateMatch(matchId, {
            scores: {
                ...match.scores,
                [winnerId]: { ...currentScore, gamesWon: currentScore.gamesWon + 1 }
            }
        });
    }, [match, matchId, updateMatch]);

    const undoLastInning = useCallback(() => {
        if (!match || match.innings.length === 0) return null;

        const lastInning = match.innings[match.innings.length - 1];
        const pId = lastInning.playerId;
        const currentScore = match.scores[pId];

        const updates: Partial<MatchScore> = {
            innings: Math.max(0, currentScore.innings - 1),
            defensiveShots: Math.max(0, currentScore.defensiveShots - lastInning.defensiveShots)
        };

        if (match.type === '9-ball' || match.type === '10-ball') {
            updates.totalPoints = Math.max(0, currentScore.totalPoints - lastInning.ballsPotted);
        }

        const newInnings = match.innings.slice(0, -1);

        updateMatch(matchId, {
            innings: newInnings,
            scores: {
                ...match.scores,
                [pId]: { ...currentScore, ...updates }
            }
        });

        return lastInning; // Return details so UI can restore table state if needed
    }, [match, matchId, updateMatch]);

    const resetMatch = useCallback(() => {
        if (!match) return;

        const emptyScore = {
            innings: 0,
            defensiveShots: 0,
            totalPoints: 0,
            gamesWon: 0,
            matchPoints: 0
        };

        updateMatch(matchId, {
            innings: [],
            scores: {
                [match.player1.id]: { ...emptyScore, playerId: match.player1.id },
                [match.player2.id]: { ...emptyScore, playerId: match.player2.id }
            }
        });
    }, [match, matchId, updateMatch]);

    return {
        match,
        raceTo,
        addInning,
        updateScore,
        recordGameWin,
        undoLastInning,
        resetMatch
    };
};
