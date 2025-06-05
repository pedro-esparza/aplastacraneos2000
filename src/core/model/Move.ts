
export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
export type Color = 'w' | 'b';

// src/core/model/Move.ts
export interface Move {
  from: string;            // ej. "b7"
  to: string;              // ej. "b8"
  promotion?: 'q' | 'r' | 'b' | 'n';
}


