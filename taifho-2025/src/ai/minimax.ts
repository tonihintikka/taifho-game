/**
 * Minimax Search with Alpha-Beta Pruning
 * 
 * Supports 7 difficulty levels from beginner to grandmaster.
 */

import type { Piece, Move, PlayerColor, AIDifficulty } from '../types/game'
import type { AIConfig } from './types'
import { getAllLegalMoves } from './moveGenerator'
import { evaluateBoard } from './evaluator'
import { orderMoves, orderMovesAdvanced, storeKiller, updateHistory, clearKillers, clearHistory } from './moveOrdering'
import { computeHash, ttLookup, ttStore, ttClear } from './transpositionTable'
import { resetMCTSHistory, mctsSearch } from './mcts'
import { getCombinedPenalty, resetPositionHistory, wouldCauseRepetition } from './positionHistory'

// Difficulty presets for all 7 levels
export const AI_DIFFICULTIES: Record<AIDifficulty, AIConfig> = {
  beginner:    { depth: 0, useRepetitionPenalty: true, randomness: 100 },
  easy:        { depth: 1, useRepetitionPenalty: true,  randomness: 30 },
  medium:      { depth: 2, useRepetitionPenalty: true,  randomness: 10 },
  challenging: { depth: 3, useRepetitionPenalty: true,  randomness: 0, useTT: true },
  hard:        { depth: 4, useRepetitionPenalty: true,  randomness: 0, useTT: true, useIterativeDeepening: true, timeLimit: 3000 },
  master:      { depth: 0, useRepetitionPenalty: true,  randomness: 0, useMCTS: true, mctsSimulations: 2000 },
  grandmaster: { depth: 5, useRepetitionPenalty: true,  randomness: 0, useTT: true, useIterativeDeepening: true, useMCTS: true, mctsSimulations: 3000, timeLimit: 5000 }
}

const INFINITY = 1000000
const REPETITION_PENALTY = 1500 // Strong penalty to prevent oscillation

// Recent moves for oscillation detection
let recentMoves: string[] = []
const MAX_RECENT_MOVES = 12 // Track more moves for better detection

const hashMoveStr = (move: Move): string => 
  `${move.from.x},${move.from.y}->${move.to.x},${move.to.y}`

const isReverseOfRecent = (move: Move): boolean => {
  const reverseHash = `${move.to.x},${move.to.y}->${move.from.x},${move.from.y}`
  return recentMoves.includes(reverseHash)
}

export const resetAIHistory = (): void => {
  recentMoves = []
  clearKillers()
  clearHistory()
  ttClear()
  resetMCTSHistory()
  resetPositionHistory()
}

// Simulate a move on the board
export const simulateMove = (board: (Piece | null)[][], move: Move): (Piece | null)[][] => {
  const newBoard = board.map(row => [...row])
  const p = newBoard[move.from.y][move.from.x]
  if (p) {
    newBoard[move.to.y][move.to.x] = p
    newBoard[move.from.y][move.from.x] = null
  }
  return newBoard
}

// Player order for different modes
const PLAYER_ORDER_2P: PlayerColor[] = ['red', 'blue']
const PLAYER_ORDER_4P: PlayerColor[] = ['red', 'green', 'blue', 'yellow']

// Detect player count from board (counts distinct colors)
export const detectPlayerCount = (board: (Piece | null)[][]): 2 | 4 => {
  const colors = new Set<PlayerColor>()
  for (const row of board) {
    for (const cell of row) {
      if (cell) colors.add(cell.color)
    }
  }
  return colors.size > 2 ? 4 : 2
}

// Get next player based on player count
const getNextPlayer = (player: PlayerColor, board: (Piece | null)[][]): PlayerColor => {
  const playerCount = detectPlayerCount(board)
  const order = playerCount === 4 ? PLAYER_ORDER_4P : PLAYER_ORDER_2P
  const idx = order.indexOf(player)
  return order[(idx + 1) % order.length]
}

/**
 * Main entry point: Get best move for current position
 */
