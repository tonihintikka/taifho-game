import { describe, it, expect } from 'vitest';
import { getAllLegalMoves } from '../moveGenerator';
import { evaluateBoard } from '../evaluator';
import { getBestMove } from '../minimax';
import { createInitialBoard } from '../../utils/boardUtils';
import { DEFAULT_2P_CONFIG } from '../../types/game';

describe('AI Move Generator', () => {
    it('should find moves for Red at start', () => {
        const board = createInitialBoard(DEFAULT_2P_CONFIG);
        // Red starts at row 0.
        // There are 8 pieces. Each can move sideways (start row rule). 2 squares at ends can move forward?
        // Let's just check length > 0 for sanity.
        const moves = getAllLegalMoves(board, 'red');
        expect(moves.length).toBeGreaterThan(0);
    });
});

describe('AI Evaluator', () => {
    it('should evaluate even board as 0', () => {
        const board = createInitialBoard(DEFAULT_2P_CONFIG);
        const score = evaluateBoard(board, 'red');
        // Both sides symmetric
        expect(score).toBe(0);
    });

    it('should favor advancing pieces', () => {
        const board = createInitialBoard(DEFAULT_2P_CONFIG);
        // Move a Red piece forward manually
        const p = board[0][1];
        if (p) {
            board[1][1] = p;
            board[0][1] = null;
        }

        const score = evaluateBoard(board, 'red');
        expect(score).toBeGreaterThan(0);
    });
});

describe('AI Minimax', () => {
    it('should return a valid move object', () => {
        const board = createInitialBoard(DEFAULT_2P_CONFIG);
        // Depth 1 for speed in unit test
        const bestMove = getBestMove(board, 'red');

        expect(bestMove).toBeDefined();
        if (bestMove) {
            expect(bestMove.from).toBeDefined();
            expect(bestMove.to).toBeDefined();
            expect(bestMove.piece.color).toBe('red');
        }
    });
});
