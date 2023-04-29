import React from 'react';
import "./Piece.css";

export interface PieceProps {
  pieceType: string;
  color: string;
}

const Piece: React.FC<PieceProps> = ({ pieceType, color }) => {
  return (
    <div
      className={`piece piece-${pieceType}`}
      style={{ backgroundColor: color }}
    />
  );
};

export default Piece;
