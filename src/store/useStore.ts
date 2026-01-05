import { create } from 'zustand';
import type { Player, Match, Tournament } from '../types';

interface AppState {
    players: Player[];
    matches: Match[];
    tournaments: Tournament[];

    // Actions
    fetchInitialData: () => Promise<void>;
    addPlayer: (player: Player) => Promise<void>;
    deletePlayer: (id: string) => Promise<void>;
    addMatch: (match: Match) => Promise<void>;
    updateMatch: (id: string, updates: Partial<Match>) => Promise<void>;
    addTournament: (tournament: Tournament) => Promise<void>;
    updateTournament: (id: string, updates: Partial<Tournament>) => Promise<void>;
}

// Use env var or fallback to the known production backend
const API_URL = import.meta.env.VITE_API_URL || 'https://scorekeepersvc.azurewebsites.net/api';

export const useStore = create<AppState>((set) => ({
    players: [],
    matches: [],
    tournaments: [],

    fetchInitialData: async () => {
        try {
            const [pRes, mRes, tRes] = await Promise.all([
                fetch(`${API_URL}/players`),
                fetch(`${API_URL}/matches`),
                fetch(`${API_URL}/tournaments`)
            ]);

            const players = await pRes.json();
            const matches = await mRes.json();
            const tournaments = await tRes.json();

            set({ players, matches, tournaments });
        } catch (error) {
            console.error("Failed to fetch data:", error);
        }
    },

    addPlayer: async (player) => {
        // Optimistic
        set((state) => ({ players: [...state.players, player] }));
        try {
            await fetch(`${API_URL}/players`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(player)
            });
        } catch (error) {
            console.error("Failed to add player:", error);
        }
    },

    deletePlayer: async (id) => {
        set((state) => ({ players: state.players.filter((p) => p.id !== id) }));
        try {
            await fetch(`${API_URL}/players/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error("Failed to delete player:", error);
        }
    },

    addMatch: async (match) => {
        set((state) => ({ matches: [...state.matches, match] }));
        try {
            await fetch(`${API_URL}/matches`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(match)
            });
        } catch (error) {
            console.error("Failed to add match:", error);
        }
    },

    updateMatch: async (id, updates) => {
        set((state) => {
            // 1. Update global matches list
            const newMatches = state.matches.map((m) =>
                m.id === id ? { ...m, ...updates } : m
            );

            // 2. Update nested tournament matches
            let newTournaments = state.tournaments.map((t) => ({
                ...t,
                matches: t.matches.map((m) =>
                    m.id === id ? { ...m, ...updates } : m
                )
            }));

            // 3. Progression logic (moving winners)
            if (updates.status === 'completed' && updates.winnerId) {
                newTournaments = newTournaments.map(t => {
                    const finishedMatch = t.matches.find(m => m.id === id);
                    if (!finishedMatch || !finishedMatch.nextMatchId) return t;

                    const winner = finishedMatch.winnerId === finishedMatch.player1.id
                        ? finishedMatch.player1
                        : finishedMatch.player2;

                    return {
                        ...t,
                        matches: t.matches.map(m => {
                            if (m.id === finishedMatch.nextMatchId) {
                                // Slot winner into available spot
                                if (m.player1.id === 'tbd' || m.player1.id === 'bye') {
                                    return { ...m, player1: winner, scores: { ...m.scores, [winner.id]: { playerId: winner.id, totalPoints: 0, gamesWon: 0, innings: 0, defensiveShots: 0, timeouts: 0 } } };
                                } else {
                                    return { ...m, player2: winner, scores: { ...m.scores, [winner.id]: { playerId: winner.id, totalPoints: 0, gamesWon: 0, innings: 0, defensiveShots: 0, timeouts: 0 } } };
                                }
                            }
                            return m;
                        })
                    };
                });
            }

            return { matches: newMatches, tournaments: newTournaments };
        });

        try {
            await fetch(`${API_URL}/matches/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
        } catch (error) {
            console.error("Failed to update match:", error);
        }
    },

    addTournament: async (tournament) => {
        set((state) => ({ tournaments: [...state.tournaments, tournament] }));
        try {
            await fetch(`${API_URL}/tournaments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tournament)
            });
        } catch (error) {
            console.error("Failed to add tournament:", error);
        }
    },

    updateTournament: async (id, updates) => {
        set((state) => ({
            tournaments: state.tournaments.map((t) =>
                t.id === id ? { ...t, ...updates } : t
            ),
        }));
        // TODO: Backend endpoint for tournament update if needed
    }
}));
