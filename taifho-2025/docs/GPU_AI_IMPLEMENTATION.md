# GPU-Accelerated AI Implementation Plan

## Overview

This document outlines the implementation plan for GPU-accelerated game AI using TensorFlow.js in the Taifho game. The goal is to achieve 10-100x performance improvement over the current CPU-based minimax/MCTS implementation.

## Technology Choice: TensorFlow.js

### Why TensorFlow.js?

| Feature | TensorFlow.js | Pure WebGPU | gpu.js |
|---------|---------------|-------------|--------|
| Browser Support | ~100% | ~85% | ~95% |
| Firefox Support | ✅ WebGL fallback | ❌ Disabled | ✅ WebGL |
| Auto Fallback | ✅ WebGPU→WebGL→WASM→CPU | ❌ None | ✅ GPU→CPU |
| Neural Networks | ✅ Full support | ❌ Manual | ❌ Basic |
| Documentation | ✅ Excellent | ⚠️ Limited | ⚠️ Medium |
| Community | ✅ Large (Google) | ⚠️ Small | ⚠️ Medium |
| Model Conversion | ✅ Keras/SavedModel | ❌ N/A | ❌ N/A |

### Browser Compatibility (2025)

| Browser | Backend | Support |
|---------|---------|---------|
| Chrome 113+ | WebGPU | ✅ Full |
| Edge 113+ | WebGPU | ✅ Full |
| Safari 26+ | WebGPU | ⚠️ Partial |
| Firefox 147+ | WebGL | ✅ Fallback |
| Opera 99+ | WebGPU | ✅ Full |
| Safari iOS 26+ | WebGPU | ✅ Full |
| Chrome Android | WebGPU | ✅ Full |

### TensorFlow.js Backends Comparison

Based on official TensorFlow.js documentation:

| Backend | Speed | Best For | Notes |
|---------|-------|----------|-------|
| **WebGPU** | Fastest | Modern browsers | Chrome 113+, requires GPU |
| **WebGL** | Fast | Most browsers | 100x faster than CPU |
| **WASM** | Medium | Small models | Good for BlazeFace-size models |
| **CPU** | Slowest | Fallback | Always available |

> **Note:** WASM can outperform WebGL for small models (<5MB) due to fixed overhead costs of WebGL shader execution.

---

## Architecture

### AlphaZero-Style Neural Network

```
┌─────────────────────────────────────────────────────────────────┐
│                    TAIFHO AI ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐                                               │
│  │    Board     │  10x10x12 tensor                              │
│  │    State     │  (position + piece type + color channels)     │
│  └──────┬───────┘                                               │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Convolutional Neural Network                 │   │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐         │   │
│  │  │ Conv2D │→ │ Conv2D │→ │ Conv2D │→ │ Conv2D │         │   │
│  │  │ 64 ch  │  │ 128 ch │  │ 128 ch │  │ 128 ch │         │   │
│  │  └────────┘  └────────┘  └────────┘  └────────┘         │   │
│  └──────────────────────┬───────────────────────────────────┘   │
│                         │                                        │
│         ┌───────────────┴───────────────┐                       │
│         ▼                               ▼                        │
│  ┌──────────────┐                ┌──────────────┐               │
│  │ Policy Head  │                │  Value Head  │               │
│  │              │                │              │               │
│  │ Conv2D → FC  │                │ Conv2D → FC  │               │
│  │              │                │              │               │
│  │ Output: 1000 │                │ Output: 1    │               │
│  │ (move probs) │                │ (win prob)   │               │
│  └──────────────┘                └──────────────┘               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Input Encoding

```typescript
// Board representation: 10x10x12 tensor
// Channels:
//   0-3:  Current player pieces (circle, square, triangle, diamond)
//   4-7:  Opponent pieces (circle, square, triangle, diamond)
//   8:    Current player's goal line
//   9:    Opponent's goal line
//   10:   Pieces at goal (current player)
//   11:   Pieces at goal (opponent)

