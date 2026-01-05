import type { Player, Match, GameType } from '../../types';

export const generateSingleEliminationMatches = (
    players: Player[],
    gameType: GameType
): Match[] => {
    if (players.length < 2) return [];

    let pool = [...players];
    // Bracket must be power of 2
    let bracketSize = 2;
    while (bracketSize < pool.length) bracketSize *= 2;

    // Add Byes
    while (pool.length < bracketSize) {
        pool.push({ id: 'bye', name: 'Bye' } as Player);
    }

    const matches: Match[] = [];
    const numRounds = Math.log2(bracketSize);

    // Initial Round (Round 1)
    const round1MatchIds: string[] = [];
    for (let i = 0; i < bracketSize / 2; i++) {
        const id = crypto.randomUUID();
        round1MatchIds.push(id);
        const p1 = pool[i * 2];
        const p2 = pool[i * 2 + 1];

        // We create the match even if it's a BYE, so the bracket is structurally complete
        // The UI/State will handle "auto-advancing" later
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
            round: 1
        });
    }

    // Placeholder matches for Round 2+ (to link nextMatchId)
    let currentRoundMatchIds = round1MatchIds;
    for (let r = 2; r <= numRounds; r++) {
        const nextRoundMatchIds: string[] = [];
        for (let i = 0; i < currentRoundMatchIds.length; i += 2) {
            const id = crypto.randomUUID();
            nextRoundMatchIds.push(id);

            // Link previous matches to this one
            const m1 = matches.find(m => m.id === currentRoundMatchIds[i]);
            const m2 = matches.find(m => m.id === currentRoundMatchIds[i + 1]);
            if (m1) m1.nextMatchId = id;
            if (m2) m2.nextMatchId = id;

            // Add the "Future" match
            // We use dummy players for now that will be replaced when winners advance
            const dummyPlayer = { id: 'tbd', name: 'TBD' } as Player;
            matches.push({
                id,
                player1: dummyPlayer,
                player2: dummyPlayer,
                type: gameType,
                startTime: Date.now(),
                scores: {
                    'tbd': { playerId: 'tbd', totalPoints: 0, gamesWon: 0, innings: 0, defensiveShots: 0, timeouts: 0 }
                },
                innings: [],
                status: 'scheduled',
                round: r
            });
        }
        currentRoundMatchIds = nextRoundMatchIds;
    }

    return matches;
};
