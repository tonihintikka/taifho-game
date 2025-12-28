# Taifho Game Rules

Based on the original Alga Taifho rule sheets (© 1998 BRIO AB / Educational Insights).

## 1. Goal of the Game

The first player to move all **8 of their pieces** to the **opposite side of the board** (the opponent's starting row) wins. 

- The game also ends if a player is repeatedly blocked from moving their final pieces; in this case, the player with the most progress (leading player) wins.
- **Note:** Corner squares must remain empty - pieces cannot finish there.

## 2. The Board & Pieces

- **Board:** 10x10 Grid (standard chess/checkers size).
- **Pieces:** Each player has 8 pieces:
    - 2 Squares (Neliö)
    - 2 Diamonds (Salmiakki)
    - 2 Triangles (Kolmio)
    - 2 Circles (Pyöreä)

### Starting Setup Phase (Aloitusasettelu)

Before the game begins, each player places their 8 pieces on their starting row:

1. **Free Placement:** Pieces can be placed **in any order the player chooses** on columns 1-8 of their starting row.
2. **Corner Squares Empty:** The corner squares (columns 0 and 9) must remain **empty**.
3. **Simultaneous Setup (optional):** Both players may set up their pieces simultaneously, then reveal.
4. **Strategic Choice:** The initial arrangement is a tactical decision that affects the entire game.

```
    0   1   2   3   4   5   6   7   8   9
  ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐
0 │ X │ ? │ ? │ ? │ ? │ ? │ ? │ ? │ ? │ X │  ← Red's starting row
  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
  │   │   │   │   │   │   │   │   │   │   │
  ...
  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
9 │ X │ ? │ ? │ ? │ ? │ ? │ ? │ ? │ ? │ X │  ← Blue's starting row
  └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘

X = Corner (must be empty)
? = Player chooses which piece to place here
```

### Strategic Considerations for Setup

| Placement | Advantage | Disadvantage |
|-----------|-----------|--------------|
| Circles in center | Most flexible, can move any direction | High value target |
| Triangles on edges | Safe from diagonal attacks | Limited forward movement |
| Diamonds in center | Good diagonal coverage | Cannot move orthogonally |
| Squares on edges | Good for straight-line advances | Cannot move diagonally |

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

On the starting row, a player may move their piece **horizontally** as long as they haven't moved it off the starting row yet. This helps unblock pieces at the start.

### Corner and Edge Square Restrictions

- **Corner squares (0,0), (9,0), (0,9), (9,9):** Can only be used **during jumps** (passing through). Pieces cannot end their move on corner squares.
- **Edge columns (0 and 9):** Can only be used temporarily during jump sequences. Pieces cannot end their move on edge columns.

## 4. Advanced Rules (Verified from Rulebook)

### The "Leap" (Loikka)

A "Leap" is a long, symmetric jump over a piece.

- **Condition:** There must be an equal number of **empty squares** before and after the obstacle piece.
- **Example:** [My Piece] - [Empty] - [Empty] - [Obstacle] - [Empty] - [Empty] - [Target Square]
- The path must be clear (except for the obstacle piece).
- This counts as one move. It can be part of a chain if subsequent moves are also valid.
- Each piece must follow its own movement pattern for leaps.

### Opponent Circle Disruption

- **Condition:** If you jump over an **opponent's Circle** with **your own Circle**.
- **Effect:** You may immediately move the opponent's jumped Circle back to **any empty square on the opponent's starting row**.
- This rule only applies to Circle-vs-Circle jumps.
- **Exceptions:** 
  - Cannot move it if it's already on the starting row
  - Cannot move it if it has reached the goal (your starting row)

## 5. Winning

- **Race:** First player to get all 8 pieces to the opponent's starting row (columns 1-8) wins.
- **Corner squares must be empty** - only columns 1-8 count as goal squares.
- **Blocked Victory:** If the leading player's last piece is repeatedly blocked, the leader wins.

## 6. Four-Player Variant

In the 4-player version:
- Each player has **6 pieces** (no circles, or reduced set)
- Players occupy all four sides of the board
- Goal is to reach the **opposite side**
- Game continues until **three players** have finished (1st, 2nd, 3rd place)
- The remaining player is 4th place