const boardToInput = (board: (Piece | null)[][], currentPlayer: PlayerColor): number[][][] => {
  const input = Array(10).fill(null).map(() => 
    Array(10).fill(null).map(() => 
      Array(12).fill(0)
    )
  );
  
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const piece = board[y][x];
      if (piece) {
        const isCurrentPlayer = piece.color === currentPlayer;
        const typeIndex = ['circle', 'square', 'triangle', 'diamond'].indexOf(piece.type);
        const channelOffset = isCurrentPlayer ? 0 : 4;
        input[y][x][channelOffset + typeIndex] = 1;
      }
    }
  }
  
  // Add goal line channels, etc.
  return input;
};
```

### Output Encoding

```typescript
// Policy output: 1000 values (10x10 from positions × 10 possible moves each)
// Simplified: 100 from-squares × ~10 legal moves per square

// Value output: Single value [-1, 1]
// -1 = certain loss
//  0 = draw/uncertain
// +1 = certain win
```

---

## Implementation Phases

### Phase 1: Data Collection (Week 1-2)

**Goal:** Generate training data from self-play games

```typescript
// scripts/generateTrainingData.ts
import { getBestMove, AI_DIFFICULTIES } from '../src/ai';
import { createInitialBoard } from '../src/utils/boardUtils';

interface TrainingExample {
  board: number[][][];        // Input tensor
  policy: number[];           // Move probabilities from MCTS
  value: number;              // Game outcome (-1, 0, 1)
}

const generateGames = async (numGames: number): Promise<TrainingExample[]> => {
  const examples: TrainingExample[] = [];
  
  for (let i = 0; i < numGames; i++) {
    const gameExamples = await playGame();
    examples.push(...gameExamples);
    
    if (i % 100 === 0) {
      console.log(`Generated ${i}/${numGames} games`);
      // Save intermediate results
      await saveToFile(`training_data_${i}.json`, examples);
    }
  }
  
  return examples;
};

const playGame = async (): Promise<TrainingExample[]> => {
  let board = createInitialBoard('2player');
  let currentPlayer: PlayerColor = 'red';
  const history: { board: (Piece | null)[][], player: PlayerColor, move: Move }[] = [];
  
  while (!checkWinner(board)) {
    // Use current best AI (challenging/hard) to generate moves
    const move = getBestMove(board, currentPlayer, AI_DIFFICULTIES.hard);
    if (!move) break;
    
    history.push({ 
      board: board.map(row => [...row]), 
      player: currentPlayer, 
      move 
    });
    
    board = simulateMove(board, move);
    currentPlayer = currentPlayer === 'red' ? 'blue' : 'red';
  }
  
  const winner = checkWinner(board);
  
  // Convert to training examples
  return history.map(({ board, player, move }) => ({
    board: boardToInput(board, player),
    policy: moveToPolicy(move, board, player),
    value: winner === player ? 1 : winner === null ? 0 : -1
  }));
};
```

**Output:** `training_data.json` (~10,000+ games, ~500,000+ positions)

**Recommended:** Use Node.js with `tfjs-node` for faster data generation:
```bash
npx ts-node scripts/generateTrainingData.ts
```

### Phase 2: Model Training (Week 2-3)

**Goal:** Train neural network in Python/TensorFlow

```python
# training/train_model.py
import tensorflow as tf
import json
import numpy as np
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, TensorBoard

# Load training data
print("Loading training data...")
with open('training_data.json', 'r') as f:
    data = json.load(f)

boards = np.array([ex['board'] for ex in data], dtype=np.float32)
policies = np.array([ex['policy'] for ex in data], dtype=np.float32)
values = np.array([ex['value'] for ex in data], dtype=np.float32)

print(f"Loaded {len(boards)} positions")

# Build model with residual blocks
def residual_block(x, filters):
    """Standard residual block as used in AlphaZero"""
    residual = x
    x = tf.keras.layers.Conv2D(filters, 3, padding='same')(x)
    x = tf.keras.layers.BatchNormalization()(x)
    x = tf.keras.layers.Activation('relu')(x)
    x = tf.keras.layers.Conv2D(filters, 3, padding='same')(x)
    x = tf.keras.layers.BatchNormalization()(x)
    x = tf.keras.layers.Add()([x, residual])
    x = tf.keras.layers.Activation('relu')(x)
    return x

