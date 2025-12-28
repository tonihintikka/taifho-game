/**
 * ⚠️  CRITICAL TEST - DO NOT SKIP ⚠️
 * 
 * Perspective Test - Verify each AI evaluates from their OWN perspective
 * 
 * This is a CRITICAL test for the game. If these tests fail:
 * - AI players will not try to reach their own goal
 * - 4-player games will be broken
 * - Each color must try to reach THEIR goal, not just block others
 * 
 * Run with: npm run test:critical
 * 
 * Goals:
 * - Red    → row 9 (bottom)
 * - Blue   → row 0 (top)
 * - Yellow → column 9 (right)
 * - Green  → column 0 (left)
 */

import { describe, it, expect } from 'vitest'
import type { Piece, PlayerColor } from '../../types/game'
import { getGoalLine } from '../../types/game'
import { evaluateBoard } from '../evaluator'
import { BOARD_SIZE } from '../../utils/boardUtils'

// Helper to create a board with pieces at specific positions
const createTestBoard = (): (Piece | null)[][] => {
  return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
}

// Helper to place a piece
const placePiece = (
  board: (Piece | null)[][],
  color: PlayerColor,
  x: number,
  y: number
): void => {
  board[y][x] = { type: 'square', color, id: `${color}-${x}-${y}` }
}

describe('AI Perspective - Goal Direction', () => {
  
  it('Red should prefer moves toward row 9 (bottom)', () => {
    // Red's goal is y=9 (bottom row)
    const board = createTestBoard()
    
    // Red piece at y=5 (middle)
    placePiece(board, 'red', 5, 5)
    const scoreMiddle = evaluateBoard(board, 'red')
    
    // Red piece at y=8 (close to goal)
    const board2 = createTestBoard()
    placePiece(board2, 'red', 5, 8)
    const scoreClose = evaluateBoard(board2, 'red')
    
    // Red piece at y=1 (far from goal)
    const board3 = createTestBoard()
    placePiece(board3, 'red', 5, 1)
    const scoreFar = evaluateBoard(board3, 'red')
    
    // Closer to goal should be better
    expect(scoreClose).toBeGreaterThan(scoreMiddle)
    expect(scoreMiddle).toBeGreaterThan(scoreFar)
    console.log(`Red: far=${scoreFar}, middle=${scoreMiddle}, close=${scoreClose}`)
  })

  it('Blue should prefer moves toward row 0 (top)', () => {
    // Blue's goal is y=0 (top row)
    const board = createTestBoard()
    
    // Blue piece at y=5 (middle)
    placePiece(board, 'blue', 5, 5)
    const scoreMiddle = evaluateBoard(board, 'blue')
    
    // Blue piece at y=1 (close to goal)
    const board2 = createTestBoard()
    placePiece(board2, 'blue', 5, 1)
    const scoreClose = evaluateBoard(board2, 'blue')
    
    // Blue piece at y=8 (far from goal)
    const board3 = createTestBoard()
    placePiece(board3, 'blue', 5, 8)
    const scoreFar = evaluateBoard(board3, 'blue')
    
    // Closer to goal should be better
    expect(scoreClose).toBeGreaterThan(scoreMiddle)
    expect(scoreMiddle).toBeGreaterThan(scoreFar)
    console.log(`Blue: far=${scoreFar}, middle=${scoreMiddle}, close=${scoreClose}`)
  })

  it('Yellow should prefer moves toward column 9 (right)', () => {
    // Yellow's goal is x=9 (right column)
    const board = createTestBoard()
    
    // Yellow piece at x=5 (middle)
    placePiece(board, 'yellow', 5, 5)
    const scoreMiddle = evaluateBoard(board, 'yellow')
    
    // Yellow piece at x=8 (close to goal)
    const board2 = createTestBoard()
    placePiece(board2, 'yellow', 8, 5)
    const scoreClose = evaluateBoard(board2, 'yellow')
    
    // Yellow piece at x=1 (far from goal)
    const board3 = createTestBoard()
    placePiece(board3, 'yellow', 1, 5)
    const scoreFar = evaluateBoard(board3, 'yellow')
    
    // Closer to goal should be better
    expect(scoreClose).toBeGreaterThan(scoreMiddle)
    expect(scoreMiddle).toBeGreaterThan(scoreFar)
    console.log(`Yellow: far=${scoreFar}, middle=${scoreMiddle}, close=${scoreClose}`)
  })

  it('Green should prefer moves toward column 0 (left)', () => {
    // Green's goal is x=0 (left column)
    const board = createTestBoard()
    
    // Green piece at x=5 (middle)
    placePiece(board, 'green', 5, 5)
    const scoreMiddle = evaluateBoard(board, 'green')
    
    // Green piece at x=1 (close to goal)
    const board2 = createTestBoard()
    placePiece(board2, 'green', 1, 5)
    const scoreClose = evaluateBoard(board2, 'green')
    
    // Green piece at x=8 (far from goal)
    const board3 = createTestBoard()
    placePiece(board3, 'green', 8, 5)
    const scoreFar = evaluateBoard(board3, 'green')
    
    // Closer to goal should be better
    expect(scoreClose).toBeGreaterThan(scoreMiddle)
    expect(scoreMiddle).toBeGreaterThan(scoreFar)
    console.log(`Green: far=${scoreFar}, middle=${scoreMiddle}, close=${scoreClose}`)
  })
})

