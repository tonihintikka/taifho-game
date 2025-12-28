import type { Piece, PlayerColor, GameConfig } from '../types/game';
import { DEFAULT_2P_CONFIG } from '../types/game';

export const BOARD_SIZE = 10;

const createPiece = (type: Piece['type'], color: PlayerColor, idSuffix: string): Piece => ({
    id: `${color}-${type}-${idSuffix}`,
    type,
    color,
});

/**
 * Create initial board for 2-player game (top/bottom)
 */
export const createInitialBoard = (config: GameConfig = DEFAULT_2P_CONFIG): (Piece | null)[][] => {
    const board: (Piece | null)[][] = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));

    if (config.playerCount === 4) {
        return createInitialBoard4P(board);
    }

    // 2-player setup: 8 pieces each on rows 0 and 9
    const placePiecesRow = (row: number, color: PlayerColor) => {
        // S T D C C D T S (Symmetric, 8 pieces)
        board[row][1] = createPiece('square', color, '1');
        board[row][2] = createPiece('triangle', color, '1');
        board[row][3] = createPiece('diamond', color, '1');
        board[row][4] = createPiece('circle', color, '1');
        board[row][5] = createPiece('circle', color, '2');
        board[row][6] = createPiece('diamond', color, '2');
        board[row][7] = createPiece('triangle', color, '2');
        board[row][8] = createPiece('square', color, '2');
    };

    placePiecesRow(0, 'red');
    placePiecesRow(BOARD_SIZE - 1, 'blue');

    return board;
};

/**
 * Create initial board for 4-player game
 * Red (top), Blue (bottom), Yellow (left), Green (right)
 * Each player has 8 pieces: 2 squares, 2 triangles, 2 diamonds, 2 circles
 * Pieces are placed on columns/rows 1-8 (corners empty)
 */
const createInitialBoard4P = (board: (Piece | null)[][]): (Piece | null)[][] => {
    // Piece setup for 8 pieces: S T D C C D T S (symmetric)
    const pieceTypes: Piece['type'][] = ['square', 'triangle', 'diamond', 'circle', 'circle', 'diamond', 'triangle', 'square'];

    // Red (top row, cols 1-8)
    for (let i = 0; i < 8; i++) {
        board[0][1 + i] = createPiece(pieceTypes[i], 'red', String(i + 1));
    }

    // Blue (bottom row, cols 1-8)
    for (let i = 0; i < 8; i++) {
        board[9][1 + i] = createPiece(pieceTypes[i], 'blue', String(i + 1));
    }

    // Yellow (left column, rows 1-8)
    for (let i = 0; i < 8; i++) {
        board[1 + i][0] = createPiece(pieceTypes[i], 'yellow', String(i + 1));
    }

    // Green (right column, rows 1-8)
    for (let i = 0; i < 8; i++) {
        board[1 + i][9] = createPiece(pieceTypes[i], 'green', String(i + 1));
    }

    return board;
};