def build_model(num_residual_blocks=4, filters=128):
    inputs = tf.keras.Input(shape=(10, 10, 12), name='board_input')
    
    # Initial convolution
    x = tf.keras.layers.Conv2D(filters, 3, padding='same')(inputs)
    x = tf.keras.layers.BatchNormalization()(x)
    x = tf.keras.layers.Activation('relu')(x)
    
    # Residual tower
    for _ in range(num_residual_blocks):
        x = residual_block(x, filters)
    
    # Policy head
    policy = tf.keras.layers.Conv2D(2, 1)(x)
    policy = tf.keras.layers.BatchNormalization()(policy)
    policy = tf.keras.layers.Activation('relu')(policy)
    policy = tf.keras.layers.Flatten()(policy)
    policy = tf.keras.layers.Dense(1000, activation='softmax', name='policy')(policy)
    
    # Value head
    value = tf.keras.layers.Conv2D(1, 1)(x)
    value = tf.keras.layers.BatchNormalization()(value)
    value = tf.keras.layers.Activation('relu')(value)
    value = tf.keras.layers.Flatten()(value)
    value = tf.keras.layers.Dense(64, activation='relu')(value)
    value = tf.keras.layers.Dense(1, activation='tanh', name='value')(value)
    
    return tf.keras.Model(inputs, [policy, value])

# Build and compile
model = build_model(num_residual_blocks=4, filters=128)
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss={
        'policy': 'categorical_crossentropy',
        'value': 'mse'
    },
    loss_weights={'policy': 1.0, 'value': 1.0},
    metrics={
        'policy': 'categorical_accuracy',
        'value': 'mae'
    }
)

model.summary()

# Callbacks
callbacks = [
    EarlyStopping(patience=10, restore_best_weights=True),
    ModelCheckpoint('checkpoints/model_{epoch:02d}.keras', save_best_only=True),
    TensorBoard(log_dir='./logs')
]

# Train with validation
history = model.fit(
    boards,
    {'policy': policies, 'value': values},
    epochs=100,
    batch_size=256,
    validation_split=0.1,
    callbacks=callbacks
)

# Save final model
model.save('taifho_model.keras')

# Export for TensorFlow.js
import tensorflowjs as tfjs
print("Converting to TensorFlow.js format...")
tfjs.converters.save_keras_model(model, 'models/taifho-v1')
print("✅ Model exported to models/taifho-v1/")
```

**Alternative: Direct Python API export (recommended)**

```python
# More reliable export method
import tensorflowjs as tfjs

def train_and_export():
    model = build_model()
    # ... training code ...
    
    # Export directly after training
    tfjs.converters.save_keras_model(model, 'models/taifho-v1')
```

**Output:** `models/taifho-v1/` (model.json + weight files, ~5-20MB)

### Phase 3: Browser Integration (Week 3-4)

**Goal:** Load and use model in browser

> ⚠️ **Critical TensorFlow.js Notes:**
> 1. Use `tf.tidy()` for automatic memory management
> 2. Always call `tensor.dispose()` for manually created tensors
> 3. Use async `data()` and `array()` methods to avoid blocking UI
> 4. Warm up model before real inference for better performance

```typescript
// src/ai/neuralNetwork.ts
import * as tf from '@tensorflow/tfjs';
// Import WebGPU backend separately if needed
// import '@tensorflow/tfjs-backend-webgpu';

let model: tf.LayersModel | null = null;
let backend: string = 'cpu';
let isWarmedUp = false;

/**
 * Initialize TensorFlow.js with best available backend
 * Priority: WebGPU → WebGL → WASM → CPU
 */
export const initNeuralAI = async (): Promise<{ backend: string; ready: boolean }> => {
  // Try backends in order of preference
  const backends = ['webgpu', 'webgl', 'wasm', 'cpu'];
  
  for (const backendName of backends) {
    try {
      await tf.setBackend(backendName);
      await tf.ready();
      backend = backendName;
      console.log(`✅ TensorFlow.js initialized with backend: ${backend}`);
      break;
    } catch (e) {
      console.log(`⚠️ Backend ${backendName} not available, trying next...`);
    }
  }
  
  // Load model
  try {
    model = await tf.loadLayersModel('/models/taifho-v1/model.json');
    console.log('✅ Neural network model loaded');
    
    // Warmup: Run dummy inference to compile shaders
    await warmupModel();
    
    return { backend, ready: true };
  } catch (error) {
    console.error('❌ Failed to load model:', error);
    return { backend, ready: false };
  }
};

