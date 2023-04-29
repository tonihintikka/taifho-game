import React from "react";
import "./App.css";

interface PieceProps {
  pieceType: string;
}

const Piece: React.FC<PieceProps> = ({ pieceType }) => {
  return <div className={`piece piece-${pieceType}`}>{pieceType[0].toUpperCase()}</div>;
};

export default Piece;
