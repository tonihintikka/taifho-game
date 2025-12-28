import type { Piece, Position, PlayerColor } from '../types/game';
import { getForwardDirection, getStartLine } from '../types/game';

export const isMoveValid = (
    piece: Piece,
    from: Position,
    to: Position,
    board: (Piece | null)[][]
): boolean => {
    // Basic checks
    if (from.x === to.x && from.y === to.y) return false;
    if (to.x < 0 || to.x >= 10 || to.y < 0 || to.y >= 10) return false;

    const targetCell = board[to.y][to.x];
    if (targetCell) return false; // Only move to empty squares

    const dx = to.x - from.x;
    const dy = to.y - from.y;

    // Starting Line Rule: All pieces can move along their starting line
    // Red/Blue: horizontal on starting row
    // Yellow/Green: vertical on starting column
    const startLine = getStartLine(piece.color);
    const isOnStartLine = startLine.axis === 'y'
        ? from.y === startLine.value
        : from.x === startLine.value;

    if (isOnStartLine) {
        // Moving along the starting line (perpendicular to forward direction)
        const fwd = getForwardDirection(piece.color);
        const isAlongStartLine = (fwd.dy !== 0 && dy === 0 && Math.abs(dx) === 1) ||
            (fwd.dx !== 0 && dx === 0 && Math.abs(dy) === 1);
        if (isAlongStartLine && !targetCell) return true;
    }

    // Piece specific logic
    switch (piece.type) {
        case 'square':
            return validateSquare(dx, dy) || validateJump(from, to, board, 'ortho') || validateLeap(from, to, board, 'ortho');
        case 'diamond':
            return validateDiamond(dx, dy) || validateJump(from, to, board, 'diag') || validateLeap(from, to, board, 'diag');
        case 'circle':
            return validateCircle(dx, dy) || validateJump(from, to, board, 'any') || validateLeap(from, to, board, 'any');
        case 'triangle':
            return validateTriangle(piece.color, dx, dy) || validateTriangleJump(piece.color, from, to, board) || validateTriangleLeap(piece.color, from, to, board);
        default:
            return false;
    }
};

type JumpType = 'ortho' | 'diag' | 'any';

const validateJump = (
    from: Position,
    to: Position,
    board: (Piece | null)[][],
    type: JumpType
): boolean => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Jump must be distance 2 (Chebyshev dist = 2, but specific shapes)

    // Check constraints based on type
    if (type === 'ortho') {
        // Must be straight line of length 2
        if (!((absDx === 2 && absDy === 0) || (absDx === 0 && absDy === 2))) return false;
    } else if (type === 'diag') {
        // Must be diagonal line of length 2
        if (!(absDx === 2 && absDy === 2)) return false;
    } else if (type === 'any') {
        // Either ortho or diag length 2
        if (!((absDx === 2 && absDy === 0) || (absDx === 0 && absDy === 2) || (absDx === 2 && absDy === 2))) return false;
    }

    // Check middle square
    const midX = from.x + dx / 2;
    const midY = from.y + dy / 2;

    // The middle square MUST have a piece (Friend or Foe)
    const midPiece = board[midY]?.[midX];
    return !!midPiece;
};

const validateTriangleJump = (
    color: string,
    from: Position,
    to: Position,
    board: (Piece | null)[][]
): boolean => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const forward = color === 'red' ? 1 : -1;

    // Triangle Jumps:
    // 1. Diagonal Forward Jump (Length 2)
    //    dy should be 2 * forward. dx should be +/- 2.
    if (dy === 2 * forward && Math.abs(dx) === 2) {
        return validateJump(from, to, board, 'diag');
    }

    // 2. Straight Backward Jump (Length 2)
    //    dy should be 2 * -forward. dx should be 0.
    if (dy === 2 * -forward && dx === 0) {
        return validateJump(from, to, board, 'ortho');
    }

    return false;
};

