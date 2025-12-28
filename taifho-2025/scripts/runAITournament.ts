/**
 * AI Tournament Runner
 * 
 * Run with: npx tsx scripts/runAITournament.ts
 * 
 * Supports both 2-player and 4-player games.
 * 4-player games continue until 3 players finish (1st, 2nd, 3rd place).
 */

import type { Piece, PlayerColor, AIDifficulty, GameConfig } from '../src/types/game'
import { DEFAULT_2P_CONFIG, DEFAULT_4P_CONFIG } from '../src/types/game'
import { getBestMove, AI_DIFFICULTIES, resetAIHistory, simulateMove } from '../src/ai/minimax'
import { getMCTSMove } from '../src/ai/mcts'
import { checkWinner, isGameOver } from '../src/utils/winCondition'
import { createInitialBoard } from '../src/utils/boardUtils'

const LEVELS: AIDifficulty[] = ['beginner', 'easy', 'medium', 'challenging', 'hard']

// Color emoji mapping
const COLOR_EMOJI: Record<PlayerColor, string> = {
  red: '🔴',
  blue: '🔵',
  yellow: '🟡',
  green: '🟢'
}

// Placement emoji
const PLACEMENT_EMOJI = ['🥇', '🥈', '🥉', '4️⃣']

// Board visualization
const printBoard = (board: (Piece | null)[][]): void => {
  console.log('    a b c d e f g h i j')
  console.log('   ─────────────────────')
  for (let y = 0; y < 10; y++) {
    let row = `${String(10 - y).padStart(2)} │`
    for (let x = 0; x < 10; x++) {
      const piece = board[y][x]
      if (piece) {
        row += COLOR_EMOJI[piece.color]
      } else {
        row += ' ·'
      }
    }
    row += `│ ${10 - y}`
    console.log(row)
  }
  console.log('   ─────────────────────')
  console.log('    a b c d e f g h i j')
}

// Get move for difficulty
const getAIMove = (
  board: (Piece | null)[][],
  player: PlayerColor,
  difficulty: AIDifficulty
) => {
  const config = AI_DIFFICULTIES[difficulty]
  
  if (config.useMCTS && !config.useIterativeDeepening) {
    return getMCTSMove(board, player, config)
  }
  
  return getBestMove(board, player, config)
}

// Get next player, skipping players who have finished
const getNextPlayer = (
  current: PlayerColor, 
  players: PlayerColor[],
  placements: PlayerColor[] = []
): PlayerColor => {
  const len = players.length
  let idx = players.indexOf(current)
  
  for (let i = 0; i < len; i++) {
    idx = (idx + 1) % len
    const nextPlayer = players[idx]
    if (!placements.includes(nextPlayer)) {
      return nextPlayer
    }
  }
  
  return current
}

// ============== 2-PLAYER GAMES ==============

// Play and display a 2P game
const playVisual2PGame = (
  redLevel: AIDifficulty,
  blueLevel: AIDifficulty,
  showBoard: boolean = false,
  maxMoves: number = 150
): void => {
  resetAIHistory()
  
  const config = DEFAULT_2P_CONFIG
  let board = createInitialBoard(config)
  let currentPlayer: PlayerColor = 'red'
  let moveCount = 0
  
  console.log('\n' + '═'.repeat(50))
  console.log(`🎮 2P GAME: ${redLevel.toUpperCase()} (Red) vs ${blueLevel.toUpperCase()} (Blue)`)
  console.log('═'.repeat(50) + '\n')
  
  if (showBoard) {
    console.log('Starting position:')
    printBoard(board)
  }
  
  const startTime = Date.now()
  const difficulties: Record<PlayerColor, AIDifficulty> = {
    red: redLevel,
    blue: blueLevel,
    yellow: 'medium',
    green: 'medium'
  }
  
  while (moveCount < maxMoves) {
    const difficulty = difficulties[currentPlayer]
    const moveStart = Date.now()
    const move = getAIMove(board, currentPlayer, difficulty)
    const moveTime = Date.now() - moveStart
    
    if (!move) {
      console.log(`${currentPlayer} has no legal moves!`)
      break
    }
    
    board = simulateMove(board, move)
    moveCount++
    
    const from = `${String.fromCharCode(97 + move.from.x)}${10 - move.from.y}`
    const to = `${String.fromCharCode(97 + move.to.x)}${10 - move.to.y}`
    
    console.log(`${String(moveCount).padStart(3)}. ${COLOR_EMOJI[currentPlayer]} ${from} → ${to} (${moveTime}ms)`)
    
    if (showBoard && moveCount % 10 === 0) {
      printBoard(board)
    }
    
    const winner = checkWinner(board, [])
    if (winner) {
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)
      console.log('\n' + '─'.repeat(50))
      const winnerLevel = difficulties[winner]
      console.log(`🏆 WINNER: ${COLOR_EMOJI[winner]} ${winnerLevel.toUpperCase()} in ${moveCount} moves (${totalTime}s)`)
      console.log('─'.repeat(50) + '\n')
      
      if (showBoard) {
        console.log('Final position:')
        printBoard(board)
      }
      return
    }
    
    currentPlayer = getNextPlayer(currentPlayer, config.players)
  }
  
  console.log(`\n⏸️  DRAW - Max moves (${maxMoves}) reached`)
}