export const getBestMove = (
  board: (Piece | null)[][],
  currentPlayer: PlayerColor,
  config: AIConfig = AI_DIFFICULTIES.medium
): Move | null => {
  const moves = getAllLegalMoves(board, currentPlayer)
  if (moves.length === 0) return null
  
  // Level 1 (Beginner): Random but avoid repeated positions
  if (config.depth === 0 && !config.useMCTS) {
    // Filter out moves that would cause position repetition
    const nonRepeatingMoves = moves.filter(move => {
      const newBoard = simulateMove(board, move)
      const nextPlayer = getNextPlayer(currentPlayer, newBoard)
      return !wouldCauseRepetition(newBoard, nextPlayer)
    })
    
    // Use non-repeating moves if available, otherwise fall back to all moves
    const availableMoves = nonRepeatingMoves.length > 0 ? nonRepeatingMoves : moves
    return availableMoves[Math.floor(Math.random() * availableMoves.length)]
  }
  
  // Level 6 (Master): Pure MCTS
  if (config.useMCTS && !config.useIterativeDeepening) {
    const simulations = config.mctsSimulations ?? 2000
    return mctsSearch(board, currentPlayer, simulations)
  }
  
  // Level 7 (Grandmaster): Iterative Deepening + MCTS hybrid
  // Uses minimax with MCTS for move ordering
  if (config.useIterativeDeepening && config.timeLimit) {
    return iterativeDeepening(board, currentPlayer, config)
  }
  
  // Levels 2-5: Use minimax with various optimizations
  return minimaxRoot(board, currentPlayer, config)
}

/**
 * Minimax root search (levels 2-4)
 */
const minimaxRoot = (
  board: (Piece | null)[][],
  currentPlayer: PlayerColor,
  config: AIConfig
): Move | null => {
  let moves = getAllLegalMoves(board, currentPlayer)
  if (moves.length === 0) return null
  
  // Get hash move from TT
  let hashMove: Move | null = null
  if (config.useTT) {
    const hash = computeHash(board, currentPlayer)
    const ttEntry = ttLookup(hash, config.depth)
    if (ttEntry?.bestMove) {
      hashMove = ttEntry.bestMove
    }
  }
  
  // Order moves for better pruning
  moves = config.useTT 
    ? orderMovesAdvanced(moves, currentPlayer, config.depth, hashMove)
    : orderMoves(moves, currentPlayer, hashMove)
  
  const scoredMoves: { move: Move; score: number }[] = []
  let alpha = -INFINITY
  const beta = INFINITY
  
  for (const move of moves) {
    const newBoard = simulateMove(board, move)
    const nextPlayer = getNextPlayer(currentPlayer, newBoard)
    
    let score = minimaxSearch(
      newBoard, config.depth - 1, nextPlayer,
      alpha, beta, false, currentPlayer, config
    )
    
    // Apply repetition penalties (both move-based and position-based)
    if (config.useRepetitionPenalty && isReverseOfRecent(move)) {
      score -= REPETITION_PENALTY
    }
    
    // Apply position history penalty (penalize repeated board states)
    if (config.useRepetitionPenalty) {
      const positionPenalty = getCombinedPenalty(newBoard, nextPlayer)
      score -= positionPenalty
    }
    
    // Add randomness for easier difficulties
    if (config.randomness > 0) {
      score += (Math.random() - 0.5) * config.randomness * 10
    }
    
    scoredMoves.push({ move, score })
    alpha = Math.max(alpha, score)
  }
  
  scoredMoves.sort((a, b) => b.score - a.score)
  const bestMove = scoredMoves[0]?.move ?? null
  
  // Store in TT
  if (config.useTT && bestMove) {
    const hash = computeHash(board, currentPlayer)
    ttStore(hash, config.depth, scoredMoves[0].score, 'exact', bestMove)
  }
  
  // Record for oscillation prevention
  if (bestMove) {
    recentMoves.push(hashMoveStr(bestMove))
    if (recentMoves.length > MAX_RECENT_MOVES) {
      recentMoves.shift()
    }
  }
  
  return bestMove
}

/**
 * Recursive minimax with alpha-beta pruning
 * 
 * Key fix for 4-player games:
 * - In 2P: alternates max/min as usual
 * - In 4P: only root player maximizes, ALL other players minimize
 *   (because all opponents want to hurt the root player)
 */
