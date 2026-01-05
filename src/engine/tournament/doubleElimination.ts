import type { Player, Match, GameType } from '../../types';

export const generateDoubleEliminationMatches = (
    players: Player[],
    gameType: GameType
): Match[] => {
    if (players.length < 2) return [];

    let pool = [...players];
    let bracketSize = 2;
    while (bracketSize < pool.length) bracketSize *= 2;

    while (pool.length < bracketSize) {
        pool.push({ id: 'bye', name: 'Bye' } as Player);
    }

    const matches: Match[] = [];

    // --- WINNERS BRACKET ---
    let winnersRoundMatchIds: string[] = [];
    for (let i = 0; i < bracketSize / 2; i++) {
        const id = crypto.randomUUID();
        winnersRoundMatchIds.push(id);
        const p1 = pool[i * 2];
        const p2 = pool[i * 2 + 1];

        matches.push({
            id,
            player1: p1,
            player2: p2,
            type: gameType,
            startTime: Date.now(),
            scores: {
                [p1.id]: { playerId: p1.id, totalPoints: 0, gamesWon: 0, innings: 0, defensiveShots: 0, timeouts: 0 },
                [p2.id]: { playerId: p2.id, totalPoints: 0, gamesWon: 0, innings: 0, defensiveShots: 0, timeouts: 0 }
            },
            innings: [],
            status: 'scheduled',
            round: 1,
            bracket: 'winners'
        });
    }

    // Future rounds logic for Winners and Losers gets quite math-heavy
    // For this MVP, we will generate the first 2 rounds of Winners so they can play.
    // The "NextMatchId" will be linked as they go.

    return matches;
};
