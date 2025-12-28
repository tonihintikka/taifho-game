import type { GameState, Position, Piece, PlayerColor, Move, GamePhase } from '../types/game';

export interface PendingDisruption {
    jumpedCircle: Piece;
    jumpedFrom: Position;
    targetRow: number;
}

export interface HistoryEntry {
    board: (Piece | null)[][];
    currentPlayer: PlayerColor;
    move: Move | null;
}

export interface GameStore extends GameState {
    // State
    pendingDisruption: PendingDisruption | null;
    isSetupOpen: boolean;
    boardHistory: HistoryEntry[];
    historyIndex: number;
    isViewingHistory: boolean;

    // Actions - Selection & Movement
    selectPiece: (pos: Position) => void;
    movePiece: (from: Position, to: Position) => void;
    finishTurn: () => void;

    // Actions - Disruption
    executeDisruption: (targetX: number) => void;
    skipDisruption: () => void;

    // Actions - Game Control
    resetGame: () => void;
    startGame: (config: import('../types/game').GameConfig) => void;
    startGameWithSetup: (config: import('../types/game').GameConfig) => void;
    setPhase: (phase: GamePhase) => void;

    // Actions - AI
    performAiMove: () => Promise<void>;

    // Actions - History
    undoMove: () => void;
    redoMove: () => void;
    getMoveLog: () => string;

    // Actions - Setup Phase
    selectSetupPiece: (piece: Piece | null) => void;
    placeSetupPiece: (column: number) => void;
    removeSetupPiece: (column: number) => void;
    clearSetup: () => void;
    randomizeSetup: () => void;
    confirmSetup: () => void;
    performAISetup: () => Promise<void>;
    initializeSetupPhase: () => void;
}

// Zustand slice creator type
export type StoreSlice<T> = (
    set: (partial: Partial<GameStore> | ((state: GameStore) => Partial<GameStore>)) => void,
    get: () => GameStore
) => T;
