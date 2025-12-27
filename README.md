# Taifho Game

A digital implementation of **Taifho**, a classic Finnish abstract strategy board game originally published by Alga.

## Project History

### Original Version (2023)

This project was originally created in **April 2023** as a **pair programming experiment with GPT-4**. The original version explored how AI could assist in game development through manual, conversational coding. The development process involved:

- Scanning and transcribing game rules from the original Alga board game
- Iterative development with GPT-4 through chat-based prompts
- Learning TypeScript and React concepts along the way
- Overcoming challenges like type errors and component structure

The original version successfully implemented:
- Basic game board and piece rendering
- Piece movement mechanics
- Starting positions for 2 players

![Original Game Board](https://user-images.githubusercontent.com/6028261/235624526-dd86d887-da69-428a-8d5f-70baf897cf70.png)

### New Version (2025) - Agentic AI Development

In **December 2025**, I revisited the project and created a complete remake using **agentic AI development** with [Antigravity](https://antigravity.dev) and [Cursor](https://cursor.com). This new approach demonstrated the significant evolution in AI-assisted development:

- **Development Time**: Complete reimplementation took approximately **2 hours** (vs. multiple days with manual GPT-4 chat)
- **AI Models Used**: 
  - Gemini 3.0 Pro
  - Claude Opus 4.5 Thinking
- **Development Approach**: Agentic AI with autonomous code generation and iteration
- **Result**: Full-featured game with AI opponents, multiple game modes, and modern architecture

## 🎮 New Version: [taifho-2025](./taifho-2025/)

**👉 [Go to the new version README](./taifho-2025/README.md)**

The new version includes:
- ✅ Complete game rules implementation (all piece types, jumps, leaps)
- ✅ AI opponent with configurable difficulty levels
- ✅ AI vs AI spectator mode
- ✅ 2-player and 4-player support
- ✅ Per-player AI difficulty settings
- ✅ Move history and replay
- ✅ Modern tech stack (React 19, Vite, Zustand, TypeScript)
- ✅ Comprehensive test suite
- ✅ Cursor IDE rules for code quality

## Getting Started

### New Version (Recommended)

```bash
cd taifho-2025
npm install
npm run dev
```

See [taifho-2025/README.md](./taifho-2025/README.md) for full documentation.

### Original Version (Legacy)

The original version is preserved in the root directory for historical reference. It uses Create React App and older React patterns.

```bash
npm install
npm start
```

## Development Story

This project showcases the evolution of AI-assisted development:

1. **2023**: Manual pair programming with GPT-4 through chat interface
   - Conversational, iterative development
   - Learning and debugging together
   - ~6+ hours of development time

2. **2025**: Agentic AI development with Antigravity and Cursor
   - Autonomous code generation
   - Multi-model AI collaboration (Gemini + Claude)
   - ~2 hours for complete reimplementation
   - Production-ready code quality

The dramatic improvement in development speed and code quality demonstrates how agentic AI tools are transforming software development workflows.

## License

MIT
