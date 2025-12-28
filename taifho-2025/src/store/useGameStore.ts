import { create } from 'zustand';
import { DEFAULT_2P_CONFIG, createInitialSetupState } from '../types/game';
import { createInitialBoard } from '../utils/boardUtils';
import type { GameStore } from './types';
import { 
    createMoveSlice, 
    createHistorySlice, 
    createAiSlice, 
    createGameSlice,
    createSetupSlice 
} from './slices';

/**
 * Main Game Store
 * Combines all slices into a unified store.
 */
export const useGameStore = create<GameStore>((set, get) => ({
    // ========== Initial State ==========
    phase: 'config',
    setup: createInitialSetupState(),
    board: createInitialBoard(),
    currentPlayer: 'red',
    winner: null,
    selectedPos: null,
    validMoves: [],
    moveHistory: [],
    pendingDisruption: null,
    gameConfig: DEFAULT_2P_CONFIG,
    placements: [],
    isSetupOpen: true,
    boardHistory: [],
    historyIndex: -1,
    isViewingHistory: false,

    // ========== Slices ==========
    ...createMoveSlice(set, get),
    ...createHistorySlice(set, get),
    ...createAiSlice(set, get),
    ...createGameSlice(set, get),
    ...createSetupSlice(set, get),
}));
