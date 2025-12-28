import React from 'react';
import type { Piece, PlayerColor } from '../../types/game';
import { getStartingRow, getStartingColumn } from '../../types/game';
import { BOARD_SIZE } from '../../utils/boardUtils';
import './SetupPhase.css';

interface SetupBoardProps {
    board: (Piece | null)[][];
    setupPlayer: PlayerColor;
    selectedPiece: Piece | null;
    onPlacePiece: (column: number) => void;
    onRemovePiece: (column: number) => void;
    is4Player: boolean;
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
 * Check if a cell is a valid placement slot for current player
 */
const isValidPlacementSlot = (
    row: number,
    col: number,
    setupPlayer: PlayerColor,
    is4Player: boolean
): boolean => {
    if (setupPlayer === 'yellow') {
        return col === 0 && row >= 2 && row <= 7;
    }
    if (setupPlayer === 'green') {
        return col === 9 && row >= 2 && row <= 7;
    }
    // Red or Blue
    const playerRow = getStartingRow(setupPlayer);
    if (row !== playerRow) return false;
    if (is4Player) {
        return col >= 2 && col <= 7;
    }
    return col >= 1 && col <= 8;
};

/**
 * Check if a cell is a corner (forbidden)
 */
const isCorner = (row: number, col: number): boolean => {
    return (row === 0 || row === 9) && (col === 0 || col === 9);
};

export const SetupBoard: React.FC<SetupBoardProps> = ({
    board,
    setupPlayer,
    selectedPiece,
    onPlacePiece,
    onRemovePiece,
    is4Player,
}) => {
    const handleCellClick = (row: number, col: number) => {
        const piece = board[row][col];
        
        // For side players (4P), the "column" is actually the row index
        const slotIndex = (setupPlayer === 'yellow' || setupPlayer === 'green') ? row : col;
        
        if (piece && piece.color === setupPlayer) {
            // Remove existing piece
            onRemovePiece(slotIndex);
        } else if (!piece && selectedPiece && isValidPlacementSlot(row, col, setupPlayer, is4Player)) {
            // Place selected piece
            onPlacePiece(slotIndex);
        }
    };

    const renderCell = (row: number, col: number) => {
        const piece = board[row][col];
        const isValid = isValidPlacementSlot(row, col, setupPlayer, is4Player);
        const isCornerCell = isCorner(row, col);
        const isEmpty = !piece;
        const isOwnPiece = piece?.color === setupPlayer;
        
        let cellClass = 'setup-cell';
        if (isCornerCell) cellClass += ' corner';
        if (isValid && isEmpty && selectedPiece) cellClass += ' valid-slot';
        if (isValid && isEmpty && !selectedPiece) cellClass += ' empty-slot';
        if (isOwnPiece) cellClass += ' own-piece clickable';
        if (piece) cellClass += ` ${piece.color}`;
        
        return (
            <div
                key={`${row}-${col}`}
                className={cellClass}
                onClick={() => handleCellClick(row, col)}
                title={
                    isCornerCell 
                        ? 'Kulma - ei sallittu' 
                        : isOwnPiece 
                            ? 'Klikkaa palauttaaksesi' 
                            : isValid && selectedPiece 
                                ? 'Klikkaa asettaaksesi' 
                                : ''
                }
            >
                {piece && (
                    <span className={`cell-piece ${piece.color}`}>
                        {getPieceSymbol(piece.type)}
                    </span>
                )}
                {isCornerCell && <span className="corner-x">✕</span>}
                {isValid && isEmpty && selectedPiece && (
                    <span className="placement-hint">+</span>
                )}
            </div>
        );
    };

    // Highlight the starting row/column for current player
    const playerRow = getStartingRow(setupPlayer);
    const playerCol = getStartingColumn(setupPlayer);

    return (
        <div className="setup-board-container">
            <div className="setup-board">
                {/* Column headers */}
                <div className="board-row header-row">
                    <div className="cell-header corner-header"></div>
                    {Array.from({ length: BOARD_SIZE }, (_, i) => (
                        <div key={i} className="cell-header">{i}</div>
                    ))}
                </div>
                
                {/* Board rows */}
                {Array.from({ length: BOARD_SIZE }, (_, row) => (
                    <div 
                        key={row} 
                        className={`board-row ${row === playerRow ? 'active-row' : ''}`}
                    >
                        <div className="cell-header">{row}</div>
                        {Array.from({ length: BOARD_SIZE }, (_, col) => (
                            <div
                                key={col}
                                className={col === playerCol ? 'active-column-wrapper' : ''}
                            >
                                {renderCell(row, col)}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            
            <div className="board-legend">
                <span className="legend-item">
                    <span className="corner-x">✕</span> Kulma (kielletty)
                </span>
                <span className="legend-item">
                    <span className="placement-hint">+</span> Vapaa paikka
                </span>
            </div>
        </div>
    );
};

