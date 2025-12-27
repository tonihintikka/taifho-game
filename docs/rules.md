# Taifho Game Rules

Based on the original Alga Taifho rule sheets.

## 1. Goal of the Game
The first player to move all **8 of their pieces** to the **opposite side of the board** (the opponent's starting row) wins. 
- The game also ends if a player is repeatedly blocked from moving their final pieces; in this case, the player with the most progress (leading player) wins.

## 2. The Board & Pieces
- **Board:** 10x10 Grid (standard chess/checkers size).
- **Pieces:** Each player has 8 pieces:
    - 2 Squares (Neliö)
    - 2 Diamonds (Salmiakki)
    - 2 Triangles (Kolmio)
    - 2 Circles (Pyöreä)
- **Starting Position:** Pieces are placed on the first row of each player's side.

## 3. Movement Rules
Players take turns moving one piece at a time.
- **Normal Move:** 1 step to an adjacent empty square.
- **Jump:** Jump over an adjacent piece (own or opponent's) to an empty square immediately behind it.
- **Chain Jump (Sarjahyppy):** Multiple jumps allowed in one turn.
- **Movement Direction:** Depends on the piece type.

### Piece Movement Models
All moves (steps and jumps) must follow the piece's allowable directions:

| Piece | Symbol | Allowed Directions |
|-------|--------|-------------------|
| **Square** (Neliö) | ■ | **Orthogonal:** Forward, Backward, Left, Right (Vertical & Horizontal) |
| **Diamond** (Salmiakki) | ◆ | **Diagonal:** Forward-Left, Forward-Right, Backward-Left, Backward-Right |
| **Triangle** (Kolmio) | ▲ | **Mixed:** Diagonally Forward (Left/Right) OR Straight Backward |
| **Circle** (Pyöreä) | ● | **Any Direction:** All 8 directions (Orthogonal + Diagonal) |

*Note on Triangles:* They cannot move Straight Forward or Diagonally Backward.

### Special Starting Row Rule
On the starting row, a player may move their piece **horizontally** as long as they haven't moved it off the starting row yet. (This seems to apply to all pieces to help unblock them).

## 4. Advanced Rules (Verified from Rulebook)

### The "Leap" (Loikka)
A "Leap" is a long, symmetric jump over a piece.
- **Condition:** There must be an equal number of **empty squares** before and after the obstacle piece.
- **Example:** [My Piece] - [Empty] - [Empty] - [Obstacle] - [Empty] - [Empty] - [Target Square]
- The path must be clear (except for the obstacle piece).
- This counts as one move. It can be part of a chain if subsequent moves are also valid.

### Opponent Circle Disruption
- **Condition:** If you jump over an **opponent's Circle** with **your own Circle**.
- **Effect:** You may immediately move the opponent's jumped Circle back to **any empty square on the opponent's starting row**.
- This rule only applies to Circle-vs-Circle jumps.
- Exceptions: Cannot move it if it's already on the starting row or if it has reached the goal (your starting row).

## 5. Winning
- **Race:** First player to occupy the entire furthest row (opponent's starting row) with their 8 pieces wins.
