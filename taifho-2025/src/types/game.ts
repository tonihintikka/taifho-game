export type PlayerColor = 'red' | 'blue' | 'yellow' | 'green';

export type PieceType = 'circle' | 'square' | 'triangle' | 'diamond';

export type PlayerCount = 2 | 4;
export type PlayerType = 'human' | 'computer';
export type AIDifficulty = 
  | 'beginner'     // Level 1: Random moves
  | 'easy'         // Level 2: Greedy (depth 1)
  | 'medium'       // Level 3: Minimax (depth 2)
  | 'challenging'  // Level 4: Minimax + TT (depth 3)
  | 'hard'         // Level 5: Iterative deepening (depth 4+)
  | 'master'       // Level 6: MCTS
  | 'grandmaster'  // Level 7: Hybrid MCTS + Minimax

// Game phases
export type GamePhase = 'config' | 'setup' | 'playing' | 'finished';

// Setup mode: sequential (one at a time) or simultaneous (both at once)
export type SetupMode = 'sequential' | 'simultaneous';

export interface PlayerConfig {
    color: PlayerColor;
    type: PlayerType;
}

export interface GameConfig {
    playerCount: PlayerCount;
    players: PlayerColor[]; // Used for turn order loop
    playerTypes: Record<PlayerColor, PlayerType>; // Define who is bot
    aiDifficulty: Record<PlayerColor, AIDifficulty | null>; // AI skill level per player (null for human players)
}

export interface Piece {
    id: string;
    type: PieceType;
    color: PlayerColor;
}

export interface Position {
    x: number;
    y: number;
}

export interface Move {
    from: Position;
    to: Position;
    piece: Piece;
    captured?: Piece;
}

// Setup phase state
export interface SetupState {
    // Pieces waiting to be placed (off-board)
    unplacedPieces: Record<PlayerColor, Piece[]>;
    // Currently selected piece for placement
    selectedSetupPiece: Piece | null;
    // Current player setting up
    setupPlayer: PlayerColor | null;
    // Players who have confirmed their setup
    confirmedPlayers: PlayerColor[];
    // Setup mode
    setupMode: SetupMode;
}

export interface GameState {
    // Game phase
    phase: GamePhase;
    // Setup state
    setup: SetupState;
    // Board state
    board: (Piece | null)[][];
    currentPlayer: PlayerColor;
    winner: PlayerColor | null;
    selectedPos: Position | null;
    validMoves?: Position[];
    moveHistory?: Move[];
    gameConfig: GameConfig;
    // 4-player game: track placements (1st, 2nd, 3rd place)
    placements: PlayerColor[];
}

// Direction helpers for movement validation
export interface Direction {
    dx: number;
    dy: number;
}

/**
 * Get forward direction for a player.
 * Red (top) → down (+y), Blue (bottom) → up (-y)
 * Yellow (left) → right (+x), Green (right) → left (-x)
 */
export const getForwardDirection = (color: PlayerColor): Direction => {
    switch (color) {
        case 'red': return { dx: 0, dy: 1 };
        case 'blue': return { dx: 0, dy: -1 };
        case 'yellow': return { dx: 1, dy: 0 };
        case 'green': return { dx: -1, dy: 0 };
    }
};

/**
 * Get goal row/column for a player.
 */
export const getGoalLine = (color: PlayerColor): { axis: 'x' | 'y', value: number } => {
    switch (color) {
        case 'red': return { axis: 'y', value: 9 };    // bottom row
        case 'blue': return { axis: 'y', value: 0 };   // top row
        case 'yellow': return { axis: 'x', value: 9 }; // right column
        case 'green': return { axis: 'x', value: 0 };  // left column
    }
};

/**
 * Get starting row/column for a player.
 */
export const getStartLine = (color: PlayerColor): { axis: 'x' | 'y', value: number } => {
    switch (color) {
        case 'red': return { axis: 'y', value: 0 };    // top row
        case 'blue': return { axis: 'y', value: 9 };   // bottom row
        case 'yellow': return { axis: 'x', value: 0 }; // left column
        case 'green': return { axis: 'x', value: 9 };  // right column
    }
};

// Properly typed:
export const DEFAULT_2P_CONFIG: GameConfig = {
    playerCount: 2,
    players: ['red', 'blue'],
    playerTypes: {
        red: 'human',
        blue: 'computer',
        yellow: 'human',
        green: 'human'
    },
    aiDifficulty: {
        red: null,
        blue: 'medium',
        yellow: null,
        green: null
    }
};

export const DEFAULT_4P_CONFIG: GameConfig = {
    playerCount: 4,
    players: ['red', 'green', 'blue', 'yellow'],
    playerTypes: {
        red: 'human',
        blue: 'human',
        yellow: 'human',
        green: 'human'
    },
    aiDifficulty: {
        red: null,
        blue: null,
        yellow: null,
        green: null
    }
};

/**
 * Get the starting row index for a player (for piece placement)
 */
export const getStartingRow = (color: PlayerColor): number => {
    switch (color) {
        case 'red': return 0;      // Top row
        case 'blue': return 9;     // Bottom row
        case 'yellow': return -1;  // Left column (special handling)
        case 'green': return -1;   // Right column (special handling)
    }
};

/**
 * Get the starting column index for 4-player side players
 */
export const getStartingColumn = (color: PlayerColor): number => {
    switch (color) {
        case 'yellow': return 0;   // Left column
        case 'green': return 9;    // Right column
        default: return -1;        // N/A for red/blue
    }
};

/**
 * Create initial unplaced pieces for a player
 */
export const createUnplacedPieces = (color: PlayerColor, is4Player: boolean = false): Piece[] => {
    if (is4Player) {
        // 4-player: 6 pieces (no circles in this variant)
        return [
            { id: `${color}-square-1`, type: 'square', color },
            { id: `${color}-square-2`, type: 'square', color },
            { id: `${color}-triangle-1`, type: 'triangle', color },
            { id: `${color}-triangle-2`, type: 'triangle', color },
            { id: `${color}-diamond-1`, type: 'diamond', color },
            { id: `${color}-diamond-2`, type: 'diamond', color },
        ];
    }
    // 2-player: 8 pieces
    return [
        { id: `${color}-square-1`, type: 'square', color },
        { id: `${color}-square-2`, type: 'square', color },
        { id: `${color}-triangle-1`, type: 'triangle', color },
        { id: `${color}-triangle-2`, type: 'triangle', color },
        { id: `${color}-diamond-1`, type: 'diamond', color },
        { id: `${color}-diamond-2`, type: 'diamond', color },
        { id: `${color}-circle-1`, type: 'circle', color },
        { id: `${color}-circle-2`, type: 'circle', color },
    ];
};

/**
 * Initial empty setup state
 */
export const createInitialSetupState = (): SetupState => ({
    unplacedPieces: {
        red: [],
        blue: [],
        yellow: [],
        green: [],
    },
    selectedSetupPiece: null,
    setupPlayer: null,
    confirmedPlayers: [],
    setupMode: 'sequential',
});
