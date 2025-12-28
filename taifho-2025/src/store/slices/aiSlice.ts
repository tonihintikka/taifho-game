import type { StoreSlice } from '../types'
import { getBestMove, AI_DIFFICULTIES, resetAIHistory, getMCTSMove } from '../../ai'

export interface AiSliceState {
  performAiMove: () => Promise<void>
}

export const createAiSlice: StoreSlice<AiSliceState> = (_set, get) => ({
  performAiMove: async () => {
    const state = get()
    const pType = state.gameConfig.playerTypes[state.currentPlayer]
    if (pType !== 'computer') return
    if (state.isViewingHistory) return
    
    // Skip if this player has already finished (in 4P game)
    const placements = state.placements || []
    if (placements.includes(state.currentPlayer)) {
      get().finishTurn()
      return
    }

    // Get AI config based on difficulty setting for current player
    const difficulty = state.gameConfig.aiDifficulty[state.currentPlayer] || 'medium'
    const aiConfig = AI_DIFFICULTIES[difficulty]

    // Delay based on difficulty (simulates "thinking")
    const delayMap: Record<string, number> = {
      beginner: 200,
      easy: 300,
      medium: 500,
      challenging: 600,
      hard: 100,     // Shorter delay, actual thinking takes time
      master: 100,
      grandmaster: 100
    }
    const delay = delayMap[difficulty] || 500
    await new Promise(resolve => setTimeout(resolve, delay))

    let bestMove = null

    // Use MCTS for master/grandmaster levels
    if (aiConfig.useMCTS && !aiConfig.useIterativeDeepening) {
      bestMove = getMCTSMove(state.board, state.currentPlayer, aiConfig)
    } else {
      bestMove = getBestMove(state.board, state.currentPlayer, aiConfig)
    }

    if (bestMove) {
      get().movePiece(bestMove.from, bestMove.to)

      const newState = get()
      if (newState.currentPlayer === state.currentPlayer) {
        get().finishTurn()
      }
    } else {
      console.log('AI has no moves!')
      get().finishTurn()
    }
  }
})

// Export reset function for use when starting new game
export { resetAIHistory }
