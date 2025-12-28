import type { Piece, PlayerColor } from '../types/game';
import { getGoalLine } from '../types/game';
import { BOARD_SIZE } from './boardUtils';

/**
 * Get piece counts for all players
 */
export const getPieceCounts = (board: (Piece | null)[][]): Record<PlayerColor, { total: number; atGoal: number }> => {
    const pieceCounts: Record<PlayerColor, { total: number; atGoal: number }> = {
        red: { total: 0, atGoal: 0 },
        blue: { total: 0, atGoal: 0 },
        yellow: { total: 0, atGoal: 0 },
        green: { total: 0, atGoal: 0 }
    };

    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            const piece = board[y][x];
            if (!piece) continue;

            pieceCounts[piece.color].total++;

            const goalLine = getGoalLine(piece.color);
            const isAtGoal = goalLine.axis === 'y'
                ? y === goalLine.value
                : x === goalLine.value;

            if (isAtGoal) {
                pieceCounts[piece.color].atGoal++;
            }
        }
    }

    return pieceCounts;
};

/**
 * Check if a specific player has finished (all pieces at goal)
 */
export const hasPlayerFinished = (board: (Piece | null)[][], color: PlayerColor): boolean => {
    const counts = getPieceCounts(board);
    const { total, atGoal } = counts[color];
    return total > 0 && total === atGoal;
};

/**
 * Check if a player has won (all of their pieces on their goal line)
 * Returns the winning player's color, or null if no winner yet.
 * In 4P game with placements tracking, this returns the first newly finished player.
 */
export const checkWinner = (
    board: (Piece | null)[][], 
    placements: PlayerColor[] = []
): PlayerColor | null => {
    const pieceCounts = getPieceCounts(board);

    // Check if any player has all pieces at goal (and not already placed)
    for (const color of ['red', 'blue', 'yellow', 'green'] as PlayerColor[]) {
        if (placements.includes(color)) continue; // Already finished
        
        const { total, atGoal } = pieceCounts[color];
        if (total > 0 && total === atGoal) {
            return color; // This player just finished!
        }
    }

    return null;
};

/**
 * Check if the game is fully over (for 4P: 3 players finished, for 2P: 1 player finished)
 */
export const isGameOver = (placements: PlayerColor[], playerCount: number): boolean => {
    if (playerCount === 2) {
        return placements.length >= 1;
    }
    // 4-player: game ends when 3 players have finished
    return placements.length >= 3;
};

/**
 * Get win progress for display (how many pieces at goal)
 */
export const getWinProgress = (board: (Piece | null)[][], color: PlayerColor): { atGoal: number; total: number } => {
    let total = 0;
    let atGoal = 0;
    const goalLine = getGoalLine(color);

    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            const piece = board[y][x];
            if (piece && piece.color === color) {
                total++;
                const isAtGoal = goalLine.axis === 'y'
                    ? y === goalLine.value
                    : x === goalLine.value;
                if (isAtGoal) atGoal++;
            }
        }
    }

    return { atGoal, total };
};
