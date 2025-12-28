import React, { useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { UnplacedPieces } from './UnplacedPieces';
import { SetupBoard } from './SetupBoard';
import { SetupControls } from './SetupControls';
import './SetupPhase.css';

/**
 * Get player name in Finnish
 */
const getPlayerName = (color: string): string => {
    switch (color) {
        case 'red': return 'Punainen';
        case 'blue': return 'Sininen';
        case 'yellow': return 'Keltainen';
        case 'green': return 'Vihreä';
        default: return color;
    }
};

export const SetupPhase: React.FC = () => {
    const {
        phase,
        setup,
        board,
        gameConfig,
        selectSetupPiece,
        placeSetupPiece,
        removeSetupPiece,
        clearSetup,
        randomizeSetup,
        confirmSetup,
        performAISetup,
    } = useGameStore();

    const { setupPlayer, unplacedPieces, selectedSetupPiece, confirmedPlayers } = setup;

    // Check if current setup player is AI
    const isAI = setupPlayer ? gameConfig.playerTypes[setupPlayer] === 'computer' : false;
    const is4Player = gameConfig.playerCount === 4;

    // Trigger AI setup when it's AI's turn
    useEffect(() => {
        if (phase === 'setup' && setupPlayer && isAI) {
            performAISetup();
        }
    }, [phase, setupPlayer, isAI, performAISetup]);

    // Don't render if not in setup phase
    if (phase !== 'setup' || !setupPlayer) {
        return null;
    }

    const piecesRemaining = unplacedPieces[setupPlayer]?.length ?? 0;
    const canConfirm = piecesRemaining === 0;

    // Show waiting message for AI
    if (isAI) {
        return (
            <div className="setup-phase ai-setup">
                <div className="setup-header">
                    <h2>🤖 {getPlayerName(setupPlayer)} asettaa nappulat...</h2>
                    <div className="ai-thinking">
                        <span className="spinner"></span>
                        <span>Tekoäly miettii strategiaansa</span>
                    </div>
                </div>
                <SetupBoard
                    board={board}
                    setupPlayer={setupPlayer}
                    selectedPiece={null}
                    onPlacePiece={() => {}}
                    onRemovePiece={() => {}}
                    is4Player={is4Player}
                />
            </div>
        );
    }

    return (
        <div className="setup-phase">
            <div className="setup-header">
                <h2 className={`player-title ${setupPlayer}`}>
                    {getPlayerName(setupPlayer)} - Aseta nappulat
                </h2>
                <p className="setup-progress">
                    {confirmedPlayers.length}/{gameConfig.players.length} pelaajaa valmiina
                </p>
            </div>

            <UnplacedPieces
                pieces={unplacedPieces[setupPlayer] ?? []}
                selectedPiece={selectedSetupPiece}
                onSelectPiece={selectSetupPiece}
                playerColor={setupPlayer}
            />

            <SetupBoard
                board={board}
                setupPlayer={setupPlayer}
                selectedPiece={selectedSetupPiece}
                onPlacePiece={placeSetupPiece}
                onRemovePiece={removeSetupPiece}
                is4Player={is4Player}
            />

            <SetupControls
                canConfirm={canConfirm}
                onClear={clearSetup}
                onRandomize={randomizeSetup}
                onConfirm={confirmSetup}
                piecesRemaining={piecesRemaining}
            />

            <div className="setup-info">
                <h4>📋 Ohjeet:</h4>
                <ul>
                    <li>Valitse nappula yläpuolelta klikkaamalla</li>
                    <li>Aseta nappula tyhjään ruutuun laudalla</li>
                    <li>Klikkaa asetettua nappulaa palauttaaksesi sen</li>
                    <li>Kulmaruudut (0 ja 9) ovat kiellettyjä</li>
                    <li>Kun kaikki 8 nappulaa on asetettu, paina "Vahvista"</li>
                </ul>
            </div>
        </div>
    );
};

export default SetupPhase;

