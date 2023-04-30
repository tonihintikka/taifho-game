import React from "react";

export interface PieceProps {
  pieceType: string;
  color: string;
  player: string;
  className: string;
}

const Piece: React.FC<PieceProps> = ({ pieceType, color, className }) => {
  return (
    <div className={`piece ${color} ${className}`}>
      <span className="piece-symbol">{pieceType}</span>
    </div>
  );
};

export default Piece;
