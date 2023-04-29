import React from "react";
import "./App.css";
import Board from "./Board";

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>TAIFHO Game</h1>
      </header>
      <main>
        <Board />
      </main>
    </div>
  );
};

export default App;
