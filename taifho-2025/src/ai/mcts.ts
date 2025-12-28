/**
 * Monte Carlo Tree Search (MCTS)
 * 
 * For master and grandmaster difficulty levels.
 * Uses UCB1 for selection and evaluation-based rollouts.
 * Includes repetition penalty to avoid oscillation.
 */

import type { Piece, Move, PlayerColor } from '../types/game'
import type { MCTSNode, AIConfig } from './types'
import { getAllLegalMoves } from './moveGenerator'
import { evaluateBoard } from './evaluator'
import { simulateMove } from './minimax'
import { getCombinedPenalty, wouldCauseRepetition } from './positionHistory'

// UCB1 exploration constant
const C = 1.41

// Repetition tracking for MCTS
let mctsRecentMoves: string[] = []
const MAX_RECENT_MOVES = 12
const REPETITION_PENALTY_VISITS = 0.3 // Reduce win rate for repeated moves

const hashMove = (move: Move): string => 
  `${move.from.x},${move.from.y}->${move.to.x},${move.to.y}`

const isReverseMove = (move: Move): boolean => {
  const reverseHash = `${move.to.x},${move.to.y}->${move.from.x},${move.from.y}`
  return mctsRecentMoves.includes(reverseHash)
}

const isSameMove = (move: Move): boolean => {
  return mctsRecentMoves.includes(hashMove(move))
}

export const resetMCTSHistory = (): void => {
  mctsRecentMoves = []
}

// Player order for different modes
const PLAYER_ORDER_2P: PlayerColor[] = ['red', 'blue']
const PLAYER_ORDER_4P: PlayerColor[] = ['red', 'green', 'blue', 'yellow']

// Detect player count from board
const detectPlayerCount = (board: (Piece | null)[][]): 2 | 4 => {
  const colors = new Set<PlayerColor>()
  for (const row of board) {
    for (const cell of row) {
      if (cell) colors.add(cell.color)
    }
  }
  return colors.size > 2 ? 4 : 2
}

// Get next player based on board state
const getNextPlayer = (player: PlayerColor, board: (Piece | null)[][]): PlayerColor => {
  const playerCount = detectPlayerCount(board)
  const order = playerCount === 4 ? PLAYER_ORDER_4P : PLAYER_ORDER_2P
  const idx = order.indexOf(player)
  return order[(idx + 1) % order.length]
}

/**
 * Create a new MCTS node
 */
const createNode = (
  board: (Piece | null)[][],
  player: PlayerColor,
  move: Move | null,
  parent: MCTSNode | null
): MCTSNode => {
  const untriedMoves = getAllLegalMoves(board, player)
  return {
    board,
    player,
    move,
    parent,
    children: [],
    visits: 0,
    wins: 0,
    untriedMoves
  }
}

/**
 * Calculate UCB1 value for node selection
 */
const ucb1 = (node: MCTSNode, parentVisits: number): number => {
  if (node.visits === 0) return Infinity
  const exploitation = node.wins / node.visits
  const exploration = C * Math.sqrt(Math.log(parentVisits) / node.visits)
  return exploitation + exploration
}

/**
 * Select best child using UCB1
 */
const selectChild = (node: MCTSNode): MCTSNode => {
  let bestChild = node.children[0]
  let bestValue = -Infinity
  
  for (const child of node.children) {
    const value = ucb1(child, node.visits)
    if (value > bestValue) {
      bestValue = value
      bestChild = child
    }
  }
  
  return bestChild
}

/**
 * Expand node by adding one child
 */
const expand = (node: MCTSNode): MCTSNode => {
  const move = node.untriedMoves.pop()!
  const newBoard = simulateMove(node.board, move)
  const nextPlayer = getNextPlayer(node.player, newBoard)
  
  const child = createNode(newBoard, nextPlayer, move, node)
  node.children.push(child)
  
  return child
}

/**
 * Simulate/rollout using evaluation function
 * (faster and more accurate than random playouts)
 */
const rollout = (board: (Piece | null)[][], currentPlayer: PlayerColor, rootPlayer: PlayerColor): number => {
  // Quick evaluation
  const playerCount = detectPlayerCount(board)
  
  if (playerCount === 4 && currentPlayer !== rootPlayer) {
    // 4P: Evaluate from current player's perspective (Max-N style)
    // Each player wants to maximize their own score
    const playerScore = evaluateBoard(board, currentPlayer)
    const rootScore = evaluateBoard(board, rootPlayer)
    // Mix: 70% own progress, 30% hurting root
    const score = playerScore * 0.7 - rootScore * 0.3
    const normalized = (score + 100000) / 200000
    return Math.max(0, Math.min(1, normalized))
  }
  
  // 2P or root player: evaluate normally
  const score = evaluateBoard(board, rootPlayer)
  const normalized = (score + 100000) / 200000
  return Math.max(0, Math.min(1, normalized))
}

/**
 * Backpropagate result up the tree
 * 
 * For 4-player games:
 * - Result is always from root player's perspective
 * - Only flip when transitioning between root player and opponents
 * - This ensures all opponents work against the root player
 */
const backpropagate = (node: MCTSNode | null, result: number, rootPlayer: PlayerColor, is4Player: boolean): void => {
  let current = node
  
  while (current !== null) {
    current.visits++
    
    if (is4Player) {
      // 4P: Use result directly for root player, inverted for all opponents
      const adjustedResult = (current.player === rootPlayer) ? result : (1 - result)
      current.wins += adjustedResult
    } else {
      // 2P: Traditional flip on each level
      current.wins += result
      result = 1 - result
    }
    
    current = current.parent
  }
}

