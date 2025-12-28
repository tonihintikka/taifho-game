/**
 * Position History & Progress Tracking
 * 
 * Tracks board positions to detect repetition (like chess 3-fold rule).
 * Also tracks progress toward goal to penalize stagnation.
 */

import type { Piece, PlayerColor } from '../types/game';
import { getGoalLine } from '../types/game';
import { computeHash } from './transpositionTable';
import { BOARD_SIZE } from '../utils/boardUtils';

// Position history: hash -> count
let positionHistory: Map<string, number> = new Map();

// Progress tracking: player -> best distance achieved
let bestProgress: Map<PlayerColor, number> = new Map();

// Move counter for escalating penalties
let moveCount = 0;

// Stagnation counter: moves without progress
let stagnationCount: Map<PlayerColor, number> = new Map();

// Maximum repetitions before forcing random move
const MAX_REPETITIONS = 3;

// Penalty multiplier per repetition
const REPETITION_PENALTY_PER_COUNT = 2000;

// Stagnation penalty (increases over time)
const STAGNATION_PENALTY_BASE = 500;

/**
 * Reset all history (call at game start)
 */
export const resetPositionHistory = (): void => {
    positionHistory = new Map();
    bestProgress = new Map();
    stagnationCount = new Map();
    moveCount = 0;
};

/**
 * Calculate total distance of all pieces from goal
 */
const calculateTotalDistance = (
    board: (Piece | null)[][],
    color: PlayerColor
): number => {
    const goalLine = getGoalLine(color);
    let totalDist = 0;
    
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            const piece = board[y][x];
            if (piece && piece.color === color) {
                const dist = goalLine.axis === 'y' 
                    ? Math.abs(y - goalLine.value)
                    : Math.abs(x - goalLine.value);
                totalDist += dist;
            }
        }
    }
    return totalDist;
};

/**
 * Record a position and track progress
 */
export const recordPosition = (
    board: (Piece | null)[][],
    currentPlayer: PlayerColor
): number => {
    moveCount++;
    
    const hash = computeHash(board, currentPlayer).toString();
    const count = (positionHistory.get(hash) || 0) + 1;
    positionHistory.set(hash, count);
    
    // Track progress for the player who just moved
    const prevPlayer = getPreviousPlayer(currentPlayer);
    const currentDist = calculateTotalDistance(board, prevPlayer);
    const prevBest = bestProgress.get(prevPlayer) ?? Infinity;
    
    if (currentDist < prevBest) {
        // Progress made!
        bestProgress.set(prevPlayer, currentDist);
        stagnationCount.set(prevPlayer, 0);
    } else {
        // No progress - increment stagnation
        const stag = (stagnationCount.get(prevPlayer) || 0) + 1;
        stagnationCount.set(prevPlayer, stag);
    }
    
    return count;
};

/**
 * Get the previous player (who just moved)
 */
const getPreviousPlayer = (current: PlayerColor): PlayerColor => {
    const order: PlayerColor[] = ['red', 'green', 'blue', 'yellow'];
    const idx = order.indexOf(current);
    return order[(idx + 3) % 4]; // Previous in 4-player order
};

/**
 * Get repetition count for a position
 */
export const getPositionCount = (
    board: (Piece | null)[][],
    currentPlayer: PlayerColor
): number => {
    const hash = computeHash(board, currentPlayer).toString();
    return positionHistory.get(hash) || 0;
};

/**
 * Check if position would cause too many repetitions
 */
export const wouldCauseRepetition = (
    board: (Piece | null)[][],
    currentPlayer: PlayerColor
): boolean => {
    const count = getPositionCount(board, currentPlayer);
    return count >= MAX_REPETITIONS - 1;
};

/**
 * Get stagnation penalty for a player
 * Increases exponentially when player hasn't made progress
 */
export const getStagnationPenalty = (player: PlayerColor): number => {
    const stag = stagnationCount.get(player) || 0;
    if (stag < 3) return 0;
    
    // Exponential penalty after 3 moves without progress
    // At move 100+, this gets very severe
    const moveMultiplier = Math.min(moveCount / 50, 3); // Max 3x at move 150+
    return STAGNATION_PENALTY_BASE * Math.pow(1.5, stag - 3) * moveMultiplier;
};

/**
 * Get repetition penalty for a board position
 * Higher penalty for positions that have been seen more times
 */
export const getRepetitionPenalty = (
    board: (Piece | null)[][],
    currentPlayer: PlayerColor
): number => {
    const count = getPositionCount(board, currentPlayer);
    if (count === 0) return 0;
    
    // Exponential penalty: 2000 for 1st repeat, 4000 for 2nd, 8000 for 3rd, etc.
    // Also increases with move count
    const moveMultiplier = Math.min(1 + moveCount / 100, 2.5); // Max 2.5x at move 150
    return REPETITION_PENALTY_PER_COUNT * Math.pow(2, count - 1) * moveMultiplier;
};

/**
 * Get combined penalty (repetition + stagnation)
 */
export const getCombinedPenalty = (
    board: (Piece | null)[][],
    currentPlayer: PlayerColor
): number => {
    return getRepetitionPenalty(board, currentPlayer) + getStagnationPenalty(currentPlayer);
};

/**
 * Check if game should be declared a draw due to repetition
 */
export const isDrawByRepetition = (
    board: (Piece | null)[][],
    currentPlayer: PlayerColor
): boolean => {
    const count = getPositionCount(board, currentPlayer);
    return count >= MAX_REPETITIONS;
};

/**
 * Get total number of unique positions seen
 */
export const getUniquePositionCount = (): number => {
    return positionHistory.size;
};

/**
 * Get positions that have repeated
 */
export const getRepeatedPositions = (): number => {
    let count = 0;
    for (const c of positionHistory.values()) {
        if (c > 1) count++;
    }
    return count;
};

/**
 * Get current move count
 */
export const getMoveCount = (): number => {
    return moveCount;
};
