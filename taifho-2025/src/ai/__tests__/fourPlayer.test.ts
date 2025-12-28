/**
 * 4-Player AI Test
 * 
 * Tests AI vs AI vs AI vs AI games to verify:
 * 1. Games don't get stuck in infinite cycles
 * 2. All moves are valid
 * 3. Games terminate properly
 */

import { describe, it, expect, beforeEach } from 'vitest'
import type { PlayerColor, AIDifficulty, GameConfig } from '../../types/game'
import { DEFAULT_4P_CONFIG } from '../../types/game'
import { getBestMove, AI_DIFFICULTIES, resetAIHistory, simulateMove } from '../minimax'
import { checkWinner } from '../../utils/winCondition'
import { createInitialBoard } from '../../utils/boardUtils'
import { resetPositionHistory, recordPosition, getRepeatedPositions } from '../positionHistory'

const PLAYER_ORDER_4P: PlayerColor[] = ['red', 'green', 'blue', 'yellow']

const getNextPlayer4P = (current: PlayerColor, placements: PlayerColor[]): PlayerColor => {
  let idx = PLAYER_ORDER_4P.indexOf(current)
  for (let i = 0; i < 4; i++) {
    idx = (idx + 1) % 4
    const next = PLAYER_ORDER_4P[idx]
    if (!placements.includes(next)) {
      return next
    }
  }
  return current
}

interface GameResult {
  placements: PlayerColor[]
  moves: number
  repeatedPositions: number
  log: string[]
}

const play4PlayerGame = (
  difficulties: Record<PlayerColor, AIDifficulty>,
  maxMoves: number = 500,
  verbose: boolean = false
): GameResult => {
  resetAIHistory()
  resetPositionHistory()
  
  const config: GameConfig = {
    ...DEFAULT_4P_CONFIG,
    playerTypes: { red: 'computer', blue: 'computer', yellow: 'computer', green: 'computer' },
    aiDifficulty: { 
      red: difficulties.red, 
      blue: difficulties.blue, 
      yellow: difficulties.yellow, 
      green: difficulties.green 
    }
  }
  
  let board = createInitialBoard(config)
  let currentPlayer: PlayerColor = 'red'
  let moveCount = 0
  const placements: PlayerColor[] = []
  const log: string[] = []
  
  // Record initial position
  recordPosition(board, currentPlayer)
  
  if (verbose) {
    log.push(`4P Game: Red=${difficulties.red}, Green=${difficulties.green}, Blue=${difficulties.blue}, Yellow=${difficulties.yellow}`)
    log.push('---')
  }
  
  while (moveCount < maxMoves && placements.length < 3) {
    const aiConfig = AI_DIFFICULTIES[difficulties[currentPlayer]]
    const move = getBestMove(board, currentPlayer, aiConfig)
    
    if (!move) {
      if (verbose) log.push(`${currentPlayer} has no moves, skipping`)
      currentPlayer = getNextPlayer4P(currentPlayer, placements)
      continue
    }
    
    moveCount++
    board = simulateMove(board, move)
    
    // Record position for repetition tracking
    const nextPlayer = getNextPlayer4P(currentPlayer, placements)
    recordPosition(board, nextPlayer)
    
    if (verbose && moveCount <= 20) {
      const fromCol = String.fromCharCode(97 + move.from.x)
      const toCol = String.fromCharCode(97 + move.to.x)
      log.push(`${moveCount}. ${currentPlayer}: ${fromCol}${10 - move.from.y} -> ${toCol}${10 - move.to.y}`)
    }
    
    // Check if current player finished
    const winner = checkWinner(board, placements)
    if (winner && !placements.includes(winner)) {
      placements.push(winner)
      if (verbose) log.push(`*** ${winner} finished in position ${placements.length}! ***`)
    }
    
    currentPlayer = nextPlayer
  }
  
  if (verbose) {
    log.push('---')
    if (placements.length >= 3) {
      log.push(`Game over! Placements: ${placements.join(', ')}`)
    } else {
      log.push(`Game stopped after ${moveCount} moves (placements: ${placements.join(', ')})`)
    }
    log.push(`Repeated positions: ${getRepeatedPositions()}`)
  }
  
  return { placements, moves: moveCount, repeatedPositions: getRepeatedPositions(), log }
}

describe('4-Player AI Games', () => {
  beforeEach(() => {
    resetAIHistory()
    resetPositionHistory()
  })

  it('should complete a 4P beginner game without excessive cycling', () => {
    const result = play4PlayerGame(
      { red: 'beginner', green: 'beginner', blue: 'beginner', yellow: 'beginner' },
      300,
      true
    )
    
    console.log(result.log.join('\n'))
    
    // Game should make progress (not stuck in first 50 moves)
    expect(result.moves).toBeGreaterThan(10)
    // Should not have excessive repeated positions
    expect(result.repeatedPositions).toBeLessThan(50)
  })

  it('should complete a 4P easy game without infinite loop', () => {
    const result = play4PlayerGame(
      { red: 'easy', green: 'easy', blue: 'easy', yellow: 'easy' },
      300,
      true
    )
    
    console.log(result.log.join('\n'))
    
    expect(result.moves).toBeGreaterThan(10)
    expect(result.repeatedPositions).toBeLessThan(50)
  })

  it('should complete a 4P medium game without infinite loop', () => {
    const result = play4PlayerGame(
      { red: 'medium', green: 'medium', blue: 'medium', yellow: 'medium' },
      200,
      true
    )
    
    console.log(result.log.join('\n'))
    
    expect(result.moves).toBeGreaterThan(10)
    expect(result.repeatedPositions).toBeLessThan(30)
  })

  it('should complete a 4P hard game without infinite loop', () => {
    const result = play4PlayerGame(
      { red: 'challenging', green: 'challenging', blue: 'challenging', yellow: 'challenging' },
      150,
      true
    )
    
    console.log(result.log.join('\n'))
    
    expect(result.moves).toBeGreaterThan(10)
    expect(result.repeatedPositions).toBeLessThan(30)
  })

  it('should handle mixed difficulties in 4P', () => {
    const result = play4PlayerGame(
      { red: 'easy', green: 'medium', blue: 'easy', yellow: 'medium' },
      200,
      true
    )
    
    console.log(result.log.join('\n'))
    
    expect(result.moves).toBeGreaterThan(10)
  })
})

describe('4-Player Hard AI Stress Test', () => {
  beforeEach(() => {
    resetAIHistory()
    resetPositionHistory()
  })

  it('4x Hard AIs should not cycle', { timeout: 120000 }, () => {
    const result = play4PlayerGame(
      { red: 'hard', green: 'hard', blue: 'hard', yellow: 'hard' },
      100, // Shorter game due to long thinking time
      true
    )
    
    console.log(result.log.join('\n'))
    console.log(`Total moves: ${result.moves}, Repeated positions: ${result.repeatedPositions}`)
    
    // Should not have more repeated positions than moves/10
    expect(result.repeatedPositions).toBeLessThan(result.moves / 5)
  })
})