// ============== 4-PLAYER GAMES ==============

interface Player4PConfig {
  color: PlayerColor
  difficulty: AIDifficulty
}

// Play and display a 4P game (until 3 players finish)
const playVisual4PGame = (
  players: Player4PConfig[],
  showBoard: boolean = false,
  maxMoves: number = 300
): PlayerColor[] => {
  resetAIHistory()
  
  const config = DEFAULT_4P_CONFIG
  let board = createInitialBoard(config)
  let currentPlayer: PlayerColor = config.players[0]
  let moveCount = 0
  const placements: PlayerColor[] = []
  
  const difficulties: Record<PlayerColor, AIDifficulty> = {
    red: players.find(p => p.color === 'red')?.difficulty || 'medium',
    blue: players.find(p => p.color === 'blue')?.difficulty || 'medium',
    yellow: players.find(p => p.color === 'yellow')?.difficulty || 'medium',
    green: players.find(p => p.color === 'green')?.difficulty || 'medium'
  }
  
  console.log('\n' + '═'.repeat(60))
  console.log('🎮 4-PLAYER GAME (plays until 3 players finish)')
  console.log('─'.repeat(60))
  for (const p of players) {
    console.log(`  ${COLOR_EMOJI[p.color]} ${p.color.padEnd(7)}: ${p.difficulty}`)
  }
  console.log('═'.repeat(60) + '\n')
  
  if (showBoard) {
    console.log('Starting position:')
    printBoard(board)
  }
  
  const startTime = Date.now()
  
  while (moveCount < maxMoves && placements.length < 3) {
    // Skip players who have already finished
    if (placements.includes(currentPlayer)) {
      currentPlayer = getNextPlayer(currentPlayer, config.players, placements)
      continue
    }
    
    const difficulty = difficulties[currentPlayer]
    const moveStart = Date.now()
    const move = getAIMove(board, currentPlayer, difficulty)
    const moveTime = Date.now() - moveStart
    
    if (!move) {
      console.log(`${COLOR_EMOJI[currentPlayer]} ${currentPlayer} has no legal moves!`)
      currentPlayer = getNextPlayer(currentPlayer, config.players, placements)
      continue
    }
    
    board = simulateMove(board, move)
    moveCount++
    
    const from = `${String.fromCharCode(97 + move.from.x)}${10 - move.from.y}`
    const to = `${String.fromCharCode(97 + move.to.x)}${10 - move.to.y}`
    
    console.log(`${String(moveCount).padStart(3)}. ${COLOR_EMOJI[currentPlayer]} ${from} → ${to} (${moveTime}ms)`)
    
    if (showBoard && moveCount % 16 === 0) {
      printBoard(board)
    }
    
    // Check if current player just finished
    const finishedPlayer = checkWinner(board, placements)
    if (finishedPlayer) {
      const place = placements.length + 1
      placements.push(finishedPlayer)
      
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)
      console.log('\n' + '─'.repeat(60))
      console.log(`${PLACEMENT_EMOJI[place - 1]} ${place === 1 ? '1ST' : place === 2 ? '2ND' : '3RD'} PLACE: ${COLOR_EMOJI[finishedPlayer]} ${finishedPlayer.toUpperCase()} (${difficulties[finishedPlayer]}) - ${moveCount} moves (${totalTime}s)`)
      console.log('─'.repeat(60) + '\n')
      
      if (showBoard && place <= 2) {
        console.log(`Position after ${finishedPlayer} finishes:`)
        printBoard(board)
      }
      
      // Check if game is over (3 players finished)
      if (isGameOver(placements, 4)) {
        break
      }
    }
    
    currentPlayer = getNextPlayer(currentPlayer, config.players, placements)
  }
  
  // Determine 4th place (the one not in placements)
  const loser = config.players.find(p => !placements.includes(p))
  if (loser) {
    placements.push(loser)
  }
  
  // Final summary
  console.log('\n' + '═'.repeat(60))
  console.log('🏁 FINAL STANDINGS')
  console.log('─'.repeat(60))
  for (let i = 0; i < placements.length; i++) {
    const color = placements[i]
    const suffix = i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'
    console.log(`  ${PLACEMENT_EMOJI[i]} ${i + 1}${suffix}: ${COLOR_EMOJI[color]} ${color.padEnd(7)} (${difficulties[color]})`)
  }
  console.log('═'.repeat(60) + '\n')
  
  if (showBoard) {
    console.log('Final position:')
    printBoard(board)
  }
  
  if (moveCount >= maxMoves) {
    console.log(`\n⏸️  Game ended - Max moves (${maxMoves}) reached`)
  }
  
  return placements
}