const minimaxSearch = (
  board: (Piece | null)[][],
  depth: number,
  player: PlayerColor,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  rootPlayer: PlayerColor,
  config: AIConfig
): number => {
  // TT lookup
  if (config.useTT) {
    const hash = computeHash(board, player)
    const ttEntry = ttLookup(hash, depth)
    if (ttEntry) {
      if (ttEntry.flag === 'exact') return ttEntry.score
      if (ttEntry.flag === 'lower') alpha = Math.max(alpha, ttEntry.score)
      if (ttEntry.flag === 'upper') beta = Math.min(beta, ttEntry.score)
      if (alpha >= beta) return ttEntry.score
    }
  }
  
  if (depth === 0) {
    // In 4P: each player evaluates from their OWN perspective (Max-N style)
    // Then we convert back to root's perspective for minimax
    const playerCount = detectPlayerCount(board)
    if (playerCount === 4 && player !== rootPlayer) {
      // Evaluate from current player's perspective
      const playerScore = evaluateBoard(board, player)
      const rootScore = evaluateBoard(board, rootPlayer)
      // Mix: opponent wants to maximize their score while hurting root
      // Weight: 70% own progress, 30% hurting root
      return -playerScore * 0.7 + rootScore * 0.3
    }
    return evaluateBoard(board, rootPlayer)
  }
  
  let moves = getAllLegalMoves(board, player)
  if (moves.length === 0) {
    const playerCount = detectPlayerCount(board)
    if (playerCount === 4 && player !== rootPlayer) {
      const playerScore = evaluateBoard(board, player)
      const rootScore = evaluateBoard(board, rootPlayer)
      return -playerScore * 0.7 + rootScore * 0.3
    }
    return evaluateBoard(board, rootPlayer)
  }
  
  // Order moves
  if (config.useTT) {
    const hash = computeHash(board, player)
    const ttEntry = ttLookup(hash, depth)
    moves = orderMovesAdvanced(moves, player, depth, ttEntry?.bestMove ?? null)
  }
  
  let bestScore = isMaximizing ? -INFINITY : INFINITY
  let bestMove: Move | null = null
  const origAlpha = alpha
  
  // Determine player count for proper 4P handling
  const playerCount = detectPlayerCount(board)
  
  for (const move of moves) {
    const newBoard = simulateMove(board, move)
    const nextPlayer = getNextPlayer(player, newBoard)
    
    // In 4P: only root player maximizes; all opponents minimize
    // In 2P: traditional alternation
    const nextIsMaximizing = playerCount === 4 
      ? (nextPlayer === rootPlayer)  // 4P: only root maximizes
      : !isMaximizing                 // 2P: alternate
    
    const score = minimaxSearch(
      newBoard, depth - 1, nextPlayer,
      alpha, beta, nextIsMaximizing, rootPlayer, config
    )
    
    if (isMaximizing) {
      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
      alpha = Math.max(alpha, score)
    } else {
      if (score < bestScore) {
        bestScore = score
        bestMove = move
      }
      beta = Math.min(beta, score)
    }
    
    if (beta <= alpha) {
      // Store killer move and history
      if (config.useTT) {
        storeKiller(depth, move)
        updateHistory(move, depth)
      }
      break
    }
  }
  
  // Store in TT
  if (config.useTT) {
    const hash = computeHash(board, player)
    let flag: 'exact' | 'lower' | 'upper' = 'exact'
    if (bestScore <= origAlpha) flag = 'upper'
    else if (bestScore >= beta) flag = 'lower'
    ttStore(hash, depth, bestScore, flag, bestMove)
  }
  
  return bestScore
}

/**
 * Iterative deepening search (level 5+)
 */
const iterativeDeepening = (
  board: (Piece | null)[][],
  currentPlayer: PlayerColor,
  config: AIConfig
): Move | null => {
  const startTime = performance.now()
  let bestMove: Move | null = null
  // let bestScore = -INFINITY // Unused in iterative deepening
  
  // Clear history for new search
  clearKillers()
  
  for (let depth = 1; depth <= config.depth; depth++) {
    const elapsed = performance.now() - startTime
    if (config.timeLimit && elapsed >= config.timeLimit * 0.8) {
      break // Don't start new iteration if > 80% time used
    }
    
    const result = minimaxRoot(board, currentPlayer, { ...config, depth })
    if (result) {
      bestMove = result
    }
  }
  
  return bestMove
}
