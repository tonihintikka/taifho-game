import React from "react";

export interface PieceProps {
  player: string;
  pieceType: string;
  color: string;
  className: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
}

const Piece: React.FC<PieceProps> = ({ pieceType, color, className }) => {
  return (
    <div className={`piece ${color} ${className}`}>
      <span className="piece-symbol">{pieceType}</span>
    </div>
  );
};

export default Piece;
