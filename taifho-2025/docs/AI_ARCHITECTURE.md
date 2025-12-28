# Taifho AI Architecture

## Overview

The AI system extends the existing minimax implementation with 7 difficulty levels, ranging from beginner-friendly random moves to advanced MCTS-based play.

## Current Structure

```
src/ai/
├── minimax.ts       # Search algorithm + difficulty configs
├── evaluator.ts     # Board evaluation
├── moveGenerator.ts # Legal move generation
└── __tests__/
    └── ai.test.ts   # AI tests
```

## Extended Structure (after enhancement)

```
src/ai/
├── index.ts              # Main exports
├── types.ts              # AI-specific types
├── minimax.ts            # Minimax + Alpha-Beta (levels 1-5)
├── evaluator.ts          # Board evaluation (enhanced)
├── moveGenerator.ts      # Legal move generation
├── moveOrdering.ts       # Move ordering heuristics (level 4+)
├── transpositionTable.ts # Zobrist hashing + TT (level 4+)
├── iterativeDeepening.ts # Time-managed search (level 5+)
├── mcts.ts               # Monte Carlo Tree Search (level 6-7)
└── __tests__/
    └── ai.test.ts
```

## Difficulty Levels

| Level | Name | Algorithm | Depth | Features |
|-------|------|-----------|-------|----------|
| 1 | Beginner | Random | 0 | Random legal move |
| 2 | Easy | Greedy | 1 | Immediate best move, randomness: 30% |
| 3 | Medium | Minimax | 2 | Alpha-beta, randomness: 10% |
| 4 | Challenging | Minimax | 3 | Move ordering, TT |
| 5 | Hard | Minimax | 4 | Iterative deepening, quiescence |
| 6 | Master | MCTS | - | 2000 simulations |
| 7 | Grandmaster | Hybrid | 5+ | MCTS + Minimax verification |

## Type Definition

```typescript
// src/types/game.ts - Extended
export type AIDifficulty = 
  | 'beginner'     // Level 1
  | 'easy'         // Level 2
  | 'medium'       // Level 3
  | 'challenging'  // Level 4
  | 'hard'         // Level 5
  | 'master'       // Level 6
  | 'grandmaster'  // Level 7
```

## Configuration

```typescript
// src/ai/minimax.ts
export const AI_DIFFICULTIES: Record<AIDifficulty, AIConfig> = {
  beginner:    { depth: 0, useRepetitionPenalty: false, randomness: 100 },
  easy:        { depth: 1, useRepetitionPenalty: false, randomness: 30 },
  medium:      { depth: 2, useRepetitionPenalty: true,  randomness: 10 },
  challenging: { depth: 3, useRepetitionPenalty: true,  randomness: 0, useTT: true },
  hard:        { depth: 4, useRepetitionPenalty: true,  randomness: 0, useTT: true, useID: true },
  master:      { depth: 0, useMCTS: true, mctsSimulations: 2000 },
  grandmaster: { depth: 5, useMCTS: true, mctsSimulations: 3000, useHybrid: true }
}
```

## Evaluation Function

The evaluation function calculates board advantage with these weighted components:

| Component | Weight | Description |
|-----------|--------|-------------|
| Material | 100 | Having pieces on board |
| Progress | 50 | Steps closer to goal (per piece) |
| Goal | 2000 | Piece at goal line |
| Almost Win | 10000 | One piece away from winning |
| Blocking | 30 | Blocking opponent's path (level 4+) |
| Mobility | 20 | Available moves (level 5+) |

## Optimization Techniques

### Move Ordering (Level 4+)
Priority order for alpha-beta efficiency:
1. Moves reaching goal
2. Jumps and leaps
3. Forward progress moves
4. Other moves

### Transposition Table (Level 4+)
- Zobrist hashing for board state
- Store: depth, score, best move, flag (exact/lower/upper)
- Size: 2^18 entries (~1MB)

### Iterative Deepening (Level 5+)
- Start at depth 1, increase until time limit
- Use previous iteration's best move first
- Default time: 3 seconds

### MCTS (Level 6-7)
- UCB1 selection: score + C * sqrt(ln(parent.visits) / node.visits)
- C = 1.41 (exploration constant)
- Rollout: use quick evaluation instead of random playout
- Expansion: one child per iteration

## Integration with Store

```typescript
// src/store/slices/aiSlice.ts
performAiMove: async () => {
  const difficulty = state.gameConfig.aiDifficulty[state.currentPlayer]
  
  if (difficulty === 'master' || difficulty === 'grandmaster') {
    // Use MCTS
    bestMove = getMCTSMove(board, currentPlayer, config)
  } else {
    // Use Minimax
    bestMove = getBestMove(board, currentPlayer, config)
  }
}
```

## Performance Targets

| Level | Max Time | Expected NPS |
|-------|----------|--------------|
| 1-3 | < 100ms | N/A |
| 4 | < 500ms | 10,000 |
| 5 | < 3s | 20,000 |
| 6-7 | < 5s | 500 sims/s |

## Testing Strategy

1. **Unit tests**: Each component independently
2. **Integration**: AI vs random baseline
3. **Regression**: Ensure higher levels beat lower levels
4. **Performance**: Time and node count benchmarks

## Implementation Order

1. ✅ Levels 1-3 (existing)
2. ⬜ Extend types for 7 levels
3. ⬜ Level 4: Move ordering + TT
4. ⬜ Level 5: Iterative deepening
5. ⬜ Level 6: MCTS
6. ⬜ Level 7: Hybrid
7. ⬜ UI updates for level selection