/**
 * Warmup model with dummy inference
 * This compiles WebGL/WebGPU shaders and caches them
 */
const warmupModel = async (): Promise<void> => {
  if (!model || isWarmedUp) return;
  
  console.log('🔥 Warming up model...');
  const dummyInput = tf.zeros([1, 10, 10, 12]);
  
  // Run inference and wait for completion
  const result = model.predict(dummyInput) as tf.Tensor[];
  await Promise.all(result.map(t => t.data()));
  
  // Cleanup
  dummyInput.dispose();
  result.forEach(t => t.dispose());
  
  isWarmedUp = true;
  console.log('✅ Model warmed up');
};

/**
 * Evaluate a single board position
 * Uses tf.tidy() for automatic memory management
 */
export const evaluatePosition = async (
  board: (Piece | null)[][],
  currentPlayer: PlayerColor
): Promise<{ policy: number[]; value: number }> => {
  if (!model) {
    throw new Error('Model not initialized. Call initNeuralAI() first.');
  }
  
  // Use tf.tidy for automatic cleanup of intermediate tensors
  const { policyData, valueData } = tf.tidy(() => {
    const input = tf.tensor4d([boardToInput(board, currentPlayer)], [1, 10, 10, 12]);
    const [policyTensor, valueTensor] = model!.predict(input) as tf.Tensor[];
    
    return {
      policyData: policyTensor,
      valueData: valueTensor
    };
  });
  
  // Use async data() to avoid blocking UI thread
  const policy = Array.from(await policyData.data());
  const value = (await valueData.data())[0];
  
  // Cleanup output tensors
  policyData.dispose();
  valueData.dispose();
  
  return { policy, value };
};

/**
 * Batch evaluate multiple positions (GPU-efficient)
 * Much faster than evaluating one at a time
 */
export const evaluatePositionsBatch = async (
  positions: { board: (Piece | null)[][]; player: PlayerColor }[]
): Promise<{ policy: number[][]; value: number[] }> => {
  if (!model) {
    throw new Error('Model not initialized');
  }
  
  const batchSize = positions.length;
  
  // Build input tensor
  const inputs = positions.map(p => boardToInput(p.board, p.player));
  const inputTensor = tf.tensor4d(inputs, [batchSize, 10, 10, 12]);
  
  // Run batch inference
  const [policyTensor, valueTensor] = model.predict(inputTensor) as tf.Tensor[];
  
  // Get results asynchronously
  const policyData = await policyTensor.array() as number[][];
  const valueData = await valueTensor.array() as number[];
  
  // Cleanup
  inputTensor.dispose();
  policyTensor.dispose();
  valueTensor.dispose();
  
  return { policy: policyData, value: valueData };
};

/**
 * Get current backend info and memory stats
 */
export const getBackendInfo = (): { 
  backend: string; 
  isGPU: boolean;
  memoryInfo: tf.MemoryInfo;
} => {
  return {
    backend,
    isGPU: backend === 'webgpu' || backend === 'webgl',
    memoryInfo: tf.memory()
  };
};

/**
 * Clean up GPU memory (call when switching games/resetting)
 */
export const cleanupMemory = (): void => {
  // Dispose all tracked tensors
  tf.disposeVariables();
  console.log('🧹 GPU memory cleaned');
};
```

### Phase 4: MCTS Integration (Week 4)

**Goal:** Replace heuristic evaluation with neural network

```typescript
// src/ai/neuralMCTS.ts
import * as tf from '@tensorflow/tfjs';
import { evaluatePosition, evaluatePositionsBatch } from './neuralNetwork';
import { getAllLegalMoves } from './moveGenerator';
import { simulateMove } from './minimax';

