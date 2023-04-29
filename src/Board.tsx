import React from "react";
import "./App.css";
import Piece, { PieceProps } from "./Piece";
import { startingPositions, StartingPositions } from "./startingPositions";

interface BoardProps {
  boardState: (PieceProps | null)[][];
  onMove: (from: string, to: string) => void;
}

const Board: React.FC<BoardProps> = ({ boardState, onMove }) => {
  const rows = 10;
  const cols = 10;

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
          piece = <Piece pieceType={pieceData.pieceType} color={pieceData.color} />;

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
  startingPositions: StartingPositions,
  rows: number,
  cols: number
) => {
  const boardState: any[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => null)
  );

  for (const player in startingPositions) {
    const positions = startingPositions[player].positions;
    const color = startingPositions[player].color;
    for (const coordinate in positions) {
      const x = coordinate.charCodeAt(0) - "a".charCodeAt(0);
      const y = 9 - (parseInt(coordinate[1], 10) - 1);
      boardState[y][x] = {
        player: player,
        pieceType: positions[coordinate], // Muutetaan 'type' -> 'pieceType'
        color: color,
      };
    }
  }

  return boardState;
};


export default Board;
