// startingPositions.ts
export interface StartingPositions {
    [key: string]: {
      color: string;
      positions: { [key: string]: string };
    };
  }
  
  export const startingPositions: StartingPositions = {
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
  