interface NeuralMCTSNode {
  board: (Piece | null)[][];
  player: PlayerColor;
  move: Move | null;
  parent: NeuralMCTSNode | null;
  children: NeuralMCTSNode[];
  visits: number;
  totalValue: number;
  prior: number;  // Policy prior from neural network
}

const C_PUCT = 1.5;  // Exploration constant (tune this!)

// Dirichlet noise for root exploration (as in AlphaZero)
const DIRICHLET_ALPHA = 0.3;
const DIRICHLET_WEIGHT = 0.25;

/**
 * Neural MCTS search with batch evaluation for GPU efficiency
 */
export const neuralMCTSSearch = async (
  board: (Piece | null)[][],
  currentPlayer: PlayerColor,
  simulations: number = 800,
  addNoise: boolean = true  // Add exploration noise at root
): Promise<Move | null> => {
  // Get initial policy and value from neural network
  const { policy, value } = await evaluatePosition(board, currentPlayer);
  
  const root = createNode(board, currentPlayer, null, null, 1.0);
  
  // Expand root with policy priors
  expandWithPolicy(root, policy);
  
  // Add Dirichlet noise for exploration (during training/self-play)
  if (addNoise && root.children.length > 0) {
    const noise = dirichletNoise(root.children.length, DIRICHLET_ALPHA);
    root.children.forEach((child, i) => {
      child.prior = (1 - DIRICHLET_WEIGHT) * child.prior + DIRICHLET_WEIGHT * noise[i];
    });
  }
  
  // Batch evaluation buffer for GPU efficiency
  const BATCH_SIZE = 8;
  let pendingNodes: NeuralMCTSNode[] = [];
  
  for (let i = 0; i < simulations; i++) {
    let node = root;
    
    // Selection: Use PUCT formula
    while (node.children.length > 0) {
      node = selectChildPUCT(node);
    }
    
    // Collect nodes for batch evaluation
    pendingNodes.push(node);
    
    // Process batch when full or at end
    if (pendingNodes.length >= BATCH_SIZE || i === simulations - 1) {
      await processBatch(pendingNodes);
      pendingNodes = [];
    }
  }
  
  // Select best move (most visited for play, highest value for analysis)
  let bestChild = root.children[0];
  for (const child of root.children) {
    if (child.visits > bestChild.visits) {
      bestChild = child;
    }
  }
  
  // Log search statistics
  console.log(`MCTS: ${simulations} sims, best move visits: ${bestChild.visits}, Q: ${(bestChild.totalValue / bestChild.visits).toFixed(3)}`);
  
  return bestChild?.move ?? null;
};

/**
 * Process batch of leaf nodes with neural network
 */
const processBatch = async (nodes: NeuralMCTSNode[]): Promise<void> => {
  if (nodes.length === 0) return;
  
  // Batch evaluate all positions
  const positions = nodes.map(n => ({ board: n.board, player: n.player }));
  const { policy, value } = await evaluatePositionsBatch(positions);
  
  // Expand and backpropagate each node
  nodes.forEach((node, i) => {
    if (node.visits === 0) {
      expandWithPolicy(node, policy[i]);
    }
    backpropagate(node, value[i]);
  });
};

/**
 * PUCT selection formula (as used in AlphaZero)
 */
const selectChildPUCT = (node: NeuralMCTSNode): NeuralMCTSNode => {
  let bestChild = node.children[0];
  let bestValue = -Infinity;
  
  const sqrtParentVisits = Math.sqrt(node.visits);
  
  for (const child of node.children) {
    const q = child.visits > 0 ? child.totalValue / child.visits : 0;
    const u = C_PUCT * child.prior * sqrtParentVisits / (1 + child.visits);
    const puctValue = q + u;
    
    if (puctValue > bestValue) {
      bestValue = puctValue;
      bestChild = child;
    }
  }
  
  return bestChild;
};

/**
 * Expand node with policy priors from neural network
 */
