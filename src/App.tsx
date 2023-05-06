import React, { useState } from "react";
import "./App.css";
import Board, { createInitialBoardState } from "./Board";
import { startingPositions } from "./startingPositions";
import {canJumpOver} from "./gameLogic"

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
  if (movingPiece.pieceType === "S") { // Neliö
    const xDiff = Math.abs(toX - fromX);
    const yDiff = Math.abs(toY - fromY);
  
    // Tarkista, onko siirto vain yhden askeleen päässä sivuttain tai pystysuunnassa
    if ((xDiff === 1 && yDiff === 0) || (xDiff === 0 && yDiff === 1)) {
      // Normaali liike
    } else if (xDiff === 2 && yDiff === 0 && canJumpOver(boardState, fromX, fromY, toX, toY)) {
      // Sivuttainen hyppy
    } else if (xDiff === 0 && yDiff === 2 && canJumpOver(boardState, fromX, fromY, toX, toY)) {
      // Pystyhyppy
    } else {
      console.log("Neliö voi liikkua vain yhden askeleen sivuttain tai pystysuunnassa, tai hypätä yhden nappulan yli samalla suunnalla.");
      return;
    }
  }
  if (movingPiece.pieceType === "T") { // Kolmio
    const xDiff = toX - fromX;
    const yDiff = toY - fromY;
  
    // Sallitut liikkumissuunnat eri pelaajille
    const validMovesRed = [
      { x: 0, y: -1 }, // Etelään
      { x: -1, y: 1 }, // Luoteeseen
      { x: 1, y: 1 }   // Koilliseen
    ];
  
    const validMovesBlue = [
      { x: 0, y: 1 },  // Pohjoiseen
      { x: -1, y: -1 }, // Lounaaseen
      { x: 1, y: -1 }   // Kaakkoon
    ];
  
    const validMoves = movingPiece.color === "red" ? validMovesRed : validMovesBlue;
  
    const isValidMove = validMoves.some(move => move.x === xDiff && move.y === yDiff);
  
    if (!isValidMove) {
      console.log("Kolmio voi liikkua vain yhden askeleen taakse tai vinottain eteen.");
      return;
    }
  
    // Tarkista, voiko kolmio hypätä nappulan yli, jos siirto on hypyn päässä
    if (Math.abs(xDiff) === 2 || Math.abs(yDiff) === 2) {
      if (!canJumpOver(boardState, fromX, fromY, toX, toY)) {
        console.log("Kolmio voi hypätä nappulan yli vain, jos ylihypättävän nappulan takana on tyhjä ruutu.");
        return;
      }
    } else if (boardState[toY][toX] !== null) {
      // Estä siirto, jos kohderuudussa on toinen nappula eikä kyseessä ole hyppy
      console.log("Kohderuudussa on jo nappula, eikä siirto ole hyppy.");
      return;
    }
  }
  if (movingPiece.pieceType === "R") { // Timantti
    const xDiff = toX - fromX;
    const yDiff = toY - fromY;
  
    // Sallitut liikkumissuunnat: vinottain yksi askel
    const validMoves = [
      { x: -1, y: -1 }, // Luoteeseen
      { x: 1, y: -1 },  // Koilliseen
      { x: -1, y: 1 },  // Lounaaseen
      { x: 1, y: 1 }    // Kaakkoon
    ];
  
    const isValidMove = validMoves.some(move => move.x === xDiff && move.y === yDiff);
  
    if (!isValidMove) {
      console.log("Timantti voi liikkua vain yhden askeleen vinottain.");
      return;
    }
  
    /* Tarkista, voiko timantti hypätä nappulan yli
    if (!canJumpOver(boardState, fromX, fromY, toX, toY)) {
      console.log("Timantti voi hypätä nappulan yli vain, jos ylihypättävän nappulan takana on tyhjä ruutu.");
      return;
    }*/
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
