import React from "react";
import "./App.css";
import Piece from "./Piece";
import { moveTriangle, moveSquare, moveCircle, moveDiamond } from "./moveLogic";


const Board: React.FC = () => {
  const rows = 10;
  const cols = 10;

  interface StartingPositions {
    [key: string]: {
      color: string;
      positions: { [key: string]: string };
    };
  }

  const startingPositions: StartingPositions = {
    player1: {
      color: "red",
      positions: {
        b10: "triangle",
        c10: "square",
        d10: "circle",
        e10: "square",
        f10: "diamond",
        g10: "triangle",
        h10: "diamond",
        i10: "circle",
      },
    },
    player2: {
      color: "blue",
      positions: {
        i1: "triangle",
        h1: "square",
        g1: "circle",
        f1: "square",
        e1: "diamond",
        d1: "triangle",
        c1: "diamond",
        b1: "circle",
      },
    },
  };
  const createInitialBoardState = (
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
          type: positions[coordinate],
          color: color,
        };
      }
    }
  
    return boardState;
  };
  


  const renderBoard = () => {
    const cells = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cellId = y % 2 === 0 ? (x % 2 === 0 ? "even" : "odd") : (x % 2 === 0 ? "odd" : "even");
        const classNames = ["cell"];
        classNames.push(`cell-${cellId}`);

        const coordinate = String.fromCharCode(97 + x) + (10 - y);

        let piece = null;
        for (const player in startingPositions) {
          const positions = startingPositions[player].positions;
          const color = startingPositions[player].color;
          if (positions[coordinate]) {
            piece = <Piece pieceType={positions[coordinate]} color={color} />;
          }
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

export default Board;

