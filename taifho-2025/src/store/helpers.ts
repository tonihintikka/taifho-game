import type { PlayerColor, GameConfig, Piece } from '../types/game';

// Helper to get next player based on config
// Skips players who have already finished (in placements)
export const getNextPlayer = (
    current: PlayerColor, 
    config: GameConfig, 
    placements: PlayerColor[] = []
): PlayerColor => {
    const players = config.players;
    const len = players.length;
    let idx = players.indexOf(current);
    
    // Try each player in order until we find one not in placements
    for (let i = 0; i < len; i++) {
        idx = (idx + 1) % len;
        const nextPlayer = players[idx];
        if (!placements.includes(nextPlayer)) {
            return nextPlayer;
        }
    }
    
    // All players finished (shouldn't happen in normal game)
    return current;
};

// Helper to get previous player
export const getPrevPlayer = (current: PlayerColor, config: GameConfig): PlayerColor => {
    const idx = config.players.indexOf(current);
    return config.players[(idx - 1 + config.players.length) % config.players.length];
};

// Get active players (not yet finished)
export const getActivePlayers = (config: GameConfig, placements: PlayerColor[]): PlayerColor[] => {
    return config.players.filter(p => !placements.includes(p));
};

// Helper to deep copy board
export const copyBoard = (board: (Piece | null)[][]): (Piece | null)[][] =>
    board.map(row => row.map(cell => cell ? { ...cell } : null));
