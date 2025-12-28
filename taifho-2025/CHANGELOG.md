# Changelog

All notable changes to this project are documented here.

---

## [0.4.2] - 2025-12-28

### Position History - Anti-Cycling for AI vs AI

#### Added

**Position History Tracking**
- New `positionHistory.ts` module using Zobrist hashing
- Tracks all board positions throughout the game
- Exponential penalty for repeated positions (2000 * 2^n per repetition)
- 3-fold repetition detection (for future draw rule)

**Integration**
- Minimax now penalizes moves leading to repeated positions
- Positions recorded after each move
- History cleared on new game

This prevents AI vs AI games from getting stuck in endless cycles,
especially in 4-player hard mode.

---

## [0.4.1] - 2025-12-28

### Bug Fix: 4-Player Piece Count

#### Fixed

**4-Player Mode Piece Count**
- Corrected piece count from 6 to **8 pieces per player** per original Alga Taifho rules
- Each player now has: 2 squares, 2 triangles, 2 diamonds, 2 circles
- Pieces placed on columns/rows 1-8 (corners remain empty)
- Verified from original rule sheet images in `pictures/` folder

**TypeScript Warnings**
- Fixed unused variable warnings across multiple files
- No functional changes, just cleaner code

---


## [0.4.0] - 2025-12-27

### Advanced AI System - 7 Difficulty Levels

Complete overhaul of the AI system with research-based improvements.

#### Added

**7 Difficulty Levels**
| Level | Name | Algorithm | Features |
|-------|------|-----------|----------|
| 1 | Beginner | Random | Random legal moves |
| 2 | Easy | Greedy (d=1) | Immediate best move, 30% randomness |
| 3 | Medium | Minimax (d=2) | Alpha-beta, 10% randomness |
| 4 | Challenging | Minimax (d=3) | Move ordering, Transposition Table |
| 5 | Hard | Minimax (d=4) | Iterative deepening, time-limited |
| 6 | Master | MCTS | 2000 simulations |
| 7 | Grandmaster | Hybrid | MCTS + Minimax verification |

**New AI Modules**
- `src/ai/types.ts` - AI-specific type definitions
- `src/ai/transpositionTable.ts` - Zobrist hashing + position caching
- `src/ai/moveOrdering.ts` - Move ordering with killer moves, history heuristic
- `src/ai/mcts.ts` - Monte Carlo Tree Search implementation
- `src/ai/index.ts` - Unified module exports

**Optimization Techniques**
- **Transposition Table**: Zobrist hashing with 262K entries
- **Move Ordering**: Hash move, goal moves, jumps, killers, history
- **Iterative Deepening**: Time-managed search with depth progression
- **MCTS**: UCB1 selection, evaluation-based rollouts

**Documentation**
- `docs/AI_ARCHITECTURE.md` - Complete AI system architecture
- Performance targets and testing strategy

#### Changed

- Extended `AIDifficulty` type to support 7 levels
- Refactored `minimax.ts` to support all optimization features
- Updated `aiSlice.ts` to handle MCTS for master/grandmaster levels

---

## [0.3.0] - 2025-12-27

### Individual AI Difficulty Per Player

Each AI player can now have their own difficulty level, allowing for mixed difficulty games.

#### Added

**Per-Player AI Difficulty**
- `GameConfig.aiDifficulty` changed from single value to `Record<PlayerColor, AIDifficulty | null>`
- Each player can have independent difficulty setting (null for human players)
- UI updated to show difficulty selector for each AI player individually

**UI Improvements**
- `GameSetup.tsx` - Complete redesign with per-player settings
  - Each player (Red, Blue, Yellow, Green) has Human/AI toggle
  - Difficulty selector appears for each AI player
  - Works seamlessly in both 2-player and 4-player modes
- New CSS styles for player settings panel
  - Color-coded difficulty buttons (green Easy, yellow Medium, red Hard)
  - Improved layout for player configuration

#### Fixed

