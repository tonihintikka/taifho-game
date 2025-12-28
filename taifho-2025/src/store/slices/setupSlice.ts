import type { StoreSlice } from '../types';
import type { Piece, PlayerColor, GamePhase } from '../../types/game';
import { 
    createUnplacedPieces, 
    getStartingRow, 
    getStartingColumn 
} from '../../types/game';
import { BOARD_SIZE } from '../../utils/boardUtils';
import { generateAISetup, getSetupTypes } from '../../ai/setupStrategy';

// Valid placement columns (1-8, corners 0 and 9 are forbidden)
const VALID_PLACEMENT_COLUMNS = [1, 2, 3, 4, 5, 6, 7, 8];

export interface SetupSliceState {
    // Actions
    selectSetupPiece: (piece: Piece | null) => void;
    placeSetupPiece: (column: number) => void;
    removeSetupPiece: (column: number) => void;
    clearSetup: () => void;
    randomizeSetup: () => void;
    confirmSetup: () => void;
    performAISetup: () => Promise<void>;
    initializeSetupPhase: () => void;
    setPhase: (phase: GamePhase) => void;
}

/**
 * Shuffle array (Fisher-Yates)
 */
const shuffleArray = <T>(array: T[]): T[] => {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
};

/**
 * Get empty placement slots for a player
 */
const getEmptySlots = (
    board: (Piece | null)[][],
    color: PlayerColor,
    is4Player: boolean
): number[] => {
    const emptySlots: number[] = [];
    
    if (color === 'yellow' || color === 'green') {
        // 4-player side players: columns are rows 2-7
        const col = getStartingColumn(color);
        for (let row = 2; row <= 7; row++) {
            if (board[row][col] === null) {
                emptySlots.push(row);
            }
        }
    } else {
        // Red/Blue: rows are columns 1-8
        const row = getStartingRow(color);
        const range = is4Player ? [2, 3, 4, 5, 6, 7] : VALID_PLACEMENT_COLUMNS;
        for (const col of range) {
            if (board[row][col] === null) {
                emptySlots.push(col);
            }
        }
    }
    
    return emptySlots;
};

/**
 * Get next player in setup order
 */
const getNextSetupPlayer = (
    current: PlayerColor,
    players: PlayerColor[],
    confirmed: PlayerColor[]
): PlayerColor | null => {
    const remaining = players.filter(p => !confirmed.includes(p) && p !== current);
    return remaining.length > 0 ? remaining[0] : null;
};

/**
 * Delay helper for animations
 */
const delay = (ms: number): Promise<void> => 
    new Promise(resolve => setTimeout(resolve, ms));

