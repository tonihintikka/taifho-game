# Setup Phase Implementation Design

## Overview

This document describes the implementation of the **free starting arrangement** feature, where players choose the placement of their 8 pieces before the game begins.

## Game Phases

```
┌─────────────────────────────────────────────────────────────────┐
│                      GAME FLOW                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   CONFIG     │ → │    SETUP     │ → │    PLAY      │        │
│  │              │    │              │    │              │        │
│  │ • Players    │    │ • Place      │    │ • Move       │        │
│  │ • AI/Human   │    │   pieces     │    │   pieces     │        │
│  │ • Difficulty │    │ • Confirm    │    │ • Win check  │        │
│  └──────────────┘    └──────────────┘    └──────────────┘        │
│                                                                  │
│                      NEW PHASE ↑                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## State Changes

### New Game State

```typescript
// types/game.ts

type GamePhase = 'config' | 'setup' | 'playing' | 'finished';

interface SetupState {
  // Pieces waiting to be placed (off-board)
  unplacedPieces: {
    [color: PlayerColor]: Piece[];
  };
  
  // Which player is currently setting up
  currentSetupPlayer: PlayerColor | null;
  
  // Players who have confirmed their setup
  confirmedPlayers: PlayerColor[];
  
  // Setup mode: sequential or simultaneous
  setupMode: 'sequential' | 'simultaneous';
}

interface GameState {
  phase: GamePhase;  // NEW
  setup: SetupState; // NEW
  board: (Piece | null)[][];
  currentPlayer: PlayerColor;
  // ... rest of existing state
}
```

## UI Design

### Setup Screen Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                     TAIFHO - Setup Phase                         │
│                     Red's Turn to Place                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────── UNPLACED PIECES ──────────────────┐       │
│  │                                                       │       │
│  │    ■  ■    ◆  ◆    ▲  ▲    ●  ●                      │       │
│  │   sq sq  dia dia  tri tri cir cir                    │       │
│  │                                                       │       │
│  │   [Click a piece to select, then click board slot]   │       │
│  └───────────────────────────────────────────────────────┘       │
│                                                                  │
│         0   1   2   3   4   5   6   7   8   9                    │
│       ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐                 │
│     0 │ X │ _ │ _ │ _ │ _ │ _ │ _ │ _ │ _ │ X │  ← Place here   │
│       ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤                 │
│     1 │   │   │   │   │   │   │   │   │   │   │                 │
│       ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤                 │
│       │   │   │   │   │   │   │   │   │   │   │                 │
│       │           ... (empty board) ...           │                 │
│       ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤                 │
│     9 │ X │ _ │ _ │ _ │ _ │ _ │ _ │ _ │ _ │ X │                 │
│       └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘                 │
│                                                                  │
│          [Clear All]  [Randomize]  [Confirm Setup]              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Structure

```
src/components/
├── SetupPhase/
│   ├── SetupPhase.tsx          # Main setup container
│   ├── SetupPhase.css          # Styles
│   ├── UnplacedPieces.tsx      # Piece tray component
│   ├── SetupBoard.tsx          # Board with placement slots
│   └── SetupControls.tsx       # Buttons (confirm, clear, random)
```

## Interaction Flow

### Human Player Setup

```
┌─────────────────────────────────────────────────────────────────┐
│                    HUMAN SETUP FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Select piece from tray (click/tap)                          │
│         ↓                                                        │
│  2. Selected piece highlights                                    │
│         ↓                                                        │
│  3. Click empty slot on starting row (columns 1-8)              │
│         ↓                                                        │
│  4. Piece moves from tray to board                              │
│         ↓                                                        │
│  5. Repeat until all 8 pieces placed                            │
│         ↓                                                        │
│  6. [Confirm Setup] button becomes active                       │
│         ↓                                                        │
│  7. Click confirm → Next player's turn (or game starts)         │
│                                                                  │
│  Alternative actions:                                            │
│  • Click placed piece → returns to tray                         │
│  • [Clear All] → all pieces return to tray                      │
│  • [Randomize] → random valid placement                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### AI Player Setup

```
┌─────────────────────────────────────────────────────────────────┐
│                      AI SETUP FLOW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. AI's turn to setup triggered                                │
│         ↓                                                        │
│  2. AI analyzes strategic considerations:                       │
│     • Opponent's visible setup (if sequential)                  │
│     • Piece synergies                                           │
│     • Opening theory                                            │
│         ↓                                                        │
│  3. AI generates optimal placement                              │
│         ↓                                                        │
│  4. Pieces appear on board (with animation)                     │
│         ↓                                                        │
│  5. Brief delay for human to observe                            │
│         ↓                                                        │
│  6. Auto-confirm after delay                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## AI Setup Strategy

### Strategic Factors

```typescript
// src/ai/setupStrategy.ts

