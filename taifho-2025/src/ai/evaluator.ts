import type { Piece, PlayerColor } from '../types/game';
import { getGoalLine } from '../types/game';
import { BOARD_SIZE } from '../utils/boardUtils';
import { checkWinner } from '../utils/winCondition';
import { getMoveCount } from './positionHistory';

const SCORE_WIN = 999999;
const SCORE_LOSS = -999999;

const isAtGoal = (color: PlayerColor, x: number, y: number): boolean => {
    const goalLine = getGoalLine(color);
    return goalLine.axis === 'y' ? y === goalLine.value : x === goalLine.value;
};

const distToGoal = (color: PlayerColor, x: number, y: number): number => {
    const goalLine = getGoalLine(color);
    return goalLine.axis === 'y' ? Math.abs(y - goalLine.value) : Math.abs(x - goalLine.value);
};

/**
 * Evaluates the board state for the given player.
 * Positive score = advantage for `color`.
 * Negative score = advantage for opponents.
 */
export const evaluateBoard = (board: (Piece | null)[][], color: PlayerColor): number => {
    // Terminal check (highest priority)
    const winner = checkWinner(board);
    if (winner === color) return SCORE_WIN;
    if (winner !== null) return SCORE_LOSS;

    let score = 0;

    // Heuristic Weights - escalate progress importance as game goes on
    const moveNum = getMoveCount();
    const progressMultiplier = Math.min(1 + moveNum / 100, 3); // Up to 3x at move 200
    
    const W_MATERIAL = 100;
    const W_PROGRESS = 50 * progressMultiplier;  // Progress becomes MORE important over time
    const W_GOAL = 2000 * progressMultiplier;    // Goal bonus also increases
    const W_ALMOST_WIN = 10000;  // Bonus when one piece away from winning
    const W_FALLING_BEHIND = 500; // Penalty for being behind the leader

    let myTotal = 0;
    let myAtGoal = 0;
    let oppTotal = 0;
    let oppAtGoal = 0;

    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            const piece = board[y][x];
            if (!piece) continue;

            const d = distToGoal(piece.color, x, y);
            const progressScore = (BOARD_SIZE - 1 - d) * W_PROGRESS;
            const atGoal = isAtGoal(piece.color, x, y);

            if (piece.color === color) {
                myTotal++;

                // 1) Material
                score += W_MATERIAL;

                // 2) Progress toward goal
                score += progressScore;

                // 3) Reached Goal Bonus
                if (atGoal) {
                    score += W_GOAL;
                    myAtGoal++;
                }
            } else {
                oppTotal++;

                // Opponents: subtract their advantages
                score -= W_MATERIAL;
                score -= progressScore;

                if (atGoal) {
                    score -= W_GOAL;
                    oppAtGoal++;
                }
            }
        }
    }

    // Bonus for being close to winning (one piece away from all pieces at goal)
    // Works for both 2P (8 pieces) and 4P (6 pieces)
    if (myTotal > 0 && myAtGoal >= myTotal - 1) {
        score += W_ALMOST_WIN;
    }
    if (oppTotal > 0 && oppAtGoal >= oppTotal - 1) {
        score -= W_ALMOST_WIN;
    }
    
    // Penalty for falling behind (urgency to catch up)
    // After move 50, penalize being behind opponents
    if (moveNum > 50) {
        const maxOppAtGoal = Math.max(oppAtGoal, 1);
        if (myAtGoal < maxOppAtGoal) {
            const behindBy = maxOppAtGoal - myAtGoal;
            score -= W_FALLING_BEHIND * behindBy * progressMultiplier;
        }
    }

    return score;
};
