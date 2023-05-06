export type StartingPosition = (string | null)[][];

export const startingPositions: StartingPosition = [
  [null, "rS", "rR", "rT", "rR", "rS", "rC", "rS", "rT", null],
  ["yT", null, null, null, null, null, null, null, null, "gS"],
  ["yS", null, null, null, null, null, null, null, null, "gR"],
  ["yC", null, null, null, null, null, null, null, null, "gT"],
  ["yS", null, null, null, null, null, null, null, null, "gR"],
  ["yR", null, null, null, null, null, null, null, null, "gS"],
  ["yT", null, null, null, null, null, null, null, null, "gC"],
  ["yR", null, null, null, null, null, null, null, null, "gS"],
  ["yS", null, null, null, null, null, null, null, null, "gT"],
  [null, "bT", "bS", "bC", "bS", "bR", "bT", "bR", "bC", null],
];
