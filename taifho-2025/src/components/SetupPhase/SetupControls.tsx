import React from 'react';
import './SetupPhase.css';

interface SetupControlsProps {
    canConfirm: boolean;
    onClear: () => void;
    onRandomize: () => void;
    onConfirm: () => void;
    piecesRemaining: number;
}

export const SetupControls: React.FC<SetupControlsProps> = ({
    canConfirm,
    onClear,
    onRandomize,
    onConfirm,
    piecesRemaining,
}) => {
    return (
        <div className="setup-controls">
            <button 
                className="setup-btn clear-btn"
                onClick={onClear}
                title="Palauta kaikki nappulat alkupaikkaan"
            >
                🗑️ Tyhjennä
            </button>
            
            <button 
                className="setup-btn randomize-btn"
                onClick={onRandomize}
                title="Aseta nappulat satunnaiseen järjestykseen"
            >
                🎲 Arvo
            </button>
            
            <button 
                className={`setup-btn confirm-btn ${canConfirm ? 'ready' : 'disabled'}`}
                onClick={onConfirm}
                disabled={!canConfirm}
                title={canConfirm ? 'Vahvista asettelu' : `Aseta vielä ${piecesRemaining} nappulaa`}
            >
                {canConfirm ? '✅ Vahvista' : `⏳ ${piecesRemaining} jäljellä`}
            </button>
        </div>
    );
};

