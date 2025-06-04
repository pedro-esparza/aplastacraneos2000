import { Chess, Move as ChessMove } from 'chess.js';
import { Move } from './Move';
import { Piece } from './Piece';

export class GameState {
  private chess: Chess;

  constructor() {
    this.chess = new Chess();
  }

  public reset(): void {
    this.chess.reset();
  }

  public loadFEN(fen: string): void {
    this.chess.load(fen);
  }

  public getFEN(): string {
    return this.chess.fen();
  }

  public getTurn(): 'w' | 'b' {
    return this.chess.turn() as 'w' | 'b';
  }

  public isGameOver(): boolean {
    return this.chess.isGameOver();
  }

  public getBoardArray(): (Piece | null)[][] {
    return (this.chess.board() as unknown) as (Piece | null)[][];
  }

  public getLegalMoves(): Move[] {
    const movesVerbose = this.chess.moves({ verbose: true }) as ChessMove[];
    return movesVerbose.map(m => ({
      from: m.from,
      to: m.to,
      promotion: m.promotion as Move['promotion'],
    }));
  }

  public applyMove(move: Move): boolean {
    try {
      const res = this.chess.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion,
      });
      return res !== null;
    } catch {
      return false;
    }
  }

  public undoMove(): void {
    this.chess.undo();
  }

  public getSAN(move: Move): string {
    const result = this.chess.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion,
    });
    if (!result) return '';
    const san = result.san;
    this.chess.undo();
    return san;
  }

  public clone(): GameState {
    const copy = new GameState();
    copy.loadFEN(this.getFEN());
    return copy;
  }

  public getHistory(): string[] {
    return this.chess.history();
  }
}
