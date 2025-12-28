import type { Piece, Position } from '../types/game';
import { isMoveValid } from './moveValidation';

// Re-use logic from moveValidation to find strict jumps.
// This function returns all valid *landing positions* for a jump starting at `from`.
export const getValidJumps = (
    piece: Piece,
    from: Position,
    board: (Piece | null)[][]
): Position[] => {
    const jumps: Position[] = [];

    // Potentially check all distance-2 squares around 'from'
    // [-2, -2] to [2, 2]

    // Actually, it's easier to iterate based on piece rules.
    // Square: 4 directions (ortho), dist 2.
    // Diamond: 4 directions (diag), dist 2.
    // Circle: 8 directions, dist 2.
    // Triangle: Limited directions.

    // Generic check: Iterate -2 to +2 for x and y
    const possibleOffsets = [
        { x: 0, y: -2 }, { x: 0, y: 2 }, { x: -2, y: 0 }, { x: 2, y: 0 }, // Ortho
        { x: -2, y: -2 }, { x: 2, y: -2 }, { x: -2, y: 2 }, { x: 2, y: 2 } // Diag
    ];

    for (const off of possibleOffsets) {
        const to = { x: from.x + off.x, y: from.y + off.y };

        // Basic bounds/empty check inside isMoveValid?? 
        // No, isMoveValid checks EVERYTHING including "is this a step OR a jump".
        // We want strict jumps only.

        // Let's rely on isMoveValid for "validity" BUT we need to distinguish Jump vs Step.
        // Step is dist 1. Jump is dist 2.

        // Checking bounds manually first to save calls
        if (to.x < 0 || to.x >= 10 || to.y < 0 || to.y >= 10) continue;

        // Check if isMoveValid says yes
        if (isMoveValid(piece, from, to, board)) {
            // It is valid. Is it a jump?
            const dx = Math.abs(to.x - from.x);
            const dy = Math.abs(to.y - from.y);
            // If dist is >= 2 in any dir, it's a jump (since max step is 1)
            if (dx >= 2 || dy >= 2) {
                jumps.push(to);
            }
        }
    }

    return jumps;
};