export const createSetupSlice: StoreSlice<SetupSliceState> = (set, get) => ({
    setPhase: (phase: GamePhase) => {
        set({ phase });
    },

    initializeSetupPhase: () => {
        const state = get();
        const { gameConfig } = state;
        const is4Player = gameConfig.playerCount === 4;
        
        // Create empty board
        const emptyBoard: (Piece | null)[][] = Array(BOARD_SIZE)
            .fill(null)
            .map(() => Array(BOARD_SIZE).fill(null));
        
        // Create unplaced pieces for each player
        const unplacedPieces: Record<PlayerColor, Piece[]> = {
            red: [],
            blue: [],
            yellow: [],
            green: [],
        };
        
        for (const player of gameConfig.players) {
            unplacedPieces[player] = createUnplacedPieces(player, is4Player);
        }
        
        // First player to setup
        const firstSetupPlayer = gameConfig.players[0];
        
        set({
            phase: 'setup',
            board: emptyBoard,
            setup: {
                unplacedPieces,
                selectedSetupPiece: null,
                setupPlayer: firstSetupPlayer,
                confirmedPlayers: [],
                setupMode: 'sequential',
            },
        });
    },

    selectSetupPiece: (piece: Piece | null) => {
        set(state => ({
            setup: {
                ...state.setup,
                selectedSetupPiece: piece,
            },
        }));
    },

    placeSetupPiece: (column: number) => {
        const state = get();
        const { setup, board, gameConfig } = state;
        const { selectedSetupPiece, setupPlayer, unplacedPieces } = setup;
        
        if (!selectedSetupPiece || !setupPlayer) return;
        
        const is4Player = gameConfig.playerCount === 4;
        
        // Validate column based on player type
        let row: number;
        let col: number;
        
        if (setupPlayer === 'yellow' || setupPlayer === 'green') {
            // 4-player side players: column param is actually row index
            row = column;
            col = getStartingColumn(setupPlayer);
            if (row < 2 || row > 7) return; // Invalid row
        } else {
            // Red/Blue: standard placement
            row = getStartingRow(setupPlayer);
            col = column;
            const validCols = is4Player ? [2, 3, 4, 5, 6, 7] : VALID_PLACEMENT_COLUMNS;
            if (!validCols.includes(col)) return; // Invalid column
        }
        
        // Check if slot is empty
        if (board[row][col] !== null) return;
        
        // Place piece on board
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = selectedSetupPiece;
        
        // Remove from unplaced
        const newUnplaced = { ...unplacedPieces };
        newUnplaced[setupPlayer] = newUnplaced[setupPlayer].filter(
            p => p.id !== selectedSetupPiece.id
        );
        
        set({
            board: newBoard,
            setup: {
                ...setup,
                unplacedPieces: newUnplaced,
                selectedSetupPiece: null,
            },
        });
    },

    removeSetupPiece: (column: number) => {
        const state = get();
        const { setup, board } = state;
        const { setupPlayer, unplacedPieces } = setup;
        
        if (!setupPlayer) return;
        
        let row: number;
        let col: number;
        
        if (setupPlayer === 'yellow' || setupPlayer === 'green') {
            row = column;
            col = getStartingColumn(setupPlayer);
        } else {
            row = getStartingRow(setupPlayer);
            col = column;
        }
        
        const piece = board[row][col];
        if (!piece || piece.color !== setupPlayer) return;
        
        // Remove from board
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = null;
        
        // Add back to unplaced
        const newUnplaced = { ...unplacedPieces };
        newUnplaced[setupPlayer] = [...newUnplaced[setupPlayer], piece];
        
        set({
            board: newBoard,
            setup: {
                ...setup,
                unplacedPieces: newUnplaced,
            },
        });
    },

    clearSetup: () => {
        const state = get();
        const { setup, board, gameConfig } = state;
        const { setupPlayer } = setup;
        
        if (!setupPlayer) return;
        
        const is4Player = gameConfig.playerCount === 4;
        const newBoard = board.map(r => [...r]);
        const returnedPieces: Piece[] = [];
        
        // Find and remove all pieces of current player from starting row
        if (setupPlayer === 'yellow' || setupPlayer === 'green') {
            const col = getStartingColumn(setupPlayer);
            for (let row = 2; row <= 7; row++) {
                const piece = newBoard[row][col];
                if (piece && piece.color === setupPlayer) {
                    returnedPieces.push(piece);
                    newBoard[row][col] = null;
                }
            }
        } else {
            const row = getStartingRow(setupPlayer);
            const range = is4Player ? [2, 3, 4, 5, 6, 7] : VALID_PLACEMENT_COLUMNS;
            for (const col of range) {
                const piece = newBoard[row][col];
                if (piece && piece.color === setupPlayer) {
                    returnedPieces.push(piece);
                    newBoard[row][col] = null;
                }
            }
        }
        
        // Restore unplaced pieces
        const newUnplaced = { ...setup.unplacedPieces };
        newUnplaced[setupPlayer] = createUnplacedPieces(setupPlayer, is4Player);
        
        set({
            board: newBoard,
            setup: {
                ...setup,
                unplacedPieces: newUnplaced,
                selectedSetupPiece: null,
            },
        });
    },

    randomizeSetup: () => {
        const state = get();
        const { setup, gameConfig } = state;
        const { setupPlayer } = setup;
        
        if (!setupPlayer) return;
        
        // Clear first
        get().clearSetup();
        
        // Get fresh state after clear
        const freshState = get();
        const is4Player = gameConfig.playerCount === 4;
        
        // Get pieces and shuffle
        const pieces = shuffleArray([...freshState.setup.unplacedPieces[setupPlayer]]);
        const emptySlots = getEmptySlots(freshState.board, setupPlayer, is4Player);
        
        // Place pieces in random order
        const newBoard = freshState.board.map(r => [...r]);
        const newUnplaced = { ...freshState.setup.unplacedPieces };
        newUnplaced[setupPlayer] = [];
        
        pieces.forEach((piece, index) => {
            if (index < emptySlots.length) {
                const slot = emptySlots[index];
                if (setupPlayer === 'yellow' || setupPlayer === 'green') {
                    const col = getStartingColumn(setupPlayer);
                    newBoard[slot][col] = piece;
                } else {
                    const row = getStartingRow(setupPlayer);
                    newBoard[row][slot] = piece;
                }
            }
        });
        
        set({
            board: newBoard,
            setup: {
                ...freshState.setup,
                unplacedPieces: newUnplaced,
                selectedSetupPiece: null,
            },
        });
    },

    confirmSetup: () => {
        const state = get();
        const { setup, gameConfig } = state;
        const { setupPlayer, confirmedPlayers, unplacedPieces } = setup;
        
        if (!setupPlayer) return;
        
        // Check all pieces placed
        if (unplacedPieces[setupPlayer].length > 0) {
            console.warn('Cannot confirm: pieces still unplaced');
            return;
        }
        
        const newConfirmed = [...confirmedPlayers, setupPlayer];
        
        // Check if all players confirmed
        const allConfirmed = gameConfig.players.every(p => newConfirmed.includes(p));
        
        if (allConfirmed) {
            // Start the game!
            set({
                phase: 'playing',
                setup: {
                    ...setup,
                    confirmedPlayers: newConfirmed,
                    setupPlayer: null,
                },
                currentPlayer: gameConfig.players[0],
                isSetupOpen: false,
            });
        } else {
            // Next player's setup turn
            const nextSetupPlayer = getNextSetupPlayer(
                setupPlayer, 
                gameConfig.players, 
                newConfirmed
            );
            
            set({
                setup: {
                    ...setup,
                    confirmedPlayers: newConfirmed,
                    setupPlayer: nextSetupPlayer,
                    selectedSetupPiece: null,
                },
            });
            
            // If next player is AI, trigger AI setup
            if (nextSetupPlayer && gameConfig.playerTypes[nextSetupPlayer] === 'computer') {
                setTimeout(() => get().performAISetup(), 500);
            }
        }
    },

    performAISetup: async () => {
        const state = get();
        const { setup, board, gameConfig } = state;
        const { setupPlayer, confirmedPlayers } = setup;
        
        if (!setupPlayer) return;
        if (gameConfig.playerTypes[setupPlayer] !== 'computer') return;
        
        const is4Player = gameConfig.playerCount === 4;
        const aiDifficulty = gameConfig.aiDifficulty[setupPlayer];
        
        // Get opponent's setup if available (for counter-strategy)
        let opponentSetupTypes: Piece['type'][] | undefined;
        if (confirmedPlayers.length > 0) {
            const firstOpponent = confirmedPlayers[0];
            const opponentRow = getStartingRow(firstOpponent);
            const opponentPieces: Piece[] = [];
            
            if (firstOpponent === 'yellow' || firstOpponent === 'green') {
                const col = getStartingColumn(firstOpponent);
                for (let row = 2; row <= 7; row++) {
                    const piece = board[row][col];
                    if (piece) opponentPieces.push(piece);
                }
            } else {
                const range = is4Player ? [2, 3, 4, 5, 6, 7] : VALID_PLACEMENT_COLUMNS;
                for (const col of range) {
                    const piece = board[opponentRow][col];
                    if (piece) opponentPieces.push(piece);
                }
            }
            
            if (opponentPieces.length > 0) {
                opponentSetupTypes = getSetupTypes(opponentPieces);
            }
        }
        
        // Generate strategic setup based on difficulty
        const arrangement = generateAISetup(
            setupPlayer,
            aiDifficulty,
            is4Player,
            opponentSetupTypes
        );
        
        // Place pieces on board with animation
        const newBoard = board.map(r => [...r]);
        const slots = getEmptySlots(board, setupPlayer, is4Player);
        
        for (let i = 0; i < arrangement.length && i < slots.length; i++) {
            const piece = arrangement[i];
            const slot = slots[i];
            
            if (setupPlayer === 'yellow' || setupPlayer === 'green') {
                const col = getStartingColumn(setupPlayer);
                newBoard[slot][col] = piece;
            } else {
                const row = getStartingRow(setupPlayer);
                newBoard[row][slot] = piece;
            }
        }
        
        // Update board and clear unplaced
        const newUnplaced = { ...setup.unplacedPieces };
        newUnplaced[setupPlayer] = [];
        
        set({
            board: newBoard,
            setup: {
                ...setup,
                unplacedPieces: newUnplaced,
                selectedSetupPiece: null,
            },
        });
        
        // Wait for human to observe
        await delay(1000);
        
        // Confirm setup
        get().confirmSetup();
    },
});

