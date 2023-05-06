import React, { useEffect, useRef } from "react";
import "./App.css";
import Piece, { PieceProps } from "./Piece";
import { startingPositions } from "./startingPositions";

interface BoardProps {
  boardState: (PieceProps | null)[][];
  onMove: (from: string, to: string) => void;
}

const handleDragStart = (e: React.DragEvent<HTMLDivElement>, coordinate: string, player: string) => {
  e.dataTransfer.setData("text/plain", coordinate);
  console.log('Moving a', player, 'piece');
};

const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
};

const handleDrop = (e: React.DragEvent<HTMLDivElement>, coordinate: string, onMove: BoardProps['onMove']) => {
  e.preventDefault();
  e.stopPropagation();
  const from = e.dataTransfer.getData("text");
  const to = coordinate;

  if (from === to) {
    console.log("Dropping on the same square, ignoring.");
    return;
  }

  console.log("handleDrop called with:", coordinate);
  onMove(from, to);
};


const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
};

const Board: React.FC<BoardProps> = ({ boardState, onMove }) => {
  const rows = 10;
  const cols = 10;
  const touchStartRef = useRef({ clientX: 0, clientY: 0 });
  const touchEndRef = useRef({ clientX: 0, clientY: 0 });

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartRef.current = { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndRef.current = { clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY };
  };

  useEffect(() => {
    const boardElement = document.querySelector<HTMLElement>(".board");
    if (boardElement) {
      boardElement.addEventListener("touchstart", (e: TouchEvent) => {
        e.preventDefault();
      }, { passive: false });
      boardElement.addEventListener("touchmove", (e: TouchEvent) => {
        e.preventDefault();
      }, { passive: false });
    }
  }, []);
  


  function pieceColor(piece: string): string {
    return piece[0] === "r" ? "red" : "blue";
  }

  function pieceShape(piece: string): string {
    switch (piece[1]) {
      case "T":
        return "piece-triangle";
      case "S":
        return "piece-square";
      case "C":
        return "piece-circle";
      case "R":
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
    onDragStart={(e: React.DragEvent<HTMLDivElement>) => handleDragStart(e, coordinate, player)}
  />
          );
        }

        cells.push(
          <div
            className={classNames.join(" ")}
            key={`cell-${x}-${y}`}
            onDrop={(e) => handleDrop(e, coordinate, onMove)}
            onDragOver={handleDragOver}
          >
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

