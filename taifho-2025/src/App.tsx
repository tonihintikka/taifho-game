import { useEffect } from 'react';
import './App.css'
import { Board } from './components/Board';
import { HelpPanel } from './components/HelpPanel';
import { GameSetup } from './components/GameSetup';
import { MoveLog } from './components/MoveLog';
import { SetupPhase } from './components/SetupPhase';
import { useGameStore } from './store/useGameStore';

const PLACEMENT_EMOJI = ['🥇', '🥈', '🥉', '4️⃣'];
const COLOR_NAMES: Record<string, string> = {
  red: 'RED',
  blue: 'BLUE',
  yellow: 'YELLOW',
  green: 'GREEN'
};

function App() {
  const {
    phase,
    currentPlayer,
    resetGame,
    performAiMove,
    gameConfig,
    isSetupOpen,
    isViewingHistory,
    winner,
    placements
  } = useGameStore();

  useEffect(() => {
    // Don't trigger AI if viewing history, setup is open, in setup phase, or game is won
    if (isSetupOpen || isViewingHistory || winner || phase !== 'playing') return;

    const playerType = gameConfig.playerTypes[currentPlayer];
    if (playerType === 'computer') {
      performAiMove();
    }
  }, [currentPlayer, gameConfig, performAiMove, isSetupOpen, isViewingHistory, winner, phase]);

  return (
    <div className="app-container">
      {/* Game Configuration Modal */}
      {isSetupOpen && <GameSetup />}

      {/* Setup Phase - Free piece arrangement */}
      {phase === 'setup' && <SetupPhase />}

      {/* Winner Modal - shows full placements in 4P */}
      {winner && (
        <div className="winner-overlay">
          <div className="winner-modal">
            <h2>🎉 Game Over! 🎉</h2>
            {gameConfig.playerCount === 4 && placements.length > 0 ? (
              <div className="placements-list">
                <h3>Final Standings</h3>
                {placements.map((color, idx) => (
                  <p key={color} className={`placement-row ${color}`}>
                    {PLACEMENT_EMOJI[idx]} {idx + 1}{idx === 0 ? 'st' : idx === 1 ? 'nd' : idx === 2 ? 'rd' : 'th'}: {COLOR_NAMES[color]}
                  </p>
                ))}
                {/* Show 4th place (the one not in placements) */}
                {gameConfig.players.filter(p => !placements.includes(p)).map((color) => (
                  <p key={color} className={`placement-row ${color}`}>
                    {PLACEMENT_EMOJI[3]} 4th: {COLOR_NAMES[color]}
                  </p>
                ))}
              </div>
            ) : (
              <p className={`winner-text ${winner}`}>
                {winner.toUpperCase()} Wins!
              </p>
            )}
            <button className="play-again-btn" onClick={resetGame}>
              Play Again
            </button>
          </div>
        </div>
      )}

      <h1>Taifho</h1>

      {/* Show game info and board only when playing */}
      {phase === 'playing' && (
        <>
          <div className="game-info">
            {winner ? (
              <p className={`winner-banner ${winner}`}>
                🏆 {placements[0]?.toUpperCase() || winner.toUpperCase()} WINS! 🏆
              </p>
            ) : (
              <>
                <p>Current Turn: <span className={currentPlayer}>{currentPlayer.toUpperCase()}</span></p>
                {/* Show placements during 4P game */}
                {gameConfig.playerCount === 4 && placements.length > 0 && (
                  <div className="live-placements">
                    {placements.map((color, idx) => (
                      <span key={color} className={`placement-badge ${color}`}>
                        {PLACEMENT_EMOJI[idx]} {COLOR_NAMES[color]}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
            <button onClick={resetGame}>New Game</button>
          </div>
          <div className="game-layout">
            <Board />
            <div className="side-panel">
              <HelpPanel />
              <MoveLog />
            </div>
          </div>
        </>
      )}

      {/* Config phase - just show title until setup opens */}
      {phase === 'config' && !isSetupOpen && (
        <div className="config-waiting">
          <p>Valitse pelin asetukset...</p>
        </div>
      )}
    </div>
  )
}

export default App
