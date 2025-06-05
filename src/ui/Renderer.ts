import { GameState } from '../core/model/GameState';
import { Piece } from '../core/model/Piece';

type Color = 'w' | 'b';
type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';

export class Renderer {
  private boardContainer: HTMLElement;
  private rankLabelsContainer: HTMLElement;
  private fileLabelsContainer: HTMLElement;
  private lastHighlighted: Set<string> = new Set();

  constructor(
    boardContainer: HTMLElement,
    rankLabelsContainer: HTMLElement,
    fileLabelsContainer: HTMLElement
  ) {
    this.boardContainer = boardContainer;
    this.rankLabelsContainer = rankLabelsContainer;
    this.fileLabelsContainer = fileLabelsContainer;
  }

  public render(gameState: GameState): void {
    this.renderRankAndFileLabels();

    this.boardContainer.innerHTML = '';
    this.lastHighlighted.clear();

    const matrix = gameState.getBoardArray();

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const squareEl = document.createElement('div');
        squareEl.classList.add('square');

        const isLight = (row + col) % 2 === 0;
        squareEl.classList.add(isLight ? 'light' : 'dark');

        squareEl.dataset.row = row.toString();
        squareEl.dataset.col = col.toString();

        const squareId = this.getSquareId(row, col);
        squareEl.id = squareId;

        const piece = matrix[row][col];
        if (piece) {
          const pieceEl = document.createElement('div');
          pieceEl.classList.add('piece');

          const color = piece.color as Color;
          const type = piece.type.toUpperCase();
          pieceEl.classList.add(`${color}${type}`);

          squareEl.appendChild(pieceEl);
        }

        this.boardContainer.appendChild(squareEl);
      }
    }
  }

  private renderRankAndFileLabels(): void {
    if (this.rankLabelsContainer.childElementCount === 0) {
      for (let r = 8; r >= 1; r--) {
        const label = document.createElement('div');
        label.textContent = r.toString();
        this.rankLabelsContainer.appendChild(label);
      }
    }
    if (this.fileLabelsContainer.childElementCount === 0) {
      const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      for (let i = 0; i < 8; i++) {
        const label = document.createElement('div');
        label.textContent = files[i];
        this.fileLabelsContainer.appendChild(label);
      }
    }
  }

  public getSquareId(row: number, col: number): string {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const rank = 8 - row;
    return files[col] + rank.toString();
  }

  public clearHighlights(): void {
    this.lastHighlighted.forEach((sqId) => {
      const el = document.getElementById(sqId);
      if (el) el.classList.remove('highlight');
    });
    this.lastHighlighted.clear();
  }

  public highlightSquare(squareId: string): void {
    const el = document.getElementById(squareId);
    if (el) {
      el.classList.add('highlight');
      this.lastHighlighted.add(squareId);
    }
  }
}