/**
 * Run MCTS for specified number of simulations
 */
export const mctsSearch = (
  board: (Piece | null)[][],
  currentPlayer: PlayerColor,
  simulations: number
): Move | null => {
  const root = createNode(board, currentPlayer, null, null)
  const is4Player = detectPlayerCount(board) === 4
  
  if (root.untriedMoves.length === 0) return null
  if (root.untriedMoves.length === 1) {
    const onlyMove = root.untriedMoves[0]
    recordMove(onlyMove)
    return onlyMove
  }
  
  for (let i = 0; i < simulations; i++) {
    let node = root
    
    // Selection: traverse tree using UCB1
    while (node.untriedMoves.length === 0 && node.children.length > 0) {
      node = selectChild(node)
    }
    
    // Expansion: add one child if not terminal
    if (node.untriedMoves.length > 0) {
      node = expand(node)
    }
    
    // Simulation: evaluate position (always from root player's perspective)
    const result = rollout(node.board, node.player, currentPlayer)
    
    // Backpropagation: update statistics with 4P-aware logic
    backpropagate(node, result, currentPlayer, is4Player)
  }
  
  // Select best move: use adjusted score (visits * win_rate - repetition_penalty)
  let bestChild: MCTSNode | null = null
  let bestScore = -Infinity
  
  for (const child of root.children) {
    if (!child.move) continue
    
    const winRate = child.visits > 0 ? child.wins / child.visits : 0
    let score = child.visits * winRate
    
    // Apply move-based repetition penalty
    if (isReverseMove(child.move) || isSameMove(child.move)) {
      score *= REPETITION_PENALTY_VISITS
    }
    
    // Apply position history penalty (penalize moves leading to repeated board states)
    const positionPenalty = getCombinedPenalty(child.board, child.player)
    if (positionPenalty > 0) {
      score -= positionPenalty / 1000 // Scale down for MCTS scoring
    }
    
    // Strongly avoid moves that would cause 3-fold repetition
    if (wouldCauseRepetition(child.board, child.player)) {
      score *= 0.1 // 90% penalty
    }
    
    if (score > bestScore) {
      bestScore = score
      bestChild = child
    }
  }
  
  const bestMove = bestChild?.move ?? null
  if (bestMove) {
    recordMove(bestMove)
  }
  
  return bestMove
}

/**
 * Record move for repetition tracking
 */
const recordMove = (move: Move): void => {
  mctsRecentMoves.push(hashMove(move))
  if (mctsRecentMoves.length > MAX_RECENT_MOVES) {
    mctsRecentMoves.shift()
  }
}

/**
 * MCTS with time limit
 */
export const mctsSearchTimed = (
  board: (Piece | null)[][],
  currentPlayer: PlayerColor,
  timeLimit: number
): Move | null => {
  const root = createNode(board, currentPlayer, null, null)
  const is4Player = detectPlayerCount(board) === 4
  
  if (root.untriedMoves.length === 0) return null
  if (root.untriedMoves.length === 1) {
    const onlyMove = root.untriedMoves[0]
    recordMove(onlyMove)
    return onlyMove
  }
  
  const startTime = performance.now()
  let iterations = 0
  
  while (performance.now() - startTime < timeLimit) {
    let node = root
    
    // Selection
    while (node.untriedMoves.length === 0 && node.children.length > 0) {
      node = selectChild(node)
    }
    
    // Expansion
    if (node.untriedMoves.length > 0) {
      node = expand(node)
    }
    
    // Simulation (always from root player's perspective)
    const result = rollout(node.board, node.player, currentPlayer)
    
    // Backpropagation with 4P-aware logic
    backpropagate(node, result, currentPlayer, is4Player)
    
    iterations++
  }
  
  // Select best move with repetition penalty
  let bestChild: MCTSNode | null = null
  let bestScore = -Infinity
  
  for (const child of root.children) {
    if (!child.move) continue
    
    const winRate = child.visits > 0 ? child.wins / child.visits : 0
    let score = child.visits * winRate
    
    // Apply move-based repetition penalty
    if (isReverseMove(child.move) || isSameMove(child.move)) {
      score *= REPETITION_PENALTY_VISITS
    }
    
    // Apply position history penalty (penalize moves leading to repeated board states)
    const positionPenalty = getCombinedPenalty(child.board, child.player)
    if (positionPenalty > 0) {
      score -= positionPenalty / 1000 // Scale down for MCTS scoring
    }
    
    // Strongly avoid moves that would cause 3-fold repetition
    if (wouldCauseRepetition(child.board, child.player)) {
      score *= 0.1 // 90% penalty
    }
    
    if (score > bestScore) {
      bestScore = score
      bestChild = child
    }
  }
  
  const bestMove = bestChild?.move ?? null
  if (bestMove) {
    recordMove(bestMove)
  }
  
  console.log(`MCTS: ${iterations} iterations in ${timeLimit}ms`)
  
  return bestMove
}

/**
 * Get MCTS move with configuration
 */
export const getMCTSMove = (
  board: (Piece | null)[][],
  currentPlayer: PlayerColor,
  config: AIConfig
): Move | null => {
  if (config.timeLimit) {
    return mctsSearchTimed(board, currentPlayer, config.timeLimit)
  }
  
  const simulations = config.mctsSimulations ?? 1000
  return mctsSearch(board, currentPlayer, simulations)
}

