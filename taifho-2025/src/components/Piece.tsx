import React from 'react';
import clsx from 'clsx';
import type { Piece as PieceType } from '../types/game';
import './Piece.css';

interface PieceProps {
    piece: PieceType;
    isSelected?: boolean;
    onClick?: () => void;
}

export const Piece: React.FC<PieceProps> = ({ piece, isSelected, onClick }) => {
    const { type, color } = piece;

    return (
        <div
            className={clsx('piece', color, { selected: isSelected })}
            onClick={onClick}
        >
            {/* Simple SVG shapes for now */}
            <svg viewBox="0 0 100 100" className="piece-icon">
                {type === 'circle' && <circle cx="50" cy="50" r="40" />}
                {type === 'square' && <rect x="10" y="10" width="80" height="80" />}
                {type === 'triangle' && <polygon points="50,15 90,85 10,85" />}
                {type === 'diamond' && <polygon points="50,10 90,50 50,90 10,50" />}
            </svg>
        </div>
    );
};