interface SetupEvaluation {
  score: number;
  factors: {
    circleCentrality: number;     // Circles in center = flexible
    triangleSafety: number;       // Triangles on edges = safe
    diamondCoverage: number;      // Diamonds covering diagonals
    squareAdvancement: number;    // Squares ready for straight advance
    pieceSynergy: number;         // Adjacent pieces that support each other
    opponentCounter: number;      // Counter opponent's setup (if known)
  };
}
```

### AI Setup Algorithm

```typescript
// src/ai/setupAI.ts

interface SetupConfig {
  difficulty: AIDifficulty;
  opponentSetup?: Piece[];  // If opponent already placed (sequential mode)
}

/**
 * Generate AI's starting arrangement
 */
export const generateAISetup = (
  color: PlayerColor,
  config: SetupConfig
): Piece[] => {
  const pieces = createPlayerPieces(color);
  
  switch (config.difficulty) {
    case 'beginner':
      // Random placement
      return shuffleArray(pieces);
      
    case 'easy':
      // Simple heuristic: circles center, triangles edge
      return simpleStrategicPlacement(pieces);
      
    case 'medium':
    case 'challenging':
      // Evaluate multiple arrangements, pick best
      return evaluatedPlacement(pieces, config);
      
    case 'hard':
    case 'master':
    case 'grandmaster':
      // Deep analysis with opponent modeling
      return advancedPlacement(pieces, config);
  }
};

/**
 * Evaluate a setup arrangement
 */
const evaluateSetup = (
  arrangement: Piece[],
  opponentSetup?: Piece[]
): number => {
  let score = 0;
  
  // Factor 1: Circle positioning (center is better)
  const circles = arrangement.filter(p => p.type === 'circle');
  circles.forEach((c, i) => {
    const pos = arrangement.indexOf(c);
    const distFromCenter = Math.abs(pos - 3.5);
    score += (4 - distFromCenter) * 10;  // Center bonus
  });
  
  // Factor 2: Triangle positioning (edges are safer)
  const triangles = arrangement.filter(p => p.type === 'triangle');
  triangles.forEach((t, i) => {
    const pos = arrangement.indexOf(t);
    if (pos <= 1 || pos >= 6) {
      score += 5;  // Edge bonus for triangles
    }
  });
  
  // Factor 3: Diamond diagonal lanes
  const diamonds = arrangement.filter(p => p.type === 'diamond');
  // Check if diamonds have clear diagonal paths
  
  // Factor 4: Square straight lanes
  const squares = arrangement.filter(p => p.type === 'square');
  // Check if squares have clear vertical paths
  
  // Factor 5: Counter opponent (if known)
  if (opponentSetup) {
    score += evaluateCounterStrategy(arrangement, opponentSetup);
  }
  
  // Factor 6: Randomness (to avoid predictability)
  score += Math.random() * 5;
  
  return score;
};

/**
 * Generate multiple arrangements and pick the best
 */
const evaluatedPlacement = (
  pieces: Piece[],
  config: SetupConfig
): Piece[] => {
  const candidates: { arrangement: Piece[]; score: number }[] = [];
  
  // Generate N random arrangements
  const iterations = config.difficulty === 'medium' ? 50 : 200;
  
  for (let i = 0; i < iterations; i++) {
    const arrangement = shuffleArray([...pieces]);
    const score = evaluateSetup(arrangement, config.opponentSetup);
    candidates.push({ arrangement, score });
  }
  
  // Sort by score and pick best
  candidates.sort((a, b) => b.score - a.score);
  
  // Add some randomness to top choices (avoid always same setup)
  const topN = Math.min(5, candidates.length);
  const selected = candidates[Math.floor(Math.random() * topN)];
  
  return selected.arrangement;
};
```

### Setup Templates (Opening Book)

```typescript
// src/ai/setupTemplates.ts

/**
 * Pre-defined strategic setups
 */