const validateSquare = (dx: number, dy: number): boolean => {
    return (Math.abs(dx) === 1 && dy === 0) || (Math.abs(dy) === 1 && dx === 0);
};

const validateDiamond = (dx: number, dy: number): boolean => {
    return Math.abs(dx) === 1 && Math.abs(dy) === 1;
};

const validateCircle = (dx: number, dy: number): boolean => {
    return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
};

const validateTriangle = (color: string, dx: number, dy: number): boolean => {
    // Triangle: diagonally forward OR straight backward
    // For Red/Blue: forward is +/-y, for Yellow/Green: forward is +/-x
    const fwd = getForwardDirection(color as PlayerColor);

    if (fwd.dy !== 0) {
        // Vertical forward (Red/Blue)
        if (dy === fwd.dy && Math.abs(dx) === 1) return true; // Diag forward
        if (dy === -fwd.dy && dx === 0) return true; // Straight back
    } else {
        // Horizontal forward (Yellow/Green)
        if (dx === fwd.dx && Math.abs(dy) === 1) return true; // Diag forward
        if (dx === -fwd.dx && dy === 0) return true; // Straight back
    }
    return false;
};

/**
 * Leap (Loikka) - Symmetric long jump.
 * Piece jumps over ONE obstacle with equal empty squares before and after.
 * Example: [Piece]-[Empty]-[Empty]-[Obstacle]-[Empty]-[Empty]-[Target]
 */
const validateLeap = (
    from: Position,
    to: Position,
    board: (Piece | null)[][],
    type: JumpType
): boolean => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Must be a straight line (ortho or diag)
    if (type === 'ortho') {
        if (!(absDx === 0 || absDy === 0)) return false;
        if (absDx === 0 && absDy === 0) return false;
    } else if (type === 'diag') {
        if (absDx !== absDy || absDx === 0) return false;
    } else if (type === 'any') {
        if (!((absDx === 0 || absDy === 0) || (absDx === absDy))) return false;
        if (absDx === 0 && absDy === 0) return false;
    }

    // Determine direction unit vector
    const stepX = dx === 0 ? 0 : dx / absDx || 0;
    const stepY = dy === 0 ? 0 : dy / absDy || 0;
    const totalSteps = Math.max(absDx, absDy);

    // For a valid leap, we need: n empty, 1 obstacle, n empty (n >= 1)
    // Total distance = 2n + 1, so minimum distance = 3
    if (totalSteps < 3 || totalSteps % 2 === 0) return false;

    const n = (totalSteps - 1) / 2; // Empty squares before and after
    const obstacleStep = n + 1; // 1-indexed step where obstacle should be

    // Check squares along path
    for (let step = 1; step <= totalSteps; step++) {
        const x = from.x + stepX * step;
        const y = from.y + stepY * step;

        if (x < 0 || x >= 10 || y < 0 || y >= 10) return false;

        const cell = board[y]?.[x];

        if (step === obstacleStep) {
            // Must have obstacle here
            if (!cell) return false;
        } else if (step < totalSteps) {
            // Must be empty
            if (cell) return false;
        }
        // Last step (target) already checked to be empty in isMoveValid
    }

    return true;
};

/**
 * Triangle Leap - follows triangle's direction rules
 */
const validateTriangleLeap = (
    color: string,
    from: Position,
    to: Position,
    board: (Piece | null)[][]
): boolean => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const forward = color === 'red' ? 1 : -1;

    // Triangle can leap: Diagonally Forward OR Straight Backward
    // Diagonally forward: dy and dx have same sign relative to forward, and |dx| == |dy|
    if (dy * forward > 0 && Math.abs(dx) === Math.abs(dy)) {
        return validateLeap(from, to, board, 'diag');
    }
    // Straight backward: dx === 0 and dy is opposite to forward
    if (dx === 0 && dy * forward < 0) {
        return validateLeap(from, to, board, 'ortho');
    }

    return false;
};
