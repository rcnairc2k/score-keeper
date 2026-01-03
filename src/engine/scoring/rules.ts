import type { SkillLevel8Ball, SkillLevel9Ball } from '../../types';

// APA 9-Ball "Points Must Win" Table
export const getPointsNeeded9Ball = (sl: SkillLevel9Ball): number => {
    const pointsMap: Record<SkillLevel9Ball, number> = {
        1: 14,
        2: 19,
        3: 25,
        4: 31,
        5: 38,
        6: 46,
        7: 55,
        8: 65,
        9: 75,
    };
    return pointsMap[sl] || 31; // Default to mid-range if undefined
};

// APA 8-Ball "Games Must Win" Logic
// This often depends on the specific matchup table (S/L vs S/L).
// Simplified lookup based on standard "Race Grid"
export const getGamesNeeded8Ball = (sl1: SkillLevel8Ball, sl2: SkillLevel8Ball): [number, number] => {
    // Format: [SL1 Wins, SL2 Wins]
    // This is a simplified representation of the APA 8-Ball race grid.
    // In a real app, we might need the full matrix.
    // Implementing common matchups:

    // const total = sl1 + sl2; // Unused

    // Basic heuristic if exact table isn't used:
    // Usually it's (SL - 2) vs (SL - 2) but adjusted.
    // Let's use a small lookup for common example cases or a formula approximation.

    // Actual APA Grid is complex. Let's use the standard "Games Required" individual calc
    // and then adjust, OR use a direct lookup object.
    // For this MVP, I'll implement the formula approximation:
    // Games = SL for players SL 2-3? No, SL 7 plays to 5 usually vs SL 7.

    // Let's use a Matrix for correctness.
    // Rows: SL 2 to 7. Cols: SL 2 to 7.

    // [SL1][SL2] -> [RaceTo1, RaceTo2]
    const matrix: Record<string, [number, number]> = {
        // Equal Skill
        '2-2': [2, 2], '3-3': [2, 2], '4-4': [3, 3], '5-5': [4, 4], '6-6': [5, 5], '7-7': [5, 5],

        // One diff
        '2-3': [2, 3], '3-2': [3, 2],
        '3-4': [2, 3], '4-3': [3, 2],
        '4-5': [3, 4], '5-4': [4, 3],
        '5-6': [4, 5], '6-5': [5, 4],
        '6-7': [4, 5], '7-6': [5, 4],

        // Two diff
        '2-4': [2, 3], '4-2': [3, 2],
        '3-5': [2, 4], '5-3': [4, 2],
        '4-6': [3, 5], '6-4': [5, 3],
        '5-7': [3, 5], '7-5': [5, 3],

        // Three diff
        '2-5': [2, 4], '5-2': [4, 2],
        '3-6': [2, 5], '6-3': [5, 2],
        '4-7': [2, 5], '7-4': [5, 2],
        // '2-6'? Usually 2-5. '3-7'? Usually 2-5. 
        // Need to fill gaps with safe defaults.
    };

    const key = `${sl1}-${sl2}`;
    if (matrix[key]) return matrix[key];

    // Fallback Logic
    const diff = sl1 - sl2;
    // If sl1 is much higher
    if (diff > 0) {
        if (sl1 === 7 && sl2 <= 3) return [5, 2];
        if (sl1 === 6 && sl2 <= 2) return [5, 2];
        return [calculateBaseRace(sl1), calculateBaseRace(sl2)];
    } else {
        if (sl2 === 7 && sl1 <= 3) return [2, 5];
        if (sl2 === 6 && sl1 <= 2) return [2, 5];
        return [calculateBaseRace(sl1), calculateBaseRace(sl2)];
    }
};

const calculateBaseRace = (sl: number): number => {
    if (sl <= 3) return 2;
    if (sl === 4) return 3;
    if (sl === 5) return 4;
    return 5; // 6 and 7
};
