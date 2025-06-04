import { Chess, Move as ChessMove } from 'chess.js';
import { Move } from './Move';
import { Piece } from './Piece';

export class Board {
  private chess: any;

  constructor() {
    this.chess = new Chess();
  }

  public reset(): void {
    this.chess.reset();
  }

  public loadFEN(fen: string): void {
    this.chess.load(fen);
  }

  public getLegalMoves(): Move[] {
    const movesVerbose = this.chess.moves({ verbose: true }) as ChessMove[];
    return movesVerbose.map((m) => ({
      from: m.from,
      to: m.to,
      promotion: m.promotion as Move['promotion'],
    }));
  }

  public applyMove(move: Move): boolean {
    try {
      const result = this.chess.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion,
      });
      return result !== null;
    } catch {

      return false;
    }
  }

  public undoMove(): void {
    this.chess.undo();
  }

  public getBoardArray(): (Piece | null)[][] {
    return (this.chess.board() as unknown) as (Piece | null)[][];
  }

  public getTurn(): 'w' | 'b' {
    return this.chess.turn() as 'w' | 'b';
  }

  public isGameOver(): boolean {
    return this.chess.isGameOver();
  }

  public getFEN(): string {
    return this.chess.fen();
  }

  public isCheckmate(): boolean {
    return this.chess.isCheckmate();
  }

  public isDraw(): boolean {
    return this.chess.isDraw();
  }
}