// Run 4P tournament
const run4PTournament = (games: number = 2): void => {
  console.log('\n' + '╔' + '═'.repeat(58) + '╗')
  console.log('║' + '      4-PLAYER AI TOURNAMENT (Full Placements)'.padEnd(58) + '║')
  console.log('╚' + '═'.repeat(58) + '╝\n')
  
  // Track points: 1st=3pts, 2nd=2pts, 3rd=1pt, 4th=0pts
  const results: Map<PlayerColor, { points: number; firsts: number; games: number }> = new Map()
  for (const color of ['red', 'green', 'blue', 'yellow'] as PlayerColor[]) {
    results.set(color, { points: 0, firsts: 0, games: 0 })
  }
  
  // Different configurations to test
  const configs: Player4PConfig[][] = [
    // All same level
    [
      { color: 'red', difficulty: 'easy' },
      { color: 'green', difficulty: 'easy' },
      { color: 'blue', difficulty: 'easy' },
      { color: 'yellow', difficulty: 'easy' }
    ],
    // Mixed levels
    [
      { color: 'red', difficulty: 'beginner' },
      { color: 'green', difficulty: 'easy' },
      { color: 'blue', difficulty: 'medium' },
      { color: 'yellow', difficulty: 'easy' }
    ],
    // One strong vs three weak
    [
      { color: 'red', difficulty: 'medium' },
      { color: 'green', difficulty: 'beginner' },
      { color: 'blue', difficulty: 'beginner' },
      { color: 'yellow', difficulty: 'beginner' }
    ],
    // Two strong vs two weak
    [
      { color: 'red', difficulty: 'medium' },
      { color: 'green', difficulty: 'beginner' },
      { color: 'blue', difficulty: 'medium' },
      { color: 'yellow', difficulty: 'beginner' }
    ]
  ]
  
  const pointsTable = [3, 2, 1, 0] // 1st, 2nd, 3rd, 4th
  
  for (let configIdx = 0; configIdx < configs.length; configIdx++) {
    const players = configs[configIdx]
    console.log(`\n─── Configuration ${configIdx + 1} ───`)
    for (const p of players) {
      console.log(`  ${COLOR_EMOJI[p.color]} ${p.color}: ${p.difficulty}`)
    }
    console.log('')
    
    for (let g = 0; g < games; g++) {
      const placements = playVisual4PGame(players, false, 300)
      
      // Award points
      for (let i = 0; i < placements.length; i++) {
        const color = placements[i]
        const stats = results.get(color)!
        stats.points += pointsTable[i]
        stats.games++
        if (i === 0) stats.firsts++
      }
      
      console.log(`  Game ${g + 1} result: ${placements.map((c, i) => `${PLACEMENT_EMOJI[i]}${COLOR_EMOJI[c]}`).join(' ')}`)
    }
  }
  
  console.log('\n' + '═'.repeat(60))
  console.log('4P TOURNAMENT FINAL STANDINGS (Points: 1st=3, 2nd=2, 3rd=1)')
  console.log('─'.repeat(60))
  
  const standings = Array.from(results.entries())
    .sort((a, b) => b[1].points - a[1].points || b[1].firsts - a[1].firsts)
  
  for (const [color, stats] of standings) {
    const avg = stats.games > 0 ? (stats.points / stats.games).toFixed(2) : '0.00'
    console.log(`  ${COLOR_EMOJI[color]} ${color.padEnd(7)}: ${stats.points} pts (${stats.firsts} wins) - avg: ${avg}`)
  }
}

// ============== 2P TOURNAMENT ==============