**Color Rendering**
- Added CSS styles for Yellow and Green pieces (`Piece.css`)
- Yellow pieces now render correctly (#ffd60a)
- Green pieces now render correctly (#06d6a0)
- All four player colors (Red, Blue, Yellow, Green) display properly

**AI Evaluation for All Colors**
- Fixed `evaluator.ts` to correctly handle Yellow and Green players
  - Previously only calculated progress for Y-axis (Red/Blue)
  - Now correctly calculates progress for X-axis (Yellow/Green)
  - Uses `getGoalLine()` helper for both axes
- Fixed "almost win" bonus to work for both 2P (8 pieces) and 4P (6 pieces)
- AI now correctly understands goal direction for all four colors

**Win Condition Documentation**
- Updated comments in `winCondition.ts` to clarify:
  - Works for all player colors (Red, Blue, Yellow, Green)
  - Supports both 2-player (8 pieces) and 4-player (6 pieces) modes
  - Correctly checks both X-axis and Y-axis goal lines

#### Added

**Development Tools**
- `.cursor/rules/` - Cursor IDE rules for consistent code quality
  - `typescript-strict.mdc` - Never ignore type errors
  - `modular-code.mdc` - File size limits (300 lines max)
  - `react-components.mdc` - React best practices
  - `zustand-store.mdc` - Store architecture patterns
  - `ai-module.mdc` - AI-specific guidelines
  - `game-logic.mdc` - Game rules and types
  - `testing.mdc` - Testing guidelines
  - `project-guidelines.mdc` - General project conventions

**Documentation**
- `docs/ai-4-player-design.md` - Design document for 4-player AI support
  - Analysis of challenges in multi-player minimax
  - Three proposed solutions with pros/cons
  - Recommended approach: Opponent Modeling
  - Implementation plan with code examples
  - Performance considerations and testing strategy

---

## [0.2.0] - 2025-12-27

### AI System Implementation

Complete AI opponent system with configurable difficulty levels.

#### Added

**AI Engine (`src/ai/`)**
- `minimax.ts` - Minimax algorithm with alpha-beta pruning
  - Configurable search depth (1-3 levels)
  - Anti-oscillation: tracks recent moves, penalizes reverse moves
  - Randomness parameter for varied play at lower difficulties
- `evaluator.ts` - Board state evaluation function
  - Material counting (piece advantage)
  - Progress scoring (distance to goal line)
  - Goal bonus (pieces that reached target row)
  - Win/loss detection with extreme scores (±999999)
- `moveGenerator.ts` - Legal move generation for all piece types

**Game Modes**
- Human vs Human (local pass-and-play)
- Human vs AI (player vs computer)
- AI vs AI (spectator mode - watch two AIs play)

**AI Difficulty Presets**
| Difficulty | Depth | Randomness | Repetition Penalty |
|------------|-------|------------|-------------------|
| Easy       | 1     | 30%        | No                |
| Medium     | 2     | 10%        | Yes               |
| Hard       | 3     | 0%         | Yes               |

**Store Slice (`src/store/slices/aiSlice.ts`)**
- `performAiMove()` - Async AI move execution with thinking delay
- Difficulty-based delays (300ms easy, 500ms medium, 800ms hard)
- Integration with game store for seamless turn handling

**UI Updates**
- `GameSetup.tsx` - Game mode and difficulty selection modal
- AI difficulty selector (only shown when AI is playing)
- AI vs AI info message explaining spectator mode

---

## [0.1.0] - 2025-12-24

### Initial Reimplementation

Complete rewrite of the original Taifho game using modern stack.

#### Added

**Core Game Logic**
- 10x10 board with 4 piece types per player
- Full movement rules for all piece types:
  - Square: orthogonal movement
  - Diamond: diagonal movement
  - Circle: all 8 directions
  - Triangle: diagonal forward OR straight backward
- Jump mechanics (hop over adjacent piece)
- Leap mechanics (symmetric long jump over obstacle)
- Starting line rule (sideways movement on home row)

**State Management (`src/store/`)**
- Zustand store with slice-based architecture
- `gameSlice.ts` - Game initialization and reset
- `moveSlice.ts` - Piece selection and movement
- `historySlice.ts` - Move history with back/forward navigation

**Components (`src/components/`)**
- `Board.tsx` - 10x10 game board with @dnd-kit drag & drop
- `Cell.tsx` - Droppable board cells
- `DraggablePiece.tsx` - Draggable game pieces
- `Piece.tsx` - Piece rendering (shapes and colors)
- `HelpPanel.tsx` - Game rules reference
- `MoveLog.tsx` - Move history display

**Utilities (`src/utils/`)**
- `boardUtils.ts` - Board initialization with starting positions
- `moveValidation.ts` - Complete move rule validation
- `jumpValidation.ts` - Jump and leap validation
- `winCondition.ts` - Win detection (all pieces at goal)

**Types (`src/types/game.ts`)**
- Full TypeScript type definitions
- Player colors, piece types, positions, moves
- Game configuration types

**Testing**
- Vitest setup with jsdom
- Unit tests for move validation
- Unit tests for jump validation

**Tech Stack**
- React 19 with TypeScript
- Vite 7 build system
- Zustand 5 for state management
- @dnd-kit for drag and drop
- ESLint 9 with TypeScript support

---

## Architecture Notes for AI Continuation

### Key Files to Understand

1. **Game Types** (`src/types/game.ts`)
   - All type definitions, including `PlayerColor`, `Piece`, `Position`, `Move`
   - Helper functions: `getForwardDirection()`, `getGoalLine()`, `getStartLine()`

2. **Store** (`src/store/useGameStore.ts`)
   - Central Zustand store combining all slices
   - Key state: `board`, `currentPlayer`, `winner`, `gameConfig`

3. **Move Validation** (`src/utils/moveValidation.ts`)
   - `isMoveValid()` - Main validation function
   - Handles all piece types, jumps, leaps, and starting line rule

4. **AI** (`src/ai/`)
   - Self-contained AI module
   - `getBestMove()` - Main entry point
   - `resetAIHistory()` - Call on new game to clear oscillation tracking

### Known Limitations / Future Work

- [ ] Chain jumps not implemented (multiple jumps in one turn)
- [ ] Circle disruption not implemented (special Circle vs Circle rule)
- [ ] 4-player AI support (see `docs/ai-4-player-design.md`)
- [ ] AI could benefit from move ordering optimization
- [ ] Opening book could improve early game
- [ ] Transposition table could speed up search

### Testing Commands

```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test -- ai        # Run only AI tests
```
