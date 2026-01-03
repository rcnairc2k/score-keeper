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

const API_URL = import.meta.env.VITE_API_URL

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
            const res = await fetch(`${API_URL}/players`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(player)
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Backend Status ${res.status}: ${text}`);
            }
        } catch (error) {
            console.error("CRITICAL: Failed to add player to backend. Data will be lost on refresh.", error);
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
        set((state) => ({
            matches: state.matches.map((m) =>
                m.id === id ? { ...m, ...updates } : m
            ),
        }));
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
