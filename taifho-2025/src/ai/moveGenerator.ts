import type { Piece, Position, Move, PlayerColor } from '../types/game';
import { isMoveValid } from '../utils/moveValidation';
import { BOARD_SIZE } from '../utils/boardUtils';

/**
 * Generates all possible legal moves for a given player/color.
 */
export const getAllLegalMoves = (board: (Piece | null)[][], color: PlayerColor): Move[] => {
    const moves: Move[] = [];

    // 1. Find all pieces of the current player
    const myPieces: { piece: Piece; pos: Position }[] = [];
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            const piece = board[y][x];
            if (piece && piece.color === color) {
                myPieces.push({ piece, pos: { x, y } });
            }
        }
    }

    // 2. For each piece, check all possible target cells
    // Optimization: Instead of checking checks 100 cells, check reasonable range based on piece type
    // But for simplicity/safety with current validation logic, we can iterate relevant areas or just brute force 
    // the movement rules are complex (jumps, leaps), so letting validation logic handle it is safer.

    // Optimization: Only empty cells.
    const emptyCells: Position[] = [];
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            if (!board[y][x]) {
                emptyCells.push({ x, y });
            }
        }
    }

    for (const { piece, pos } of myPieces) {
        for (const target of emptyCells) {
            if (isMoveValid(piece, pos, target, board)) {
                // If it's a valid move, push it
                moves.push({
                    from: pos,
                    to: target,
                    piece
                });
            }
        }
    }

    return moves;
};
