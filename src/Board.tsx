import React from "react";
import "./App.css";
import Piece, { PieceProps } from "./Piece";
import { startingPositions } from "./startingPositions";

interface BoardProps {
  boardState: (PieceProps | null)[][];
  onMove: (from: string, to: string) => void;
}

const Board: React.FC<BoardProps> = ({ boardState, onMove }) => {
  const rows = 10;
  const cols = 10;

  function pieceColor(piece: string): string {
    return piece[0] === "r" ? "red" : "blue";
  }

  function pieceShape(piece: string): string {
    switch (piece[1]) {
      case "S":
        return "piece-triangle";
      case "R":
        return "piece-square";
      case "T":
        return "piece-circle";
      case "C":
        return "piece-diamond";
      default:
        return "";
    }
  }
  

  const renderBoard = () => {
    const cells = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cellId = y % 2 === 0 ? (x % 2 === 0 ? "even" : "odd") : (x % 2 === 0 ? "odd" : "even");
        const classNames = ["cell"];
        classNames.push(`cell-${cellId}`);

        const coordinate = String.fromCharCode(97 + x) + (10 - y);
        const pieceData = boardState[y][x];
        let piece = null;

        if (pieceData) {
          const { player, pieceType, color } = pieceData;
          const pieceCode = player + pieceType;
          const pieceShapeClassName = pieceShape(pieceCode);
          piece = (
            <Piece
              player={player}
              pieceType={pieceType}
              color={color}
              className={pieceShapeClassName}
            />
          );
          
        }

        cells.push(
          <div className={classNames.join(" ")} key={`cell-${x}-${y}`}>
            {piece}
          </div>
        );
      }
    }
    return cells;
  };

  return <div className="board">{renderBoard()}</div>;
};

export const createInitialBoardState = (
  startingPositions: (string | null)[][],
  rows: number,
  cols: number
) => {
  const boardState: any[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => null)
  );

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const pieceData = startingPositions[y][x];
      if (pieceData) {
        const player = pieceData[0];
        const pieceType = pieceData.substring(1);
        const color = player === "r" ? "red" : "blue";
        boardState[y][x] = {
          player: player,
          pieceType: pieceType,
          color: color,
        };
      }
    }
  }

  return boardState;
};

export default Board;

