import React from "react";

export interface PieceProps {
  player: string;
  pieceType: string;
  color: string;
  className: string;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
}


const Piece: React.FC<PieceProps> = ({ pieceType, color, className, onDragStart}) => {
  return (
    <div
      className="draggable-area"
      draggable
      onDragStart={onDragStart}
    >
      <div className={`piece ${color} ${className}`}>
        <span className="piece-symbol">{pieceType}</span>
      </div>
    </div>
  );
};

export default Piece;
