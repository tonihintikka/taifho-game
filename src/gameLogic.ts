import Piece, { PieceProps } from "./Piece";

export const canJumpOver = (
    boardState: (PieceProps | null)[][],
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ) => {
    const xDiff = toX - fromX;
    const yDiff = toY - fromY;
  
    const midX = Math.round(fromX + xDiff / 2);
    const midY = Math.round(fromY + yDiff / 2);

  
    // Tarkista, etteivät koordinaatit mene laudan ulkopuolelle
    if (midX < 0 || midX >= boardState[0].length || midY < 0 || midY >= boardState.length) {
      return false;
    }
  
    // Tarkista, että väliin jäävä ruutu sisältää nappulan
    if (boardState[midY][midX] === null) {
      return false;
    }
  
    // Tarkista, että kohderuutu on tyhjä
    if (boardState[toY][toX] !== null) {
      return false;
    }
  
    // Tarkista, että siirto on joko suora tai vinottainen
    const isStraight = Math.abs(xDiff) === Math.abs(yDiff) || xDiff === 0 || yDiff === 0;
    const isJump = Math.abs(xDiff) === 2 || Math.abs(yDiff) === 2;
  
    return isStraight && isJump;
  };
  
  

export const handleMove = (
  boardState: (PieceProps | null)[][],
  setBoardState: React.Dispatch<React.SetStateAction<(PieceProps | null)[][]>>,
  from: string,
  to: string
) => {
  console.log("handleMove called with:", from, to);
  const fromX = from.charCodeAt(0) - "a".charCodeAt(0);
  const fromY = 10 - parseInt(from.slice(1), 10);
  const toX = to.charCodeAt(0) - "a".charCodeAt(0);
  const toY = 10 - parseInt(to.slice(1), 10);

  // Tarkista, onko kohderuudussa jo nappula
  if (boardState[toY][toX] !== null) {
    console.log("Cannot move to a non-empty square.");
    return;
  }
  const movingPiece = boardState[fromY][fromX];
 // Tarkista, onko movingPiece null
 if (!movingPiece) {
    console.log("Cannot move a non-existent piece.");
    return;
  }


  if (movingPiece.pieceType === "C") {
    // Ympyrä
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
