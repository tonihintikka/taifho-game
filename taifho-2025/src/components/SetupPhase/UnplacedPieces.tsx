import React from 'react';
import type { Piece } from '../../types/game';
import './SetupPhase.css';

interface UnplacedPiecesProps {
    pieces: Piece[];
    selectedPiece: Piece | null;
    onSelectPiece: (piece: Piece) => void;
    playerColor: string;
}

/**
 * Get piece symbol for display
 */
const getPieceSymbol = (type: Piece['type']): string => {
    switch (type) {
        case 'circle': return '●';
        case 'square': return '■';
        case 'triangle': return '▲';
        case 'diamond': return '◆';
    }
};

/**
 * Get piece name in Finnish
 */
const getPieceName = (type: Piece['type']): string => {
    switch (type) {
        case 'circle': return 'Pyöreä';
        case 'square': return 'Neliö';
        case 'triangle': return 'Kolmio';
        case 'diamond': return 'Salmiakki';
    }
};

export const UnplacedPieces: React.FC<UnplacedPiecesProps> = ({
    pieces,
    selectedPiece,
    onSelectPiece,
    playerColor,
}) => {
    if (pieces.length === 0) {
        return (
            <div className="unplaced-pieces empty">
                <p className="all-placed">✅ Kaikki nappulat asetettu!</p>
            </div>
        );
    }

    // Group pieces by type for better display
    const groupedPieces: Record<string, Piece[]> = {};
    pieces.forEach(piece => {
        if (!groupedPieces[piece.type]) {
            groupedPieces[piece.type] = [];
        }
        groupedPieces[piece.type].push(piece);
    });

    return (
        <div className="unplaced-pieces">
            <h3 className="tray-title">Asettamattomat nappulat</h3>
            <div className="pieces-tray">
                {Object.entries(groupedPieces).map(([type, typePieces]) => (
                    <div key={type} className="piece-group">
                        <span className="piece-type-label">{getPieceName(type as Piece['type'])}</span>
                        <div className="piece-buttons">
                            {typePieces.map(piece => (
                                <button
                                    key={piece.id}
                                    className={`tray-piece ${playerColor} ${selectedPiece?.id === piece.id ? 'selected' : ''}`}
                                    onClick={() => onSelectPiece(piece)}
                                    title={`${getPieceName(piece.type)} - Klikkaa valitaksesi`}
                                >
                                    <span className="piece-symbol">
                                        {getPieceSymbol(piece.type)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <p className="instruction">
                {selectedPiece 
                    ? `Valittu: ${getPieceName(selectedPiece.type)} - Klikkaa tyhjää ruutua laudalla`
                    : 'Klikkaa nappulaa valitaksesi'}
            </p>
        </div>
    );
};

