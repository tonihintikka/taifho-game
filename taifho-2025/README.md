# Taifho 2025

A digital implementation of **Taifho**, a classic Finnish abstract strategy board game originally published by Alga.

## About the Game

Taifho is a race game where two players compete to move all 8 of their pieces to the opponent's starting row. Each piece type has unique movement rules:

| Piece | Movement |
|-------|----------|
| **Square** ■ | Orthogonal (↑↓←→) |
| **Diamond** ◆ | Diagonal (↗↘↙↖) |
| **Triangle** ▲ | Diagonally forward or straight backward |
| **Circle** ● | All 8 directions |

### Special Moves

- **Jump**: Jump over any adjacent piece to an empty square behind it (distance 2)
- **Chain Jump**: Multiple jumps allowed in one turn (not yet implemented)
- **Leap (Loikka)**: Long symmetric jump with equal empty squares before/after the obstacle
- **Starting Line**: All pieces can move sideways along their starting row

### Win Condition

First player to get all 8 pieces to the opponent's starting row wins.

## Game Modes

| Mode | Description |
|------|-------------|
| **Human vs Human** | Two players on the same device |
| **Human vs AI** | Play against the computer |
| **AI vs AI** | Watch two AIs battle (spectator mode) |

## AI System

The AI uses a **Minimax algorithm with Alpha-Beta pruning** for move selection.

### Difficulty Levels

| Level | Search Depth | Features |
|-------|--------------|----------|
| 🌱 Easy | 1 | 30% randomness for varied play |
| ⚔️ Medium | 2 | Repetition penalty, 10% randomness |
| 🔥 Hard | 3 | Full optimization, no randomness |

### Board Evaluation

The evaluator considers:
- **Material**: Piece count advantage
- **Progress**: Distance traveled toward goal line
- **Goal pieces**: Bonus for pieces that reached the goal
- **Win detection**: Immediate win/loss detection with max scores

### Anti-Oscillation

The AI tracks recent moves and penalizes "reverse moves" to prevent back-and-forth oscillation patterns.

## Architecture

```
src/
├── ai/                    # AI engine
│   ├── minimax.ts         # Minimax with alpha-beta pruning
│   ├── evaluator.ts       # Board evaluation heuristics
│   └── moveGenerator.ts   # Legal move generation
├── components/            # React components
│   ├── Board.tsx          # Game board with drag & drop
│   ├── GameSetup.tsx      # Game configuration modal
│   ├── HelpPanel.tsx      # Rules and help
│   └── MoveLog.tsx        # Move history display
├── store/                 # Zustand state management
│   ├── useGameStore.ts    # Main store
│   └── slices/            # State slices
│       ├── gameSlice.ts   # Game lifecycle
│       ├── moveSlice.ts   # Move handling
│       ├── historySlice.ts# History navigation
│       └── aiSlice.ts     # AI move execution
├── types/
│   └── game.ts            # TypeScript types
└── utils/                 # Game logic utilities
    ├── boardUtils.ts      # Board initialization
    ├── moveValidation.ts  # Move rule validation
    ├── jumpValidation.ts  # Jump/leap validation
    └── winCondition.ts    # Win detection
```

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 7** - Build tool
- **Zustand 5** - State management (slice-based architecture)
- **@dnd-kit** - Drag and drop
- **Vitest** - Testing

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Development Story

This project was originally created **~2 years ago** as a **pair programming experiment with AI**. The original version explored how AI could assist in game development.

In **December 2025**, I revisited the project and did a complete remake using a new **agentic AI approach**. The entire reimplementation took approximately **2 hours** – demonstrating the significant evolution in AI-assisted development.

## License

MIT
