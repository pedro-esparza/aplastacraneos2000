import { GameState } from '../model/GameState';
import { Piece } from '../model/Piece';

const materialValues: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

export function getMaterialValue(piece: Piece): number {
  return materialValues[piece.type] || 0;
}

export function getPositionalValue(piece: Piece, row: number, col: number): number {
  const idx = row * 8 + col;

  switch (piece.type) {
    case 'p':
      return piece.color === 'w'
        ? pawnTableWhite[idx]
        : -pawnTableWhite[63 - idx];
    default:
      return 0;
  }
}

const pawnTableWhite: number[] = [
  0, 0, 0, 0, 0, 0, 0, 0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
  5, 5, 10, 25, 25, 10, 5, 5,
  0, 0, 0, 20, 20, 0, 0, 0,
  5, -5, -10, 0, 0, -10, -5, 5,
  5, 10, 10, -20, -20, 10, 10, 5,
  0, 0, 0, 0, 0, 0, 0, 0,
];

const knightTableWhite: number[] = [
  -50, -40, -30, -30, -30, -30, -40, -50,
  -40, -20, 0, 5, 5, 0, -20, -40,
  -30, 5, 10, 15, 15, 10, 5, -30,
  -30, 0, 15, 20, 20, 15, 0, -30,
  -30, 5, 15, 20, 20, 15, 5, -30,
  -30, 0, 10, 15, 15, 10, 0, -30,
  -40, -20, 0, 0, 0, 0, -20, -40,
  -50, -40, -30, -30, -30, -30, -40, -50,
];

const bishopTableWhite: number[] = [
  -20, -10, -10, -10, -10, -10, -10, -20,
  -10, 5, 0, 0, 0, 0, 5, -10,
  -10, 10, 10, 10, 10, 10, 10, -10,
  -10, 0, 10, 10, 10, 10, 0, -10,
  -10, 5, 5, 10, 10, 5, 5, -10,
  -10, 0, 5, 10, 10, 5, 0, -10,
  -10, 0, 0, 0, 0, 0, 0, -10,
  -20, -10, -10, -10, -10, -10, -10, -20,
];

const rookTableWhite: number[] = [
  0, 0, 5, 10, 10, 5, 0, 0,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  5, 10, 10, 10, 10, 10, 10, 5,
  0, 0, 0, 0, 0, 0, 0, 0,
];

const queenTableWhite: number[] = [
  -20, -10, -10, -5, -5, -10, -10, -20,
  -10, 0, 5, 0, 0, 0, 0, -10,
  -10, 5, 5, 5, 5, 5, 0, -10,
  0, 0, 5, 5, 5, 5, 0, -5,
  -5, 0, 5, 5, 5, 5, 0, -5,
  -10, 0, 5, 5, 5, 5, 0, -10,
  -10, 0, 0, 0, 0, 0, 0, -10,
  -20, -10, -10, -5, -5, -10, -10, -20,
];

const kingTableWhite: number[] = [
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -20, -30, -30, -40, -40, -30, -30, -20,
  -10, -20, -20, -20, -20, -20, -20, -10,
  20, 20, 0, 0, 0, 0, 20, 20,
  20, 30, 10, 0, 0, 10, 30, 20,
];

export function evaluateBoard(gameState: GameState): number {
  const boardArray = gameState.getBoardArray();

  let total = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = boardArray[row][col];
      if (!piece) continue;
      const idx = row * 8 + col;

      switch (piece.type) {
        case 'p': {
          const base = 100;
          const bonus = piece.color === 'w'
            ? pawnTableWhite[idx]
            : -pawnTableWhite[63 - idx];
          total += piece.color === 'w' ? base + bonus : -base + bonus;
          break;
        }
        case 'n': {
          const base = 320;
          const bonus = piece.color === 'w'
            ? knightTableWhite[idx]
            : -knightTableWhite[63 - idx];
          total += piece.color === 'w' ? base + bonus : -base + bonus;
          break;
        }
        case 'b': {
          const base = 330;
          const bonus = piece.color === 'w'
            ? bishopTableWhite[idx]
            : -bishopTableWhite[63 - idx];
          total += piece.color === 'w' ? base + bonus : -base + bonus;
          break;
        }
        case 'r': {
          const base = 500;
          const bonus = piece.color === 'w'
            ? rookTableWhite[idx]
            : -rookTableWhite[63 - idx];
          total += piece.color === 'w' ? base + bonus : -base + bonus;
          break;
        }
        case 'q': {
          const base = 900;
          const bonus = piece.color === 'w'
            ? queenTableWhite[idx]
            : -queenTableWhite[63 - idx];
          total += piece.color === 'w' ? base + bonus : -base + bonus;
          break;
        }
        case 'k': {
          const base = 20000;
          const bonus = piece.color === 'w'
            ? kingTableWhite[idx]
            : -kingTableWhite[63 - idx];
          total += piece.color === 'w' ? base + bonus : -base + bonus;
          break;
        }
      }
    }
  }

  return total;
}
