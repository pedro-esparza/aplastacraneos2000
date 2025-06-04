
export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
export type Color = 'w' | 'b';

export interface Move {
  from: string;
  to: string;
  promotion?: PieceType;
}
