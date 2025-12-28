import type { Position, Move, PlayerColor, Piece } from '../../types/game';
import type { StoreSlice, PendingDisruption, GameStore } from '../types';
import { getStartLine } from '../../types/game';
import { isMoveValid } from '../../utils/moveValidation';
import { getValidJumps } from '../../utils/jumpValidation';
import { checkWinner, isGameOver } from '../../utils/winCondition';
import { getNextPlayer, copyBoard } from '../helpers';
import { BOARD_SIZE } from '../../utils/boardUtils';
import { recordPosition } from '../../ai/positionHistory';

/**
 * Calculate all valid moves for a piece at a given position
 */
const getValidMoves = (
    piece: Piece,
    from: Position,
    board: (Piece | null)[][]
): Position[] => {
    const validMoves: Position[] = [];
    
    // Check all board positions
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            const to = { x, y };
            if (isMoveValid(piece, from, to, board)) {
                validMoves.push(to);
            }
        }
    }
    
    return validMoves;
};

export interface MoveSliceState {
    selectPiece: (pos: Position) => void;
    movePiece: (from: Position, to: Position) => void;
    finishTurn: () => void;
    executeDisruption: (targetX: number) => void;
    skipDisruption: () => void;
}

export const createMoveSlice: StoreSlice<MoveSliceState> = (set, _get) => ({
    selectPiece: (pos: Position) => set((state: GameStore) => {
        if (state.pendingDisruption || state.isSetupOpen || state.isViewingHistory) return {};
        if (state.phase !== 'playing') return {};

        const piece = state.board[pos.y][pos.x];
        if (piece && piece.color === state.currentPlayer) {
            // Calculate valid moves for the selected piece
            const validMoves = getValidMoves(piece, pos, state.board);
            return { selectedPos: pos, validMoves };
        }
        return { selectedPos: null, validMoves: [] };
    }),

    movePiece: (from: Position, to: Position) => set((state: GameStore) => {
        if (state.pendingDisruption || state.isViewingHistory) return {};

        const newBoard = state.board.map(row => [...row]);
        const piece = newBoard[from.y][from.x];

        if (!piece) return {};

        if (piece.color !== state.currentPlayer) {
            console.log("Not your turn");
            return {};
        }

        if (!isMoveValid(piece, from, to, state.board)) {
            console.log("Invalid Move");
            return {};
        }

        const dx = Math.abs(to.x - from.x);
        const dy = Math.abs(to.y - from.y);
        const isJump = dx >= 2 || dy >= 2;

        let pendingDisruption: PendingDisruption | null = null;
        if (isJump && piece.type === 'circle') {
            const midX = from.x + (to.x - from.x) / 2;
            const midY = from.y + (to.y - from.y) / 2;

            if (dx === 2 || dy === 2) {
                const jumpedPiece = state.board[midY]?.[midX];
                if (jumpedPiece &&
                    jumpedPiece.type === 'circle' &&
                    jumpedPiece.color !== piece.color) {
                    const opponentStart = getStartLine(jumpedPiece.color);
                    const opponentStartRow = opponentStart.axis === 'y' ? opponentStart.value : -1;
                    const goalRow = opponentStart.axis === 'y' ? (opponentStart.value === 0 ? 9 : 0) : -1;

                    if (midY !== opponentStartRow && midY !== goalRow) {
                        pendingDisruption = {
                            jumpedCircle: jumpedPiece,
                            jumpedFrom: { x: midX, y: midY },
                            targetRow: opponentStartRow
                        };
                    }
                }
            }
        }

        newBoard[to.y][to.x] = piece;
        newBoard[from.y][from.x] = null;

        const move: Move = { from, to, piece };

        if (isJump) {
            const furtherJumps = getValidJumps(piece, to, newBoard);

            if (furtherJumps.length > 0) {
                // Calculate valid moves for chain jump
                const chainMoves = getValidMoves(piece, to, newBoard);
                return {
                    board: newBoard,
                    selectedPos: to,
                    validMoves: chainMoves,
                    pendingDisruption,
                };
            }
        }

        if (pendingDisruption) {
            return {
                board: newBoard,
                selectedPos: null,
                validMoves: [],
                pendingDisruption,
            };
        }

        // Check for newly finished player
        const currentPlacements = state.placements || [];
        const finishedPlayer = checkWinner(newBoard, currentPlacements);
        
        let newPlacements = currentPlacements;
        let winner: PlayerColor | null = null;
        
        if (finishedPlayer) {
            newPlacements = [...currentPlacements, finishedPlayer];
            
            // In 4P, game ends when 3 players finish. In 2P, when 1 finishes.
            if (isGameOver(newPlacements, state.gameConfig.playerCount)) {
                winner = finishedPlayer; // Last to finish in top 3 (or winner in 2P)
            }
        }
        
        const nextPlayer = getNextPlayer(state.currentPlayer, state.gameConfig, newPlacements);

        // Record position for repetition detection
        recordPosition(newBoard, nextPlayer);

        const newHistory = [
            ...state.boardHistory.slice(0, state.historyIndex + 1),
            { board: copyBoard(newBoard), currentPlayer: nextPlayer, move }
        ];

        return {
            board: newBoard,
            currentPlayer: nextPlayer,
            selectedPos: null,
            validMoves: [],
            pendingDisruption: null,
            boardHistory: newHistory,
            historyIndex: newHistory.length - 1,
            moveHistory: [...(state.moveHistory ?? []), move],
            placements: newPlacements,
            winner,
        };
    }),

    finishTurn: () => set((state: GameStore) => {
        const placements = state.placements || [];
        
        if (state.pendingDisruption) {
            const nextPlayer = getNextPlayer(state.currentPlayer, state.gameConfig, placements);
            return {
                currentPlayer: nextPlayer,
                selectedPos: null,
                validMoves: [],
                pendingDisruption: null
            };
        }

        const nextPlayer = getNextPlayer(state.currentPlayer, state.gameConfig, placements);
        return { currentPlayer: nextPlayer, selectedPos: null, validMoves: [] };
    }),

    executeDisruption: (targetX: number) => set((state: GameStore) => {
        if (!state.pendingDisruption) return {};

        const { jumpedCircle, jumpedFrom, targetRow } = state.pendingDisruption;
        const newBoard = state.board.map(row => [...row]);

        if (newBoard[targetRow][targetX] !== null) {
            console.log("Position not empty");
            return {};
        }

        newBoard[jumpedFrom.y][jumpedFrom.x] = null;
        newBoard[targetRow][targetX] = jumpedCircle;

        // Check for newly finished player
        const currentPlacements = state.placements || [];
        const finishedPlayer = checkWinner(newBoard, currentPlacements);
        
        let newPlacements = currentPlacements;
        let winner: PlayerColor | null = null;
        
        if (finishedPlayer) {
            newPlacements = [...currentPlacements, finishedPlayer];
            
            if (isGameOver(newPlacements, state.gameConfig.playerCount)) {
                winner = finishedPlayer;
            }
        }

        const nextPlayer = getNextPlayer(state.currentPlayer, state.gameConfig, newPlacements);

        // Record position for repetition detection
        recordPosition(newBoard, nextPlayer);

        const newHistory = [
            ...state.boardHistory.slice(0, state.historyIndex + 1),
            { board: copyBoard(newBoard), currentPlayer: nextPlayer, move: null }
        ];

        return {
            board: newBoard,
            currentPlayer: nextPlayer,
            selectedPos: null,
            pendingDisruption: null,
            boardHistory: newHistory,
            historyIndex: newHistory.length - 1,
            placements: newPlacements,
            winner,
        };
    }),

    skipDisruption: () => set((state: GameStore) => {
        if (!state.pendingDisruption) return {};

        const nextPlayer = getNextPlayer(state.currentPlayer, state.gameConfig);

        return {
            currentPlayer: nextPlayer,
            selectedPos: null,
            pendingDisruption: null,
        };
    }),
});