export const SETUP_TEMPLATES = {
  // Balanced: Circles center, mixed edges
  balanced: ['square', 'triangle', 'diamond', 'circle', 'circle', 'diamond', 'triangle', 'square'],
  
  // Aggressive: Circles and diamonds forward-ready
  aggressive: ['triangle', 'square', 'circle', 'diamond', 'diamond', 'circle', 'square', 'triangle'],
  
  // Defensive: Triangles protected, squares on flanks
  defensive: ['square', 'diamond', 'triangle', 'circle', 'circle', 'triangle', 'diamond', 'square'],
  
  // Flanking: Strong pieces on edges
  flanking: ['circle', 'diamond', 'triangle', 'square', 'square', 'triangle', 'diamond', 'circle'],
  
  // Center control: All power in middle
  centerControl: ['triangle', 'square', 'circle', 'diamond', 'diamond', 'circle', 'square', 'triangle'],
};

/**
 * Select template based on opponent analysis
 */
export const selectTemplate = (
  opponentSetup?: Piece[],
  difficulty: AIDifficulty = 'medium'
): PieceType[] => {
  if (!opponentSetup) {
    // No opponent info: use balanced or random template
    const templates = Object.values(SETUP_TEMPLATES);
    return templates[Math.floor(Math.random() * templates.length)];
  }
  
  // Analyze opponent's setup and counter
  const opponentCirclePositions = findPiecePositions(opponentSetup, 'circle');
  
  // If opponent has circles on edges, use center control
  if (opponentCirclePositions.some(p => p <= 1 || p >= 6)) {
    return SETUP_TEMPLATES.centerControl;
  }
  
  // If opponent is aggressive, be defensive
  // ... more analysis
  
  return SETUP_TEMPLATES.balanced;
};
```

## Store Changes

### Setup Slice

```typescript
// src/store/slices/setupSlice.ts

export interface SetupSliceState {
  // Unplaced pieces per player
  unplacedPieces: Record<PlayerColor, Piece[]>;
  
  // Currently selected piece for placement
  selectedPiece: Piece | null;
  
  // Current player setting up
  setupPlayer: PlayerColor | null;
  
  // Players who confirmed their setup
  confirmedPlayers: PlayerColor[];
  
  // Actions
  selectPieceForPlacement: (piece: Piece) => void;
  placePiece: (position: number) => void;  // Column 1-8
  removePiece: (position: number) => void;
  clearSetup: () => void;
  randomizeSetup: () => void;
  confirmSetup: () => void;
  
  // AI setup
  performAISetup: () => Promise<void>;
}

