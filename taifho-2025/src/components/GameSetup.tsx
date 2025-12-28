import { useState } from 'react';
import './GameSetup.css';
import { useGameStore } from '../store/useGameStore';
import { DEFAULT_2P_CONFIG, DEFAULT_4P_CONFIG } from '../types/game';
import type { GameConfig, AIDifficulty, PlayerColor, PlayerType } from '../types/game';

type GameMode = 'pvp' | 'pve' | 'eve';
type SetupType = 'fixed' | 'free';

const PLAYER_COLORS: { color: PlayerColor; label: string; emoji: string }[] = [
    { color: 'red', label: 'Red', emoji: '🔴' },
    { color: 'blue', label: 'Blue', emoji: '🔵' },
    { color: 'yellow', label: 'Yellow', emoji: '🟡' },
    { color: 'green', label: 'Green', emoji: '🟢' }
];

export const GameSetup: React.FC = () => {
    const { startGame, startGameWithSetup } = useGameStore();
    const [playerCount, setPlayerCount] = useState<2 | 4>(2);
    const [gameMode, setGameMode] = useState<GameMode>('pve');
    const [setupType, setSetupType] = useState<SetupType>('fixed');
    
    // Individual player settings
    const [playerTypes, setPlayerTypes] = useState<Record<PlayerColor, PlayerType>>({
        red: 'human',
        blue: 'computer',
        yellow: 'human',
        green: 'human'
    });
    const [playerDifficulties, setPlayerDifficulties] = useState<Record<PlayerColor, AIDifficulty>>({
        red: 'medium',
        blue: 'medium',
        yellow: 'medium',
        green: 'medium'
    });

    // Update player types when game mode changes (2-player mode)
    const handleGameModeChange = (mode: GameMode) => {
        setGameMode(mode);
        if (playerCount === 2) {
            setPlayerTypes({
                red: mode === 'eve' ? 'computer' : 'human',
                blue: mode === 'pvp' ? 'human' : 'computer',
                yellow: 'human',
                green: 'human'
            });
        }
    };

    const handlePlayerTypeChange = (color: PlayerColor, type: PlayerType) => {
        setPlayerTypes(prev => ({ ...prev, [color]: type }));
    };

    const handleDifficultyChange = (color: PlayerColor, difficulty: AIDifficulty) => {
        setPlayerDifficulties(prev => ({ ...prev, [color]: difficulty }));
    };

    const handleStart = () => {
        let config: GameConfig;

        if (playerCount === 4) {
            config = {
                ...DEFAULT_4P_CONFIG,
                playerTypes,
                aiDifficulty: {
                    red: playerTypes.red === 'computer' ? playerDifficulties.red : null,
                    blue: playerTypes.blue === 'computer' ? playerDifficulties.blue : null,
                    yellow: playerTypes.yellow === 'computer' ? playerDifficulties.yellow : null,
                    green: playerTypes.green === 'computer' ? playerDifficulties.green : null
                }
            };
        } else {
            config = {
                ...DEFAULT_2P_CONFIG,
                playerTypes,
                aiDifficulty: {
                    red: playerTypes.red === 'computer' ? playerDifficulties.red : null,
                    blue: playerTypes.blue === 'computer' ? playerDifficulties.blue : null,
                    yellow: null,
                    green: null
                }
            };
        }

        // Choose start method based on setup type
        if (setupType === 'free') {
            startGameWithSetup(config);
        } else {
            startGame(config);
        }
    };

    const activePlayers = playerCount === 2 
        ? PLAYER_COLORS.filter(p => p.color === 'red' || p.color === 'blue')
        : PLAYER_COLORS;

    return (
        <div className="setup-overlay">
            <div className="setup-modal">
                <h2>New Game Setup</h2>

                <div className="setup-group">
                    <h3>Players</h3>
                    <div className="option-buttons">
                        <button
                            className={`setup-btn ${playerCount === 2 ? 'active' : ''}`}
                            onClick={() => setPlayerCount(2)}
                        >
                            2 Players
                        </button>
                        <button
                            className={`setup-btn ${playerCount === 4 ? 'active' : ''}`}
                            onClick={() => setPlayerCount(4)}
                        >
                            4 Players
                        </button>
                    </div>
                </div>

                <div className="setup-group">
                    <h3>Starting Position</h3>
                    <div className="option-buttons">
                        <button
                            className={`setup-btn ${setupType === 'fixed' ? 'active' : ''}`}
                            onClick={() => setSetupType('fixed')}
                            title="Standard symmetrical starting position"
                        >
                            📐 Fixed
                        </button>
                        <button
                            className={`setup-btn ${setupType === 'free' ? 'active' : ''}`}
                            onClick={() => setSetupType('free')}
                            title="Each player chooses their own arrangement"
                        >
                            🎯 Free Choice
                        </button>
                    </div>
                    <p className="setup-hint">
                        {setupType === 'fixed' 
                            ? '⚡ Quick start with standard arrangement' 
                            : '🎲 Each player places pieces strategically before game starts'}
                    </p>
                </div>

                {playerCount === 2 && (
                    <div className="setup-group">
                        <h3>Game Mode</h3>
                        <div className="option-buttons">
                            <button
                                className={`setup-btn ${gameMode === 'pvp' ? 'active' : ''}`}
                                onClick={() => handleGameModeChange('pvp')}
                            >
                                Human vs Human
                            </button>
                            <button
                                className={`setup-btn ${gameMode === 'pve' ? 'active' : ''}`}
                                onClick={() => handleGameModeChange('pve')}
                            >
                                Human vs AI
                            </button>
                            <button
                                className={`setup-btn ${gameMode === 'eve' ? 'active' : ''}`}
                                onClick={() => handleGameModeChange('eve')}
                            >
                                AI vs AI
                            </button>
                        </div>
                    </div>
                )}

                <div className="setup-group">
                    <h3>Player Settings</h3>
                    {activePlayers.map(({ color, label, emoji }) => {
                        const isAI = playerTypes[color] === 'computer';
                        return (
                            <div key={color} className="player-setting">
                                <div className="player-header">
                                    <span className="player-label">
                                        {emoji} {label}
                                    </span>
                                    <div className="player-type-buttons">
                                        <button
                                            className={`player-type-btn ${playerTypes[color] === 'human' ? 'active' : ''}`}
                                            onClick={() => handlePlayerTypeChange(color, 'human')}
                                        >
                                            Human
                                        </button>
                                        <button
                                            className={`player-type-btn ${isAI ? 'active' : ''}`}
                                            onClick={() => handlePlayerTypeChange(color, 'computer')}
                                        >
                                            AI
                                        </button>
                                    </div>
                                </div>
                                {isAI && (
                                    <div className="difficulty-selector">
                                        <span className="difficulty-label">Difficulty:</span>
                                        <div className="difficulty-buttons">
                                            <button
                                                className={`difficulty-btn difficulty-beginner ${playerDifficulties[color] === 'beginner' ? 'active' : ''}`}
                                                onClick={() => handleDifficultyChange(color, 'beginner')}
                                                title="Random moves"
                                            >
                                                🌱 Beginner
                                            </button>
                                            <button
                                                className={`difficulty-btn difficulty-easy ${playerDifficulties[color] === 'easy' ? 'active' : ''}`}
                                                onClick={() => handleDifficultyChange(color, 'easy')}
                                                title="Greedy (depth 1)"
                                            >
                                                🎯 Easy
                                            </button>
                                            <button
                                                className={`difficulty-btn difficulty-medium ${playerDifficulties[color] === 'medium' ? 'active' : ''}`}
                                                onClick={() => handleDifficultyChange(color, 'medium')}
                                                title="Minimax (depth 2)"
                                            >
                                                ⚔️ Medium
                                            </button>
                                            <button
                                                className={`difficulty-btn difficulty-challenging ${playerDifficulties[color] === 'challenging' ? 'active' : ''}`}
                                                onClick={() => handleDifficultyChange(color, 'challenging')}
                                                title="Minimax + TT (depth 3)"
                                            >
                                                💪 Challenging
                                            </button>
                                            <button
                                                className={`difficulty-btn difficulty-hard ${playerDifficulties[color] === 'hard' ? 'active' : ''}`}
                                                onClick={() => handleDifficultyChange(color, 'hard')}
                                                title="Iterative deepening (depth 4+)"
                                            >
                                                🔥 Hard
                                            </button>
                                            <button
                                                className={`difficulty-btn difficulty-master ${playerDifficulties[color] === 'master' ? 'active' : ''}`}
                                                onClick={() => handleDifficultyChange(color, 'master')}
                                                title="MCTS (2000 simulations)"
                                            >
                                                🏆 Master
                                            </button>
                                            <button
                                                className={`difficulty-btn difficulty-grandmaster ${playerDifficulties[color] === 'grandmaster' ? 'active' : ''}`}
                                                onClick={() => handleDifficultyChange(color, 'grandmaster')}
                                                title="Hybrid MCTS + Minimax"
                                            >
                                                👑 Grandmaster
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {gameMode === 'eve' && playerCount === 2 && (
                    <div className="setup-group">
                        <p style={{ color: '#6a6', fontStyle: 'italic' }}>
                            🤖 Watch two AIs battle! Use Back/Forward to analyze.
                        </p>
                    </div>
                )}

                <button className="start-btn" onClick={handleStart}>
                    Start Game
                </button>
            </div>
        </div>
    );
};
