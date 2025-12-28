/**
 * Move Ordering
 * 
 * Orders moves to improve alpha-beta pruning efficiency.
 * Better moves first = more cutoffs = faster search.
 */

import type { Move, PlayerColor } from '../types/game'
import { getGoalLine } from '../types/game'

/**
 * Score a move for ordering purposes (higher = search first)
 */
const scoreMove = (
  move: Move,
  player: PlayerColor,
  hashMove: Move | null
): number => {
  let score = 0
  
  // Hash move from TT gets highest priority
  if (hashMove && 
      move.from.x === hashMove.from.x && 
      move.from.y === hashMove.from.y &&
      move.to.x === hashMove.to.x && 
      move.to.y === hashMove.to.y) {
    return 10000
  }
  
  // Check if move reaches goal
  const goalLine = getGoalLine(player)
  const reachesGoal = goalLine.axis === 'y' 
    ? move.to.y === goalLine.value 
    : move.to.x === goalLine.value
  
  if (reachesGoal) {
    score += 5000
  }
  
  // Check if it's a jump (distance > 1)
  const dx = Math.abs(move.to.x - move.from.x)
  const dy = Math.abs(move.to.y - move.from.y)
  const isJump = dx > 1 || dy > 1
  
  if (isJump) {
    // Jumps are often good
    score += 1000 + (dx + dy) * 100 // Longer jumps get bonus
  }
  
  // Forward progress bonus
  const forwardProgress = getForwardProgress(move, player)
  score += forwardProgress * 100
  
  // Center control bonus (minor)
  const centerDist = Math.abs(move.to.x - 4.5) + Math.abs(move.to.y - 4.5)
  score += (10 - centerDist) * 5
  
  return score
}

/**
 * Calculate how much forward progress a move makes
 */
const getForwardProgress = (move: Move, player: PlayerColor): number => {
  const goalLine = getGoalLine(player)
  
  if (goalLine.axis === 'y') {
    const fromDist = Math.abs(move.from.y - goalLine.value)
    const toDist = Math.abs(move.to.y - goalLine.value)
    return fromDist - toDist
  } else {
    const fromDist = Math.abs(move.from.x - goalLine.value)
    const toDist = Math.abs(move.to.x - goalLine.value)
    return fromDist - toDist
  }
}

/**
 * Order moves for better alpha-beta performance
 */
export const orderMoves = (
  moves: Move[],
  player: PlayerColor,
  hashMove: Move | null = null
): Move[] => {
  // Score and sort moves
  const scoredMoves = moves.map(move => ({
    move,
    score: scoreMove(move, player, hashMove)
  }))
  
  scoredMoves.sort((a, b) => b.score - a.score)
  
  return scoredMoves.map(sm => sm.move)
}

// Killer moves: moves that caused beta cutoffs at each depth
const killerMoves: Map<number, Move[]> = new Map()
const MAX_KILLERS = 2

/**
 * Store a killer move
 */
export const storeKiller = (depth: number, move: Move): void => {
  const killers = killerMoves.get(depth) || []
  
  // Don't store duplicates
  const isDuplicate = killers.some(k => 
    k.from.x === move.from.x && k.from.y === move.from.y &&
    k.to.x === move.to.x && k.to.y === move.to.y
  )
  
  if (!isDuplicate) {
    killers.unshift(move)
    if (killers.length > MAX_KILLERS) {
      killers.pop()
    }
    killerMoves.set(depth, killers)
  }
}

/**
 * Get killer moves for a depth
 */
export const getKillers = (depth: number): Move[] => {
  return killerMoves.get(depth) || []
}

/**
 * Clear killer moves (new search)
 */
export const clearKillers = (): void => {
  killerMoves.clear()
}

// History heuristic: tracks how good moves have been historically
const historyTable: Map<string, number> = new Map()

const moveKey = (move: Move): string => 
  `${move.from.x},${move.from.y}->${move.to.x},${move.to.y}`

/**
 * Update history score for a move that caused a cutoff
 */
export const updateHistory = (move: Move, depth: number): void => {
  const key = moveKey(move)
  const current = historyTable.get(key) || 0
  historyTable.set(key, current + depth * depth)
}

/**
 * Get history score for a move
 */
export const getHistoryScore = (move: Move): number => {
  return historyTable.get(moveKey(move)) || 0
}

/**
 * Clear history table (new game)
 */
export const clearHistory = (): void => {
  historyTable.clear()
}

/**
 * Full move ordering with all heuristics
 */
export const orderMovesAdvanced = (
  moves: Move[],
  player: PlayerColor,
  depth: number,
  hashMove: Move | null = null
): Move[] => {
  const killers = getKillers(depth)
  
  const scoredMoves = moves.map(move => {
    let score = scoreMove(move, player, hashMove)
    
    // Killer move bonus
    const isKiller = killers.some(k =>
      k.from.x === move.from.x && k.from.y === move.from.y &&
      k.to.x === move.to.x && k.to.y === move.to.y
    )
    if (isKiller) {
      score += 3000
    }
    
    // History heuristic bonus
    score += getHistoryScore(move)
    
    return { move, score }
  })
  
  scoredMoves.sort((a, b) => b.score - a.score)
  
  return scoredMoves.map(sm => sm.move)
}

