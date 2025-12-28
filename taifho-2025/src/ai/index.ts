/**
 * AI Module - Main Exports
 */

export * from './types'
export { evaluateBoard } from './evaluator'
export { getAllLegalMoves } from './moveGenerator'
export { 
  getBestMove, 
  AI_DIFFICULTIES, 
  resetAIHistory,
  simulateMove 
} from './minimax'
export { 
  mctsSearch, 
  mctsSearchTimed, 
  getMCTSMove,
  resetMCTSHistory
} from './mcts'
export { orderMoves, orderMovesAdvanced } from './moveOrdering'
export { computeHash, ttLookup, ttStore, ttClear, ttStats } from './transpositionTable'
export { 
  generateAISetup, 
  getSetupTypes, 
  selectTemplate,
  SETUP_TEMPLATES,
  SETUP_TEMPLATES_4P
} from './setupStrategy'
export {
  resetPositionHistory,
  recordPosition,
  getPositionCount,
  wouldCauseRepetition,
  getRepetitionPenalty,
  isDrawByRepetition,
  getUniquePositionCount,
  getRepeatedPositions
} from './positionHistory'
