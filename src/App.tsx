import React, { useState } from "react";
import "./App.css";
import Board, { createInitialBoardState, StartingPositions } from "./Board";

function App() {
  const rows = 10;
  const cols = 10;
  const initialBoardState = createInitialBoardState(StartingPositions, rows, cols);

  const [boardState, setBoardState] = useState(initialBoardState);

  const handleMove = (from: string, to: string) => {
    const fromX = from.charCodeAt(0) - "a".charCodeAt(0);
    const fromY = 9 - (parseInt(from[1], 10) - 1);
    const toX = to.charCodeAt(0) - "a".charCodeAt(0);
    const toY = 9 - (parseInt(to[1], 10) - 1);

    const newBoardState = boardState.map((row) => row.slice());
    newBoardState[toY][toX] = boardState[fromY][fromX];
    newBoardState[fromY][fromX] = null;

    setBoardState(newBoardState);
  };

  return (
    <div className="App">
      <Board boardState={boardState} onMove={handleMove} />
    </div>
  );
}

export default App;
