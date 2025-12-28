/**
 * AI-specific types
 */

import type { Move, Piece, PlayerColor } from '../types/game'

export interface AIConfig {
  depth: number
  useRepetitionPenalty: boolean
  randomness: number
  useTT?: boolean
  useIterativeDeepening?: boolean
  useMCTS?: boolean
  mctsSimulations?: number
  timeLimit?: number // milliseconds
}

export interface AIResult {
  move: Move | null
  score: number
  nodesSearched?: number
  depth?: number
  timeMs?: number
}

export interface TTEntry {
  hash: bigint
  depth: number
  score: number
  flag: 'exact' | 'lower' | 'upper'
  bestMove: Move | null
}

export interface MCTSNode {
  board: (Piece | null)[][]
  player: PlayerColor
  move: Move | null
  parent: MCTSNode | null
  children: MCTSNode[]
  visits: number
  wins: number
  untriedMoves: Move[]
}