// Run 2P tournament
const run2PTournament = (games: number = 2): void => {
  console.log('\n' + '╔' + '═'.repeat(48) + '╗')
  console.log('║' + '         2-PLAYER AI TOURNAMENT'.padEnd(48) + '║')
  console.log('╚' + '═'.repeat(48) + '╝\n')
  
  const results: Map<string, { wins: number; losses: number; draws: number }> = new Map()
  
  for (const level of LEVELS) {
    results.set(level, { wins: 0, losses: 0, draws: 0 })
  }
  
  for (let i = 0; i < LEVELS.length - 1; i++) {
    const l1 = LEVELS[i]
    const l2 = LEVELS[i + 1]
    
    let l1Wins = 0, l2Wins = 0, draws = 0
    
    for (let g = 0; g < games; g++) {
      resetAIHistory()
      
      const redLevel = g % 2 === 0 ? l1 : l2
      const blueLevel = g % 2 === 0 ? l2 : l1
      
      let board = createInitialBoard(DEFAULT_2P_CONFIG)
      let currentPlayer: PlayerColor = 'red'
      let moves = 0
      
      while (moves < 150) {
        const diff = currentPlayer === 'red' ? redLevel : blueLevel
        const move = getAIMove(board, currentPlayer, diff)
        if (!move) break
        
        board = simulateMove(board, move)
        moves++
        
        const winner = checkWinner(board, [])
        if (winner) {
          if ((winner === 'red' && redLevel === l1) || (winner === 'blue' && blueLevel === l1)) {
            l1Wins++
          } else {
            l2Wins++
          }
          break
        }
        
        currentPlayer = currentPlayer === 'red' ? 'blue' : 'red'
        if (moves >= 150) draws++
      }
    }
    
    results.get(l1)!.wins += l1Wins
    results.get(l1)!.losses += l2Wins
    results.get(l2)!.wins += l2Wins
    results.get(l2)!.losses += l1Wins
    
    const winnerStr = l1Wins > l2Wins ? `← ${l1}` : l2Wins > l1Wins ? `${l2} →` : 'TIE'
    console.log(`${l1.padEnd(12)} vs ${l2.padEnd(12)} : ${l1Wins}-${l2Wins} (draws: ${draws}) ${winnerStr}`)
  }
  
  console.log('\n' + '─'.repeat(50))
  console.log('2P STANDINGS:')
  
  const standings = Array.from(results.entries())
    .sort((a, b) => (b[1].wins - b[1].losses) - (a[1].wins - a[1].losses))
  
  for (const [level, stats] of standings) {
    const diff = stats.wins - stats.losses
    const sign = diff >= 0 ? '+' : ''
    console.log(`  ${level.padEnd(12)} : ${stats.wins}W - ${stats.losses}L (${sign}${diff})`)
  }
}

// ============== MAIN ==============

const printHelp = (): void => {
  console.log('Taifho AI Tournament Runner')
  console.log('═'.repeat(50))
  console.log('')
  console.log('Usage:')
  console.log('')
  console.log('  2-PLAYER GAMES:')
  console.log('    npx tsx scripts/runAITournament.ts tournament2p [games]')
  console.log('    npx tsx scripts/runAITournament.ts watch2p [red] [blue]')
  console.log('')
  console.log('  4-PLAYER GAMES (plays until 3 players finish):')
  console.log('    npx tsx scripts/runAITournament.ts tournament4p [games]')
  console.log('    npx tsx scripts/runAITournament.ts watch4p [red] [green] [blue] [yellow]')
  console.log('')
  console.log('Difficulty levels:')
  console.log('  beginner, easy, medium, challenging, hard, master, grandmaster')
  console.log('')
  console.log('Examples:')
  console.log('  npx tsx scripts/runAITournament.ts tournament2p 4')
  console.log('  npx tsx scripts/runAITournament.ts watch2p easy hard')
  console.log('  npx tsx scripts/runAITournament.ts tournament4p 2')
  console.log('  npx tsx scripts/runAITournament.ts watch4p easy medium challenging hard')
  console.log('')
}

const main = () => {
  const args = process.argv.slice(2)
  
  if (args[0] === 'tournament2p' || args[0] === 'tournament') {
    const games = parseInt(args[1]) || 2
    run2PTournament(games)
  } else if (args[0] === 'tournament4p') {
    const games = parseInt(args[1]) || 2
    run4PTournament(games)
  } else if (args[0] === 'watch2p' || args[0] === 'watch') {
    const red = (args[1] || 'easy') as AIDifficulty
    const blue = (args[2] || 'medium') as AIDifficulty
    playVisual2PGame(red, blue, true)
  } else if (args[0] === 'watch4p') {
    const players: Player4PConfig[] = [
      { color: 'red', difficulty: (args[1] || 'easy') as AIDifficulty },
      { color: 'green', difficulty: (args[2] || 'easy') as AIDifficulty },
      { color: 'blue', difficulty: (args[3] || 'medium') as AIDifficulty },
      { color: 'yellow', difficulty: (args[4] || 'medium') as AIDifficulty }
    ]
    playVisual4PGame(players, true)
  } else if (args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
    printHelp()
  } else {
    printHelp()
    
    // Run quick 2P demo
    console.log('Running quick 2P demo...\n')
    playVisual2PGame('easy', 'medium', false, 80)
  }
}

main()
