import type { GameConfig } from '../../types/game';
import type { StoreSlice, GameStore } from '../types';
import { createInitialBoard } from '../../utils/boardUtils';
import { copyBoard } from '../helpers';
import { resetAIHistory } from '../../ai/minimax';
import { createInitialSetupState } from '../../types/game';

export interface GameSliceState {
    resetGame: () => void;
    startGame: (config: GameConfig) => void;
    startGameWithSetup: (config: GameConfig) => void;
}

export const createGameSlice: StoreSlice<GameSliceState> = (set, get) => ({
    resetGame: () => set({
        phase: 'config',
        setup: createInitialSetupState(),
        isSetupOpen: true,
        selectedPos: null,
        moveHistory: [],
        pendingDisruption: null,
        winner: null,
        placements: [],
        boardHistory: [],
        historyIndex: -1,
        isViewingHistory: false,
    } as Partial<GameStore>),

    // Quick start with fixed arrangement (legacy behavior)
    startGame: (config: GameConfig) => {
        resetAIHistory();
        const initialBoard = createInitialBoard(config);
        const firstPlayer = config.players[0];
        set({
            phase: 'playing',
            setup: createInitialSetupState(),
            gameConfig: config,
            board: initialBoard,
            currentPlayer: firstPlayer,
            isSetupOpen: false,
            winner: null,
            placements: [],
            selectedPos: null,
            pendingDisruption: null,
            moveHistory: [],
            boardHistory: [{ board: copyBoard(initialBoard), currentPlayer: firstPlayer, move: null }],
            historyIndex: 0,
            isViewingHistory: false,
        } as Partial<GameStore>);
    },

    // Start with setup phase (free arrangement)
    startGameWithSetup: (config: GameConfig) => {
        resetAIHistory();
        set({
            gameConfig: config,
            isSetupOpen: false,
        } as Partial<GameStore>);
        
        // Initialize setup phase
        get().initializeSetupPhase();
        
        // If first player is AI, trigger AI setup after a short delay
        const firstPlayer = config.players[0];
        if (config.playerTypes[firstPlayer] === 'computer') {
            setTimeout(() => get().performAISetup(), 500);
        }
    },
});
