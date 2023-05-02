import React, { useState } from "react";
import "./App.css";
import Board, { createInitialBoardState } from "./Board";
import { startingPositions } from "./startingPositions";

const App: React.FC = () => {
  const initialBoardState = createInitialBoardState(startingPositions, 10, 10);
  const [boardState, setBoardState] = useState(initialBoardState);

  const handleMove = (from: string, to: string) => {
    console.log("handleMove called with:", from, to);
    const fromX = from.charCodeAt(0) - "a".charCodeAt(0);
    const fromY = 10 - parseInt(from.slice(1), 10);
const toX = to.charCodeAt(0) - "a".charCodeAt(0);
const toY = 10 - parseInt(to.slice(1), 10); // Change to[to.length - 1] to to.slice(1)


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