const expandWithPolicy = (node: NeuralMCTSNode, policy: number[]): void => {
  const moves = getAllLegalMoves(node.board, node.player);
  
  // Normalize priors over legal moves only
  let priorSum = 0;
  const movePriors: { move: Move; prior: number }[] = [];
  
  for (const move of moves) {
    const policyIndex = moveToIndex(move);
    const prior = policy[policyIndex];
    priorSum += prior;
    movePriors.push({ move, prior });
  }
  
  // Create children with normalized priors
  for (const { move, prior } of movePriors) {
    const normalizedPrior = priorSum > 0 ? prior / priorSum : 1 / moves.length;
    
    const newBoard = simulateMove(node.board, move);
    const nextPlayer = getNextPlayer(node.player, newBoard);
    
    const child = createNode(newBoard, nextPlayer, move, node, normalizedPrior);
    node.children.push(child);
  }
};

/**
 * Backpropagate value through tree
 */
const backpropagate = (node: NeuralMCTSNode, value: number): void => {
  let current: NeuralMCTSNode | null = node;
  let sign = 1;
  
  while (current !== null) {
    current.visits++;
    current.totalValue += sign * value;
    sign *= -1;  // Alternate sign for minimax backup
    current = current.parent;
  }
};

/**
 * Create MCTS node
 */
const createNode = (
  board: (Piece | null)[][],
  player: PlayerColor,
  move: Move | null,
  parent: NeuralMCTSNode | null,
  prior: number
): NeuralMCTSNode => ({
  board,
  player,
  move,
  parent,
  children: [],
  visits: 0,
  totalValue: 0,
  prior
});

/**
 * Generate Dirichlet noise for root exploration
 */
const dirichletNoise = (n: number, alpha: number): number[] => {
  // Gamma distribution approximation
  const samples = Array(n).fill(0).map(() => {
    let sum = 0;
    for (let i = 0; i < Math.ceil(alpha); i++) {
      sum -= Math.log(Math.random());
    }
    return sum;
  });
  
  const total = samples.reduce((a, b) => a + b, 0);
  return samples.map(s => s / total);
};
```

### Phase 5: UI Integration (Week 4-5)

**Goal:** Add GPU indicator and neural AI option

```typescript
// src/store/slices/aiSlice.ts
import { initNeuralAI, getBackendInfo, cleanupMemory } from '../../ai/neuralNetwork';
import { neuralMCTSSearch } from '../../ai/neuralMCTS';

interface NeuralAIState {
  isNeuralReady: boolean;
  isNeuralLoading: boolean;
  gpuBackend: string;
  isGPU: boolean;
  loadingProgress: number;
  memoryUsage: number;
}

export const initializeNeuralAI = async (
  onProgress?: (progress: number) => void
): Promise<NeuralAIState> => {
  onProgress?.(10);
  
  const { backend, ready } = await initNeuralAI();
  onProgress?.(100);
  
  const { isGPU, memoryInfo } = getBackendInfo();
  
  return {
    isNeuralReady: ready,
    isNeuralLoading: false,
    gpuBackend: backend,
    isGPU,
    loadingProgress: 100,
    memoryUsage: memoryInfo.numBytes / (1024 * 1024) // MB
  };
};

// Add new difficulty level
export const AI_DIFFICULTIES = {
  // ... existing levels ...
  neural: { 
    depth: 0, 
    useNeuralNetwork: true, 
    mctsSimulations: 800,
    displayName: '🧠 Neural',
    description: 'GPU-accelerated neural network AI'
  }
};
```

```tsx
// src/components/GPUIndicator.tsx
import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import * as tf from '@tensorflow/tfjs';

