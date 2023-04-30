import React, { useState } from "react";
import "./App.css";
import Board from "./Board";
import { startingPositions, StartingPositions } from "./startingPositions";

const App: React.FC = () => {
  
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
        const y = parseInt(coordinate[1], 10) - 1;
        boardState[y][x] = {
          player: player,
          pieceType: positions[coordinate],
          color: color,
        };
      }
    }
    console.log(boardState);
    return boardState;
  };

  const initialBoardState = createInitialBoardState(startingPositions, 10, 10);
  const [boardState, setBoardState] = useState(initialBoardState);

  const handleMove = (from: string, to: string) => {
    const fromX = from.charCodeAt(0) - "a".charCodeAt(0);
    const fromY = 9 - (parseInt(from[1], 10) - 1);
    const toX = to.charCodeAt(0) - "a".charCodeAt(0);
    const toY = 9 - (parseInt(to[1], 10) - 1);

    const newBoardState = [...boardState];
    newBoardState[toY][toX] = newBoardState[fromY][fromX];
    newBoardState[fromY][fromX] = null;

    setBoardState(newBoardState);
  };

  return (
    <div className="App">
      <Board boardState={boardState} onMove={handleMove} />
    </div>
  );
};

export default App;
