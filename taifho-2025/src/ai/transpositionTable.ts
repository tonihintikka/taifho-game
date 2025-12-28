/**
 * Transposition Table with Zobrist Hashing
 * 
 * Caches evaluated positions to avoid redundant calculations.
 */

import type { Piece, PlayerColor, Move } from '../types/game'
import type { TTEntry } from './types'
import { BOARD_SIZE } from '../utils/boardUtils'

// Zobrist hash table: [y][x][pieceType][color]
const PIECE_TYPES = ['circle', 'square', 'triangle', 'diamond'] as const
const COLORS = ['red', 'blue', 'yellow', 'green'] as const

// Initialize random 64-bit values for Zobrist hashing
// Using BigInt for 64-bit precision
const zobristTable: bigint[][][][] = []
const zobristPlayer: Record<PlayerColor, bigint> = {} as Record<PlayerColor, bigint>

// Pseudo-random BigInt generator (deterministic for consistency)
let seed = BigInt(12345678901234567890n)
const nextRandom = (): bigint => {
  seed = (seed * 6364136223846793005n + 1442695040888963407n) % (2n ** 64n)
  return seed
}

// Initialize Zobrist tables
const initZobrist = (): void => {
  for (let y = 0; y < BOARD_SIZE; y++) {
    zobristTable[y] = []
    for (let x = 0; x < BOARD_SIZE; x++) {
      zobristTable[y][x] = []
      for (let pt = 0; pt < PIECE_TYPES.length; pt++) {
        zobristTable[y][x][pt] = []
        for (let c = 0; c < COLORS.length; c++) {
          zobristTable[y][x][pt][c] = nextRandom()
        }
      }
    }
  }
  
  for (const color of COLORS) {
    zobristPlayer[color] = nextRandom()
  }
}

// Run initialization
initZobrist()

/**
 * Compute Zobrist hash for a board position
 */
export const computeHash = (
  board: (Piece | null)[][],
  currentPlayer: PlayerColor
): bigint => {
  let hash = 0n
  
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const piece = board[y][x]
      if (piece) {
        const ptIndex = PIECE_TYPES.indexOf(piece.type)
        const cIndex = COLORS.indexOf(piece.color)
        hash ^= zobristTable[y][x][ptIndex][cIndex]
      }
    }
  }
  
  hash ^= zobristPlayer[currentPlayer]
  
  return hash
}

/**
 * Incrementally update hash after a move
 */
export const updateHash = (
  hash: bigint,
  move: Move,
  oldPlayer: PlayerColor,
  newPlayer: PlayerColor
): bigint => {
  const piece = move.piece
  const ptIndex = PIECE_TYPES.indexOf(piece.type)
  const cIndex = COLORS.indexOf(piece.color)
  
  // Remove piece from old position
  hash ^= zobristTable[move.from.y][move.from.x][ptIndex][cIndex]
  
  // Add piece to new position
  hash ^= zobristTable[move.to.y][move.to.x][ptIndex][cIndex]
  
  // Switch player
  hash ^= zobristPlayer[oldPlayer]
  hash ^= zobristPlayer[newPlayer]
  
  return hash
}

// Transposition Table
const TT_SIZE = 1 << 18 // 262144 entries (~8MB)
const table: Map<string, TTEntry> = new Map()

/**
 * Store a position in the transposition table
 */
export const ttStore = (
  hash: bigint,
  depth: number,
  score: number,
  flag: 'exact' | 'lower' | 'upper',
  bestMove: Move | null
): void => {
  const key = hash.toString()
  const existing = table.get(key)
  
  // Replace if new entry is deeper or same depth
  if (!existing || existing.depth <= depth) {
    table.set(key, { hash, depth, score, flag, bestMove })
  }
  
  // Limit table size
  if (table.size > TT_SIZE) {
    // Remove oldest entries (simple approach)
    const keys = Array.from(table.keys())
    for (let i = 0; i < keys.length / 4; i++) {
      table.delete(keys[i])
    }
  }
}

/**
 * Lookup a position in the transposition table
 */
export const ttLookup = (hash: bigint, depth: number): TTEntry | null => {
  const key = hash.toString()
  const entry = table.get(key)
  
  if (entry && entry.depth >= depth) {
    return entry
  }
  
  return null
}

/**
 * Clear the transposition table
 */
export const ttClear = (): void => {
  table.clear()
}

/**
 * Get TT statistics
 */
export const ttStats = (): { size: number; maxSize: number } => {
  return { size: table.size, maxSize: TT_SIZE }
}

