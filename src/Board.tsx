import React from "react";
import "./App.css";
import Piece from "./Piece";

const Board: React.FC = () => {
  const rows = 10;
  const cols = 10;

  const renderBoard = () => {
    const cells = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const isWhiteBorder = (x === 0 || x === cols - 1 || y === 0 || y === rows - 1);
        const cellId = y % 2 === 0 ? (x % 2 === 0 ? "even" : "odd") : (x % 2 === 0 ? "odd" : "even");
        const classNames = ["cell"];

        if (isWhiteBorder) {
          classNames.push("white-border");
        } else {
          classNames.push(`cell-${cellId}`);
        }

        cells.push(
          <div className={classNames.join(" ")} key={`cell-${x}-${y}`}>
            {/* Lisää pelinappulat tähän. Esimerkiksi: <Piece pieceType="triangle" /> */}
          </div>
        );
      }
    }
    return cells;
  };

  return <div className="board">{renderBoard()}</div>;
};

export default Board;

