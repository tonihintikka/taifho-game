import { describe, it, expect } from 'vitest';
import { isMoveValid } from '../moveValidation';
import type { Piece } from '../../types/game';

// Helper to create a simplified board (empty)
const createEmptyBoard = () => Array(10).fill(null).map(() => Array(10).fill(null));

describe('Move Validation', () => {
    const board = createEmptyBoard();

    // --- SQUARE ---
    describe('Square (Neliö)', () => {
        const square: Piece = { id: 's1', type: 'square', color: 'red' };

        it('should move 1 step orthogonally', () => {
            // Horizontal
            expect(isMoveValid(square, { x: 5, y: 5 }, { x: 6, y: 5 }, board)).toBe(true);
            expect(isMoveValid(square, { x: 5, y: 5 }, { x: 4, y: 5 }, board)).toBe(true);
            // Vertical
            expect(isMoveValid(square, { x: 5, y: 5 }, { x: 5, y: 6 }, board)).toBe(true);
            expect(isMoveValid(square, { x: 5, y: 5 }, { x: 5, y: 4 }, board)).toBe(true);
        });

        it('should NOT move diagonally', () => {
            expect(isMoveValid(square, { x: 5, y: 5 }, { x: 6, y: 6 }, board)).toBe(false);
        });

        it('should NOT move more than 1 step (without jump)', () => {
            expect(isMoveValid(square, { x: 5, y: 5 }, { x: 7, y: 5 }, board)).toBe(false);
        });
    });

    // --- DIAMOND ---
    describe('Diamond (Salmiakki)', () => {
        const diamond: Piece = { id: 'd1', type: 'diamond', color: 'red' };

        it('should move 1 step diagonally', () => {
            expect(isMoveValid(diamond, { x: 5, y: 5 }, { x: 6, y: 6 }, board)).toBe(true);
            expect(isMoveValid(diamond, { x: 5, y: 5 }, { x: 4, y: 4 }, board)).toBe(true);
        });

        it('should NOT move orthogonally', () => {
            expect(isMoveValid(diamond, { x: 5, y: 5 }, { x: 6, y: 5 }, board)).toBe(false);
        });
    });

    // --- CIRCLE ---
    describe('Circle (Pyöreä)', () => {
        const circle: Piece = { id: 'c1', type: 'circle', color: 'red' };

        it('should move 1 step in any direction', () => {
            expect(isMoveValid(circle, { x: 5, y: 5 }, { x: 6, y: 5 }, board)).toBe(true); // Ortho
            expect(isMoveValid(circle, { x: 5, y: 5 }, { x: 6, y: 6 }, board)).toBe(true); // Diag
        });
    });

    // --- TRIANGLE ---
    describe('Triangle (Kolmio)', () => {
        // Red moves "down" (y increases) as forward
        const redTriangle: Piece = { id: 'rt1', type: 'triangle', color: 'red' };

        it('Red should move Diagonally Forward (Down)', () => {
            expect(isMoveValid(redTriangle, { x: 5, y: 5 }, { x: 6, y: 6 }, board)).toBe(true);
            expect(isMoveValid(redTriangle, { x: 5, y: 5 }, { x: 4, y: 6 }, board)).toBe(true);
        });

        it('Red should move Straight Backward (Up)', () => {
            expect(isMoveValid(redTriangle, { x: 5, y: 5 }, { x: 5, y: 4 }, board)).toBe(true);
        });

        it('Red should NOT move Straight Forward', () => {
            expect(isMoveValid(redTriangle, { x: 5, y: 5 }, { x: 5, y: 6 }, board)).toBe(false);
        });

        it('Red should NOT move Diagonally Backward', () => {
            expect(isMoveValid(redTriangle, { x: 5, y: 5 }, { x: 6, y: 4 }, board)).toBe(false);
        });

        // Blue moves "up" (y decreases) as forward
        const blueTriangle: Piece = { id: 'bt1', type: 'triangle', color: 'blue' };

        it('Blue should move Diagonally Forward (Up)', () => {
            expect(isMoveValid(blueTriangle, { x: 5, y: 5 }, { x: 6, y: 4 }, board)).toBe(true);
        });

        it('Blue should move Straight Backward (Down)', () => {
            expect(isMoveValid(blueTriangle, { x: 5, y: 5 }, { x: 5, y: 6 }, board)).toBe(true);
        });
    });

    // --- STARTING ROW RULE ---
    describe('Starting Row Rule', () => {
        const triangle: Piece = { id: 't1', type: 'triangle', color: 'red' };

        it('should allow horizontal move on starting row (y=0 for Red)', () => {
            // Triangle normally can't move horizontal
            expect(isMoveValid(triangle, { x: 5, y: 0 }, { x: 6, y: 0 }, board)).toBe(true);
            expect(isMoveValid(triangle, { x: 5, y: 0 }, { x: 4, y: 0 }, board)).toBe(true);
        });

        it('should NOT allow horizontal move if NOT on starting row', () => {
            expect(isMoveValid(triangle, { x: 5, y: 1 }, { x: 6, y: 1 }, board)).toBe(false);
        });
    });

    // --- JUMP TESTS ---
    describe('Jumps (Simple)', () => {
        // Setup: Place obstacles
        const redSquare: Piece = { id: 'rs1', type: 'square', color: 'red' };
        const obstacle: Piece = { id: 'obs1', type: 'circle', color: 'blue' };

        it('Square should jump over piece orthogonally', () => {
            const boardWithObstacle = createEmptyBoard();
            boardWithObstacle[6][5] = obstacle; // y=6, x=5
            // Jump from 5,5 to 5,7
            expect(isMoveValid(redSquare, { x: 5, y: 5 }, { x: 5, y: 7 }, boardWithObstacle)).toBe(true);
        });

        it('Square should NOT jump if no piece to jump over', () => {
            const emptyBoard = createEmptyBoard();
            expect(isMoveValid(redSquare, { x: 5, y: 5 }, { x: 5, y: 7 }, emptyBoard)).toBe(false);
        });

        const redDiamond: Piece = { id: 'rd1', type: 'diamond', color: 'red' };
        it('Diamond should jump over piece diagonally', () => {
            const boardWithObstacle = createEmptyBoard();
            boardWithObstacle[6][6] = obstacle; // SE of 5,5
            // Jump from 5,5 to 7,7
            expect(isMoveValid(redDiamond, { x: 5, y: 5 }, { x: 7, y: 7 }, boardWithObstacle)).toBe(true);
        });

        const redTriangle: Piece = { id: 'rt1', type: 'triangle', color: 'red' };
        it('Triangle should jump Diagonally Forward (Down)', () => {
            const boardWithObstacle = createEmptyBoard();
            boardWithObstacle[6][6] = obstacle;
            // Jump from 5,5 to 7,7
            expect(isMoveValid(redTriangle, { x: 5, y: 5 }, { x: 7, y: 7 }, boardWithObstacle)).toBe(true);
        });
    });

    // --- LEAP TESTS (Loikka) ---
    describe('Leaps (Loikka - Symmetric Long Jump)', () => {
        const obstacle: Piece = { id: 'obs1', type: 'circle', color: 'blue' };

        it('Square should leap: [P]-[E]-[O]-[E]-[T] (distance 3)', () => {
            const boardWithObstacle = createEmptyBoard();
            const redSquare: Piece = { id: 'rs1', type: 'square', color: 'red' };
            // Place obstacle at middle position (y=7)
            boardWithObstacle[7][5] = obstacle;
            // Leap from 5,5 to 5,9 (distance 4 in y)
            // Actually: 5,5 -> 5,6 (empty) -> 5,7 (obstacle) -> 5,8 (empty) -> 5,9 (target) = distance 4
            // With n=1: 1 empty, 1 obstacle, 1 empty = total 3 steps
            // So from 5,5 to 5,8: 
            boardWithObstacle[7][5] = null;
            boardWithObstacle[6][5] = obstacle; // Middle at y=6
            expect(isMoveValid(redSquare, { x: 5, y: 5 }, { x: 5, y: 8 }, boardWithObstacle)).toBe(false); // Even distance, not valid

            // Valid leap: from 5,4 to 5,8 (distance 4): Wrong, must be odd
            // from 5,5 to 5,8 (dy=3): y=6 empty, y=7 obstacle, y=8 target. Wait, n=1, obstacle at step 2
            const board2 = createEmptyBoard();
            board2[6][5] = obstacle; // step 1: y=6 (should be empty if n=1)
            // n=1: step 1 empty, step 2 obstacle, step 3 target
            // dy=3: from y=5, target y=8
            // step1: y=6, step2: y=7, step3: y=8
            board2[6][5] = null;
            board2[7][5] = obstacle; // obstacle at step 2 (y=7)
            expect(isMoveValid(redSquare, { x: 5, y: 5 }, { x: 5, y: 8 }, board2)).toBe(true);
        });

        it('Square should NOT leap if obstacle not in middle', () => {
            const boardWithObstacle = createEmptyBoard();
            const redSquare: Piece = { id: 'rs1', type: 'square', color: 'red' };
            // Obstacle at wrong position
            boardWithObstacle[6][5] = obstacle; // step 1 instead of step 2
            expect(isMoveValid(redSquare, { x: 5, y: 5 }, { x: 5, y: 8 }, boardWithObstacle)).toBe(false);
        });

        it('Diamond should leap diagonally', () => {
            const boardWithObstacle = createEmptyBoard();
            const redDiamond: Piece = { id: 'rd1', type: 'diamond', color: 'red' };
            // Leap from 2,2 to 6,6 (distance 4 each, but must be odd: try 3,3 to 6,6 = distance 3)
            // from 3,3 to 6,6: step1: 4,4 (empty), step2: 5,5 (obstacle), step3: 6,6 (target)
            boardWithObstacle[5][5] = obstacle;
            expect(isMoveValid(redDiamond, { x: 3, y: 3 }, { x: 6, y: 6 }, boardWithObstacle)).toBe(true);
        });

        it('Circle should leap in any direction', () => {
            const boardWithObstacle = createEmptyBoard();
            const redCircle: Piece = { id: 'rc1', type: 'circle', color: 'red' };
            // Ortho leap from 5,4 to 5,7 (dy=3): step1=y:5(empty), step2=y:6(obstacle), step3=y:7(target)
            boardWithObstacle[6][5] = obstacle; // y=6, x=5 (middle)
            expect(isMoveValid(redCircle, { x: 5, y: 4 }, { x: 5, y: 7 }, boardWithObstacle)).toBe(true);
        });
    });
});
