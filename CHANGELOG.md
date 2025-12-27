# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- AI architecture documentation (`docs/AI_ARCHITECTURE.md`)
- Modular 7-level AI system (design phase)

### Planned - AI Levels
- [ ] **Level 1**: Random AI - Random legal move selection
- [ ] **Level 2**: Greedy AI - Greedy with evaluation
- [ ] **Level 3**: Minimax AI - Alpha-Beta pruning
- [ ] **Level 4**: Tactical AI - Transposition Table + Move Ordering
- [ ] **Level 5**: Strategic AI - Iterative Deepening + Quiescence
- [ ] **Level 6**: MCTS AI - Monte Carlo Tree Search
- [ ] **Level 7**: Master AI - Hybrid MCTS + NN (optional)

---

## [0.2.0] - 2024-12-27

### Changed
- Migrated from Create React App to Vite
- Updated build configuration

### Removed
- Removed CRA-specific files (`react-app-env.d.ts`, `reportWebVitals.ts`)

---

## [0.1.0] - 2024-12-XX

### Added
- Initial Taifho game implementation
- Game board (10x10)
- Four piece types: Square, Diamond, Triangle, Circle
- Basic movement rules for each piece type
- Jump mechanics (single jumps)
- Two-player local play
- Game rules documentation (`docs/rules.md`)

### Game Rules Implemented
- Square: Orthogonal movement (forward, backward, left, right)
- Diamond: Diagonal movement (all 4 diagonal directions)
- Triangle: Forward diagonal + backward straight
- Circle: All 8 directions (orthogonal + diagonal)

---

## Roadmap

### v0.3.0 - AI Foundation
- Basic AI infrastructure
- Random AI (Level 1)
- Greedy AI (Level 2)

### v0.4.0 - Minimax AI
- Minimax with Alpha-Beta (Level 3)
- Basic evaluation function

### v0.5.0 - Advanced AI
- Tactical AI (Level 4)
- Strategic AI (Level 5)

### v0.6.0 - MCTS
- Monte Carlo Tree Search (Level 6)
- AI vs AI testing framework

### v1.0.0 - Full Release
- All 7 difficulty levels
- Polished UI
- Online multiplayer (possibly)