export const GPUIndicator: React.FC = () => {
  const { gpuBackend, isGPU, isNeuralReady } = useGameStore();
  const [memoryMB, setMemoryMB] = useState(0);
  
  useEffect(() => {
    // Update memory usage periodically
    const interval = setInterval(() => {
      const memory = tf.memory();
      setMemoryMB(Math.round(memory.numBytes / (1024 * 1024)));
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (!isNeuralReady) return null;
  
  const backendEmoji = {
    'webgpu': '🚀',
    'webgl': '⚡',
    'wasm': '🔧',
    'cpu': '💻'
  }[gpuBackend] || '❓';
  
  return (
    <div className={`gpu-indicator ${isGPU ? 'gpu-active' : 'cpu-fallback'}`}>
      {backendEmoji} {gpuBackend.toUpperCase()} | {memoryMB}MB
    </div>
  );
};
```

```css
/* src/components/GPUIndicator.css */
.gpu-indicator {
  position: fixed;
  bottom: 10px;
  right: 10px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  font-family: monospace;
  z-index: 1000;
}

.gpu-indicator.gpu-active {
  background: linear-gradient(135deg, #00ff88, #00ccff);
  color: #000;
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

.gpu-indicator.cpu-fallback {
  background: #444;
  color: #fff;
}
```

---

## Performance Expectations

| Metric | Current (CPU) | Neural (GPU) | Improvement |
|--------|---------------|--------------|-------------|
| Evaluations/sec | ~50,000 | ~500,000 | **10x** |
| MCTS simulations | 2,000 | 10,000+ | **5x** |
| Move quality | Good | Excellent | **Significant** |
| Latency (per move) | 30-50ms | 50-100ms | Similar |
| Memory usage | ~50MB | ~100-200MB | 2-4x |
| First inference | instant | 200-500ms | Warmup needed |

### Mobile Performance Notes

- **16-bit precision:** Mobile WebGL may only support 16-bit floats
- **Check:** `tf.ENV.getBool('WEBGL_RENDER_FLOAT32_CAPABLE')`
- **Range:** 16-bit floats only represent `[0.000000059605, 65504]`
- **Solution:** Use batch normalization to keep activations in safe range

---

## File Structure

```
taifho-2025/
├── models/
│   └── taifho-v1/
│       ├── model.json              # Topology + weight manifest
│       └── group1-shard1of1.bin    # Weight data (sharded for caching)
├── scripts/
│   ├── generateTrainingData.ts     # Self-play data generation
│   └── convertModel.py             # Keras → TF.js converter
├── training/
│   ├── train_model.py              # Python training script
│   ├── requirements.txt            # Python dependencies
│   ├── training_data.json          # Generated training data
│   └── checkpoints/                # Training checkpoints
├── src/
│   └── ai/
│       ├── neuralNetwork.ts        # TF.js wrapper with memory management
│       ├── neuralMCTS.ts           # Neural MCTS with batch evaluation
│       ├── boardEncoder.ts         # Board → tensor conversion
│       └── index.ts                # Exports
├── public/
│   └── models/                     # Served model files
│       └── taifho-v1/
└── docs/
    └── GPU_AI_IMPLEMENTATION.md    # This file
```

---

## Dependencies

### Browser (package.json)

```json
{
  "dependencies": {
    "@tensorflow/tfjs": "^4.22.0"
  },
  "optionalDependencies": {
    "@tensorflow/tfjs-backend-webgpu": "^4.22.0"
  }
}
```

> **Note:** WebGPU backend is optional - TF.js will fall back to WebGL automatically.

### Training (requirements.txt)

```
tensorflow>=2.15.0
tensorflowjs>=4.17.0
numpy>=1.24.0
matplotlib>=3.7.0      # For training visualization
scikit-learn>=1.3.0    # For data splitting
```

---

## Model Conversion Notes

### From Keras to TensorFlow.js

```bash
# Method 1: Command line
tensorflowjs_converter --input_format keras \
    path/to/model.keras \
    path/to/tfjs_model/

# Method 2: Python API (recommended)
import tensorflowjs as tfjs
tfjs.converters.save_keras_model(model, 'tfjs_model/')
```

### Supported Layers

TensorFlow.js supports most standard Keras layers:
- ✅ Conv2D, Dense, Flatten, BatchNormalization
- ✅ Add, Activation, Dropout
- ⚠️ Lambda layers - **NOT SUPPORTED** (use custom ops instead)
- ⚠️ Custom layers - must be re-implemented in JS

### Quantization (for smaller models)

```bash
tensorflowjs_converter --input_format keras \
    --quantize_float16 \
    model.keras tfjs_model_quantized/
```

Reduces model size by ~50% with minimal accuracy loss.

---

## Model Storage Options

### IndexedDB (Recommended for persistence)

```typescript
// Save model locally
await model.save('indexeddb://taifho-model');

// Load from IndexedDB
const model = await tf.loadLayersModel('indexeddb://taifho-model');
```

### LocalStorage (Small models only, <5MB)

```typescript
await model.save('localstorage://taifho-model');
```

### File Download (Export to user)

```typescript
await model.save('downloads://my-taifho-model');
```

---

## Fallback Strategy

```
┌─────────────────────────────────────────────────────────┐
│                   AI SELECTION LOGIC                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  User selects "Neural" difficulty                        │
│         │                                                │
│         ▼                                                │
│  ┌──────────────┐                                       │
│  │ Neural model │──No──▶ Fall back to "Master" (MCTS)   │
│  │   loaded?    │                                       │
│  └──────┬───────┘                                       │
│         │ Yes                                            │
│         ▼                                                │
│  ┌──────────────┐                                       │
│  │ WebGPU       │──No──┐                                │
│  │ available?   │      │                                │
│  └──────┬───────┘      │                                │
│         │ Yes          ▼                                │
│         │      ┌──────────────┐                         │
│         │      │ WebGL        │──No──┐                  │
│         │      │ available?   │      │                  │
│         │      └──────┬───────┘      │                  │
│         │             │ Yes          ▼                  │
│         │             │      ┌──────────────┐           │
│         │             │      │ WASM backend │           │
│         │             │      └──────┬───────┘           │
│         ▼             ▼             ▼                   │
│      WebGPU       WebGL          WASM                  │
│      (fastest)    (fast)         (medium)              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Common Issues & Solutions

### Issue: Model loads slowly

**Solution:** Use model sharding and caching
```typescript
// TF.js automatically caches model.json and weights
// Browser caches files up to ~50MB
// Use IndexedDB for persistent storage
```

### Issue: Memory leak

**Solution:** Use `tf.tidy()` and `dispose()`
```typescript
// Always clean up tensors
const result = tf.tidy(() => {
  const a = tf.tensor([1, 2, 3]);
  const b = a.square();
  return b;  // Only 'b' survives
});
result.dispose();  // Clean up result when done
```

### Issue: Slow first inference

**Solution:** Warm up the model
```typescript
// Run dummy inference on startup
const warmup = model.predict(tf.zeros([1, 10, 10, 12]));
await warmup.data();
warmup.dispose();
```

### Issue: Different results on different devices

**Solution:** Check precision support
```typescript
const has32bit = tf.ENV.getBool('WEBGL_RENDER_FLOAT32_CAPABLE');
if (!has32bit) {
  console.warn('Device only supports 16-bit floats');
}
```

---

## Timeline Summary

| Week | Phase | Deliverable |
|------|-------|-------------|
| 1-2 | Data Collection | 10,000+ self-play games |
| 2-3 | Model Training | Trained TF model (~10MB) |
| 3-4 | Browser Integration | TF.js loading & inference |
| 4 | MCTS Integration | Neural MCTS working |
| 4-5 | UI Integration | GPU indicator, new difficulty |
| 5+ | Iteration | Self-play improvement loop |

---

## Self-Play Training Loop (Advanced)

After initial deployment, improve the model iteratively:

```
┌─────────────────────────────────────────────────────────┐
│              SELF-PLAY IMPROVEMENT LOOP                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Generate games with current best model               │
│         │                                                │
│         ▼                                                │
│  2. Train new model on combined data                     │
│         │                                                │
│         ▼                                                │
│  3. Tournament: New model vs Current best                │
│         │                                                │
│         ▼                                                │
│  4. If new model wins >55%: Replace best model           │
│         │                                                │
│         └────────────────────────────────────────┐       │
│                                                  │       │
│  ◄───────────────────────────────────────────────┘       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## References

- [TensorFlow.js Guide](https://www.tensorflow.org/js/guide)
- [TensorFlow.js Platform & Environment](https://www.tensorflow.org/js/guide/platform_environment)
- [Save and Load Models](https://www.tensorflow.org/js/guide/save_load)
- [Import Keras Models](https://www.tensorflow.org/js/tutorials/conversion/import_keras)
- [WebGPU API](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API)
- [AlphaZero Paper](https://arxiv.org/abs/1712.01815)
- [Leela Chess Zero](https://lczero.org/) - Open source AlphaZero implementation
