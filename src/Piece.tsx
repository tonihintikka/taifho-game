import React from "react";

export interface PieceProps {
  player: string;
  pieceType: string;
  color: string;
  className: string;
  coordinate: string;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, coordinate: string, player: string) => void;
  onMove: (from: string, to: string) => void;
}

const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, coordinate: string, player: string) => {
  e.currentTarget.dataset.touchIdentifier = String(e.targetTouches[0].identifier);
  console.log('Moving a', player, 'piece');
};

const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>, coordinate: string, onMove: PieceProps['onMove']) => {
  const touch = Array.from(e.changedTouches).find(t => t.identifier.toString() === e.currentTarget.dataset.touchIdentifier);
  if (!touch) return;

  const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
  const targetCell = targetElement?.closest('.cell');
  if (!targetCell) return;

  const to = targetCell.getAttribute('data-coordinate');
  if (!to) return;

  if (coordinate === to) {
    console.log("Dropping on the same square, ignoring.");
    return;
  }

  console.log("handleTouchEnd called with:", to);
  onMove(coordinate, to);
};

const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
  e.preventDefault();
};

const Piece: React.FC<PieceProps> = ({ player, pieceType, color, className, coordinate, onDragStart, onMove }) => {
  return (
    <div
      className="draggable-area"
      draggable
      onDragStart={(e: React.DragEvent<HTMLDivElement>) => onDragStart(e, coordinate, player)}
      onTouchStart={(e: React.TouchEvent<HTMLDivElement>) => handleTouchStart(e, coordinate, player)}
      onTouchMove={handleTouchMove}
      onTouchEnd={(e: React.TouchEvent<HTMLDivElement>) => handleTouchEnd(e, coordinate, onMove)}
    >
      <div className={`piece ${color} ${className}`}>
        <span className="piece-symbol">{pieceType}</span>
      </div>
    </div>
  );
};

export default Piece;
