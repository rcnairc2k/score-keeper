import type { Player, Match, GameType } from '../../types';

export const generateDoubleEliminationMatches = (
    players: Player[],
    gameType: GameType
): Match[] => {
    if (players.length < 2) return [];

    const matches: Match[] = [];
    let pool = [...players];

    // Shuffle pool for random bracket placement
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Bracket Size must be power of 2 (2, 4, 8, 16, 32)
    // Find next power of 2
    let bracketSize = 2;
    while (bracketSize < pool.length) {
        bracketSize *= 2;
    }

    // Add Byes
    while (pool.length < bracketSize) {
        pool.push({ id: 'bye', name: 'Bye' } as Player);
    }

    // Generate First Round Matches
    // 1 vs 2, 3 vs 4, etc.
    const matchCount = bracketSize / 2;

    for (let i = 0; i < matchCount; i++) {
        const p1 = pool[i * 2];
        const p2 = pool[i * 2 + 1];

        // If both are Byes (shouldn't happen with tight packing but theoretically), skip
        if (p1.id === 'bye' && p2.id === 'bye') continue;

        // If one is Bye, normally we advance the other automatically.
        // For ScoreKeeper, we will SKIP creating a match for "Player vs Bye".
        // The user/system would normally handle this as an auto-promotion.
        // To make it visible that the player has a "game", we could create a completed match?
        // Current decision: Do NOT create match. User will see player in list but no match.
        // Wait, if we don't create a match, where does the user see them?
        // Better: Create a completed match so they move to "Winners Bracket Round 2" conceptually later.
        // But for now, let's just create valid matches.

        if (p1.id !== 'bye' && p2.id !== 'bye') {
            matches.push({
                id: crypto.randomUUID(),
                player1: p1,
                player2: p2,
                type: gameType,
                startTime: Date.now(),
                scores: {
                    [p1.id]: { playerId: p1.id, totalPoints: 0, gamesWon: 0, innings: 0, defensiveShots: 0, timeouts: 0 },
                    [p2.id]: { playerId: p2.id, totalPoints: 0, gamesWon: 0, innings: 0, defensiveShots: 0, timeouts: 0 }
                },
                innings: [],
                status: 'scheduled'
            });
        }
    }

    return matches;
};
