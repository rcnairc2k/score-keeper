export type SkillLevel8Ball = 2 | 3 | 4 | 5 | 6 | 7;
export type SkillLevel9Ball = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type GameType = '8-ball' | '9-ball' | '10-ball';

export interface Player {
    id: string;
    name: string;
    skillLevel8Ball?: SkillLevel8Ball;
    skillLevel9Ball?: SkillLevel9Ball;
    avatarUrl?: string;
}

export interface Inning {
    id: string;
    matchId: string;
    inningNumber: number;
    playerId: string; // The player who shot
    ballsPotted: number; // Points value
    ballsPottedList?: number[]; // Specific balls (for undo/history)
    deadBallsList?: number[]; // Specific balls (for undo/history)
    defensiveShots: number;
    isSafety: boolean;
    isDeadBall?: boolean; // 9/10 ball
    timestamp: number;
}

export interface MatchScore {
    playerId: string;
    totalPoints: number; // 9/10 ball
    gamesWon: number; // 8 ball
    innings: number;
    defensiveShots: number;
    timeouts: number;
}

export interface Match {
    id: string;
    player1: Player;
    player2: Player;
    type: GameType;
    startTime: number;
    endTime?: number;
    scores: Record<string, MatchScore>; // playerId -> Score
    innings: Inning[];
    winnerId?: string;
    status: 'scheduled' | 'in_progress' | 'completed';
}

export interface TournamentPlayer extends Player {
    seed?: number;
}

export type TournamentType = 'round_robin' | 'modified_double_elimination';

export interface Tournament {
    id: string;
    name: string;
    type: TournamentType;
    players: TournamentPlayer[];
    matches: Match[];
    status: 'draft' | 'active' | 'completed';
    dateCreated: number;
}
