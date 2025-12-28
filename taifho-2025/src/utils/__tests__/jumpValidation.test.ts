import { describe, it, expect } from 'vitest';
import { getValidJumps } from '../jumpValidation';
import type { Piece } from '../../types/game';

// Helper
const createEmptyBoard = () => Array(10).fill(null).map(() => Array(10).fill(null));

describe('getValidJumps', () => {
    it('should return all valid jumps for a Square surrounded by enemies', () => {
        const board = createEmptyBoard();
        const redSquare: Piece = { id: 'rs1', type: 'square', color: 'red' };

        // Place at 5,5
        // Obstacles at 5,4 (Up), 5,6 (Down), 4,5 (Left), 6,5 (Right)
        const obs: Piece = { id: 'obs', type: 'circle', color: 'blue' };

        board[4][5] = obs;
        board[6][5] = obs;
        board[5][4] = obs;
        board[5][6] = obs;

        // Expected landings: 5,3; 5,7; 3,5; 7,5
        const jumps = getValidJumps(redSquare, { x: 5, y: 5 }, board);

        expect(jumps).toHaveLength(4);
        expect(jumps).toContainEqual({ x: 5, y: 3 });
        expect(jumps).toContainEqual({ x: 5, y: 7 });
        expect(jumps).toContainEqual({ x: 3, y: 5 });
        expect(jumps).toContainEqual({ x: 7, y: 5 });
    });

    it('should return NO jumps if no obstacles', () => {
        const board = createEmptyBoard();
        const redSquare: Piece = { id: 'rs1', type: 'square', color: 'red' };

        const jumps = getValidJumps(redSquare, { x: 5, y: 5 }, board);
        expect(jumps).toHaveLength(0);
    });
});
