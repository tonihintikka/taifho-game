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
  // Tarkista, onko kohderuudussa jo nappula
  if (boardState[toY][toX] !== null) {
    console.log("Cannot move to a non-empty square.");
    return;
  }
  const movingPiece = boardState[fromY][fromX];
  if (movingPiece.pieceType === "C") { // Ympyrä
    const xDiff = Math.abs(toX - fromX);
    const yDiff = Math.abs(toY - fromY);

    // Tarkista, onko siirto vain yhden askeleen päässä
    if (xDiff > 1 || yDiff > 1 || (xDiff === 0 && yDiff === 0)) {
      console.log("Ympyrä voi liikkua vain yhden askeleen mihin tahansa suuntaan.");
      return;
    }
  }


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