export const createSetupSlice: StoreSlice<SetupSliceState> = (set, get) => ({
  unplacedPieces: {},
  selectedPiece: null,
  setupPlayer: null,
  confirmedPlayers: [],
  
  selectPieceForPlacement: (piece) => {
    set({ selectedPiece: piece });
  },
  
  placePiece: (column) => {
    const state = get();
    if (!state.selectedPiece || !state.setupPlayer) return;
    
    // Validate column (1-8 only)
    if (column < 1 || column > 8) return;
    
    const row = getStartingRow(state.setupPlayer);
    
    // Check if slot is empty
    if (state.board[row][column] !== null) return;
    
    // Place piece
    const newBoard = [...state.board];
    newBoard[row][column] = state.selectedPiece;
    
    // Remove from unplaced
    const newUnplaced = { ...state.unplacedPieces };
    newUnplaced[state.setupPlayer] = newUnplaced[state.setupPlayer]
      .filter(p => p.id !== state.selectedPiece!.id);
    
    set({
      board: newBoard,
      unplacedPieces: newUnplaced,
      selectedPiece: null
    });
  },
  
  removePiece: (column) => {
    const state = get();
    if (!state.setupPlayer) return;
    
    const row = getStartingRow(state.setupPlayer);
    const piece = state.board[row][column];
    
    if (!piece || piece.color !== state.setupPlayer) return;
    
    // Remove from board
    const newBoard = [...state.board];
    newBoard[row][column] = null;
    
    // Add back to unplaced
    const newUnplaced = { ...state.unplacedPieces };
    newUnplaced[state.setupPlayer] = [...newUnplaced[state.setupPlayer], piece];
    
    set({
      board: newBoard,
      unplacedPieces: newUnplaced
    });
  },
  
  confirmSetup: () => {
    const state = get();
    if (!state.setupPlayer) return;
    
    // Check all pieces placed
    if (state.unplacedPieces[state.setupPlayer].length > 0) return;
    
    const newConfirmed = [...state.confirmedPlayers, state.setupPlayer];
    
    // Check if all players confirmed
    const allConfirmed = state.gameConfig.players.every(p => 
      newConfirmed.includes(p)
    );
    
    if (allConfirmed) {
      // Start the game!
      set({
        phase: 'playing',
        confirmedPlayers: newConfirmed,
        setupPlayer: null,
        currentPlayer: state.gameConfig.players[0]
      });
    } else {
      // Next player's setup turn
      const nextSetupPlayer = getNextSetupPlayer(state.setupPlayer, state.gameConfig, newConfirmed);
      set({
        confirmedPlayers: newConfirmed,
        setupPlayer: nextSetupPlayer
      });
    }
  },
  
  performAISetup: async () => {
    const state = get();
    if (!state.setupPlayer) return;
    
    const aiConfig = state.gameConfig.playerTypes[state.setupPlayer];
    if (aiConfig.type !== 'ai') return;
    
    // Get opponent's setup if available (sequential mode)
    const opponentSetup = getOpponentSetup(state);
    
    // Generate AI setup
    const arrangement = generateAISetup(state.setupPlayer, {
      difficulty: aiConfig.difficulty,
      opponentSetup
    });
    
    // Animate placement
    for (const piece of arrangement) {
      await delay(200);  // Animation delay
      // Place piece at next available slot
      const nextSlot = getNextEmptySlot(state.board, state.setupPlayer);
      get().placePiece(nextSlot);
    }
    
    // Auto-confirm after delay
    await delay(500);
    get().confirmSetup();
  }
});
```

## Implementation Plan

### Phase 1: State & Types (Day 1)

1. Add `GamePhase` type
2. Add `SetupState` interface
3. Create `setupSlice.ts`
4. Update `useGameStore.ts` with new slice

### Phase 2: Setup UI (Day 2-3)

1. Create `SetupPhase.tsx` component
2. Create `UnplacedPieces.tsx` (piece tray)
3. Create `SetupBoard.tsx` (placement board)
4. Create `SetupControls.tsx` (buttons)
5. Add CSS styling

### Phase 3: Human Interaction (Day 3-4)

1. Implement piece selection
2. Implement drag-and-drop placement
3. Implement piece removal (click to return)
4. Implement clear/randomize buttons
5. Implement confirm button

### Phase 4: AI Setup (Day 4-5)

1. Create `setupStrategy.ts`
2. Implement evaluation function
3. Implement template system
4. Add difficulty-based setup selection
5. Add opponent counter-strategy (for sequential mode)

### Phase 5: Integration (Day 5-6)

1. Update `App.tsx` to handle phases
2. Update game flow (config → setup → play)
3. Test 2-player setup
4. Test 4-player setup
5. Test AI vs AI setup

### Phase 6: Polish (Day 6-7)

1. Add animations
2. Add sound effects (optional)
3. Add setup hints/tooltips
4. Performance optimization
5. Bug fixes

## Testing Scenarios

### Unit Tests

```typescript
describe('Setup Phase', () => {
  describe('Piece Placement', () => {
    it('should place piece on valid slot', () => {});
    it('should reject placement on corner', () => {});
    it('should reject placement on occupied slot', () => {});
    it('should return piece to tray when removed', () => {});
  });
  
  describe('Setup Confirmation', () => {
    it('should not confirm with unplaced pieces', () => {});
    it('should advance to next player after confirm', () => {});
    it('should start game when all confirmed', () => {});
  });
  
  describe('AI Setup', () => {
    it('should place all 8 pieces', () => {});
    it('should vary placement between games', () => {});
    it('should respect difficulty settings', () => {});
  });
});
```

### Integration Tests

- Human vs Human: Both players setup manually
- Human vs AI: Human setups, AI responds
- AI vs AI: Both AIs setup with strategic variation
- 4-player: All combinations of human/AI

## Configuration Options

```typescript
interface SetupOptions {
  // Setup mode
  mode: 'sequential' | 'simultaneous';
  
  // Time limit per player (optional)
  timeLimit?: number;
  
  // Show opponent's setup during your turn?
  showOpponentSetup: boolean;
  
  // Allow randomize button?
  allowRandomize: boolean;
  
  // AI thinking time (for animation)
  aiSetupDelay: number;
}
```

## Summary

| Component | Priority | Effort | Status |
|-----------|----------|--------|--------|
| State changes | High | Small | Pending |
| Setup UI | High | Medium | Pending |
| Human interaction | High | Medium | Pending |
| AI setup strategy | Medium | Medium | Pending |
| Templates/opening book | Low | Small | Pending |
| Animations | Low | Small | Pending |
| Tests | Medium | Medium | Pending |

**Total estimated effort: 5-7 days**