describe('AI Perspective - Goal Verification', () => {
  
  it('each color should value reaching their OWN goal line', () => {
    const colors: PlayerColor[] = ['red', 'blue', 'yellow', 'green']
    
    for (const color of colors) {
      const goalLine = getGoalLine(color)
      
      // Create board with piece AT the goal
      const boardAtGoal = createTestBoard()
      if (goalLine.axis === 'y') {
        placePiece(boardAtGoal, color, 5, goalLine.value)
      } else {
        placePiece(boardAtGoal, color, goalLine.value, 5)
      }
      const scoreAtGoal = evaluateBoard(boardAtGoal, color)
      
      // Create board with piece FAR from goal
      const boardFar = createTestBoard()
      if (goalLine.axis === 'y') {
        placePiece(boardFar, color, 5, goalLine.value === 0 ? 8 : 1)
      } else {
        placePiece(boardFar, color, goalLine.value === 0 ? 8 : 1, 5)
      }
      const scoreFar = evaluateBoard(boardFar, color)
      
      // At goal should be MUCH better than far
      expect(scoreAtGoal).toBeGreaterThan(scoreFar)
      
      // Goal bonus should be significant (at least 2000 points from W_GOAL)
      expect(scoreAtGoal - scoreFar).toBeGreaterThan(1500)
      
      console.log(`${color}: at_goal=${scoreAtGoal}, far=${scoreFar}, bonus=${scoreAtGoal - scoreFar}`)
    }
  })

  it('getGoalLine should return correct goals for all colors', () => {
    expect(getGoalLine('red')).toEqual({ axis: 'y', value: 9 })    // bottom
    expect(getGoalLine('blue')).toEqual({ axis: 'y', value: 0 })   // top
    expect(getGoalLine('yellow')).toEqual({ axis: 'x', value: 9 }) // right
    expect(getGoalLine('green')).toEqual({ axis: 'x', value: 0 })  // left
  })
})

describe('AI Perspective - Cross-color Independence', () => {
  
  it('Red progress should not help Blue score', () => {
    // Red piece close to Red goal (y=9)
    const board = createTestBoard()
    placePiece(board, 'red', 5, 8)
    
    const redScore = evaluateBoard(board, 'red')
    const blueScore = evaluateBoard(board, 'blue')
    
    // Red should see this as good, Blue should see it as bad (opponent advantage)
    expect(redScore).toBeGreaterThan(0)
    expect(blueScore).toBeLessThan(0)
    
    console.log(`Red piece near red goal: red_sees=${redScore}, blue_sees=${blueScore}`)
  })

  it('Each color should evaluate opponent progress negatively', () => {
    // Green piece very close to Green goal (x=1)
    const board = createTestBoard()
    placePiece(board, 'green', 1, 5)
    
    const greenScore = evaluateBoard(board, 'green')
    const yellowScore = evaluateBoard(board, 'yellow')
    const redScore = evaluateBoard(board, 'red')
    
    // Green should see this as good
    expect(greenScore).toBeGreaterThan(0)
    // Others should see opponent progress as bad
    expect(yellowScore).toBeLessThan(0)
    expect(redScore).toBeLessThan(0)
    
    console.log(`Green near goal: green=${greenScore}, yellow=${yellowScore}, red=${redScore}`)
  })
})
