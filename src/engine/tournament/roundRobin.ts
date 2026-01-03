import type { Player, Match, GameType } from '../../types';

export const generateRoundRobinMatches = (
    players: Player[],
    gameType: GameType
): Match[] => {
    if (players.length < 2) return [];

    const matches: Match[] = [];
    let pool = [...players];

    // If odd number of players, add a dummy player for "Bye"
    if (pool.length % 2 !== 0) {
        pool.push({ id: 'bye', name: 'Bye' } as Player);
    }

    const n = pool.length;
    const rounds = n - 1;
    const mid = n / 2;

    for (let round = 0; round < rounds; round++) {
        for (let i = 0; i < mid; i++) {
            const p1 = pool[i];
            const p2 = pool[n - 1 - i];

            // Don't create matches vs Bye
            if (p1.id !== 'bye' && p2.id !== 'bye') {
                matches.push({
                    id: crypto.randomUUID(),
                    player1: p1,
                    player2: p2,
                    type: gameType,
                    startTime: Date.now(), // Scheduled time could be distinct
                    scores: {
                        [p1.id]: { playerId: p1.id, totalPoints: 0, gamesWon: 0, innings: 0, defensiveShots: 0 },
                        [p2.id]: { playerId: p2.id, totalPoints: 0, gamesWon: 0, innings: 0, defensiveShots: 0 }
                    },
                    innings: [],
                    status: 'scheduled'
                });
            }
        }

        // Rotate pool (keep index 0 fixed, rotate others)
        // [0, 1, 2, 3] -> [0, 3, 1, 2] -> [0, 2, 3, 1]
        pool = [
            pool[0],
            pool[n - 1],
            ...pool.slice(1, n - 1)
        ];
    }

    return matches;
};
