import { GameState } from '../core/model/GameState';
import { Renderer } from './Renderer';
import { Move } from '../core/model/Move';
import { LogEntry } from '../core/ai/MoveResult';
import { PromotionSelector, PromotionChoice } from './PromotionSelector';

type WorkerRequest = {
  type: 'CALCULAR_MEJOR_JUGADA';
  payload: { fen: string; depth: number };
};

type WorkerResponse = {
  type: 'RESULTADO_JUGADA';
  payload: {
    bestMove: Move;
    positionsEvaluated: number;
    timeMs: number;
    logEntries: LogEntry[];
  };
};

export class InputHandler {
  private gameState: GameState;
  private renderer: Renderer;
  private worker: Worker;
  public playerColor: 'w' | 'b';
  private selectedSquare: string | null = null;

  private ultimoLog: LogEntry[] = [];
  private moveStringEl: HTMLElement;
  private tablaAnalisisBody: HTMLElement;
  private statusEl: HTMLElement;

  private promotionSelector: PromotionSelector;
  private isAwaitingPromotion: boolean = false;

  constructor(
    gameState: GameState,
    renderer: Renderer,
    worker: Worker,
    playerColor: 'w' | 'b'
  ) {
    this.gameState = gameState;
    this.renderer = renderer;
    this.worker = worker;
    this.playerColor = playerColor;

    this.moveStringEl = document.getElementById('moveString')!;
    this.tablaAnalisisBody = document.querySelector('#tablaAnalisisIA tbody')!;
    this.statusEl = document.getElementById('status')!;

    this.promotionSelector = new PromotionSelector();
  }

  public init(): void {
    this.renderer.render(this.gameState);
    this.updateStatus();

    const btnCSV = document.getElementById('btnExportCSV')!;
    const btnJSON = document.getElementById('btnExportJSON')!;

    btnCSV.addEventListener('click', () => {
      if (this.ultimoLog.length === 0) return;
      this.exportLogAsCSV(this.ultimoLog);
    });

    btnJSON.addEventListener('click', () => {
      if (this.ultimoLog.length === 0) return;
      this.exportLogAsJSON(this.ultimoLog);
    });

    this.worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const data = e.data;
      if (data.type === 'RESULTADO_JUGADA') {
        const { bestMove, logEntries } = data.payload;
        this.gameState.applyMove(bestMove);
        this.renderer.render(this.gameState);
        this.updateMoveHistory();
        this.ultimoLog = logEntries;
        this.volcarLogEnTabla(logEntries);
        this.updateStatus();
      }
    };

    this.setupClickListeners();
    this.moveStringEl.innerHTML = '';
    this.tablaAnalisisBody.innerHTML = '';
  }

  private setupClickListeners(): void {
    const boardEl = this.renderer['boardContainer'] as HTMLElement;
    boardEl.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      let squareEl: HTMLElement | null = null;
      if (target.classList.contains('square')) {
        squareEl = target;
      } else if (target.classList.contains('piece')) {
        squareEl = target.parentElement;
      }
      if (!squareEl) return;
      const squareId = squareEl.id;
      this.onSquareClick(squareId);
    });
  }

  private async onSquareClick(squareId: string): Promise<void> {
    const imagenInicio = document.getElementById('imagenInicio')!;
    const movimientosContainer = document.getElementById('movimientosContainer')!;

    if (this.gameState.isGameOver()) return;
    if (this.gameState.getTurn() !== this.playerColor) return;
    if (this.isAwaitingPromotion) return;

    if (!this.selectedSquare) {
      const [row, col] = this.convertAlgebraicToCoords(squareId);
      const matrix = this.gameState.getBoardArray();
      const piece = matrix[row][col];
      if (!piece || piece.color !== this.playerColor) return;
      this.selectedSquare = squareId;
      this.renderer.clearHighlights();
      this.renderer.highlightSquare(squareId);
      return;
    }

    const move: Move = { from: this.selectedSquare, to: squareId };
    this.selectedSquare = null;
    this.renderer.clearHighlights();

    const isPromotion = this.isPawnPromotion(move.from, move.to);
    if (isPromotion) {
      this.isAwaitingPromotion = true;
      try {
        const choice: PromotionChoice = await this.promotionSelector.selectPromotion();
        move.promotion = choice;
        this.applyMoveYIA(move);
      } finally {
        this.isAwaitingPromotion = false;
      }
      return;
    }

    const success = this.gameState.applyMove(move);
    if (!success) {
      this.renderer.render(this.gameState);
      return;
    }

    this.renderer.render(this.gameState);
    if (
      !imagenInicio.classList.contains('fade-out') &&
      !imagenInicio.classList.contains('hidden')
    ) {
      imagenInicio.classList.add('fade-out');
      movimientosContainer.classList.remove('hidden');
      setTimeout(() => imagenInicio.classList.add('hidden'), 800);
    }

    this.updateMoveHistory();
    this.updateStatus();

    if (!this.gameState.isGameOver()) {
      const fen = this.gameState.getFEN();
      const request: WorkerRequest = { type: 'CALCULAR_MEJOR_JUGADA', payload: { fen, depth: 3 } };
      try {
        this.worker.postMessage(request);
      } catch { }
    }
  }

  private applyMoveYIA(move: Move): void {
    try {
      const wasApplied = this.gameState.applyMove(move);
      if (!wasApplied) return;

      this.renderer.render(this.gameState);
      this.updateMoveHistory();
      this.updateStatus();

      if (!this.gameState.isGameOver()) {
        const fen = this.gameState.getFEN();
        const request: WorkerRequest = { type: 'CALCULAR_MEJOR_JUGADA', payload: { fen, depth: 3 } };
        try {
          this.worker.postMessage(request);
        } catch { }
      }
    } catch { }
  }

  private updateMoveHistory(): void {
    const history = this.gameState.getHistory();
    let str = '';
    for (let i = 0; i < history.length; i += 2) {
      const numero = Math.floor(i / 2) + 1;
      const sanBlanca = history[i] || '';
      const sanNegra = history[i + 1] || '';
      str += `<strong>${numero}.</strong> `;
      if (sanBlanca) {
        str += `<strong class="jugada-blancas">${sanBlanca}</strong> `;
      }
      if (sanNegra) {
        str += `<strong class="jugada-negras">${sanNegra}</strong> `;
      }
    }
    this.moveStringEl.style.display = 'block';
    this.moveStringEl.innerHTML = str.trim();
  }

  private volcarLogEnTabla(log: LogEntry[]): void {
    this.tablaAnalisisBody.innerHTML = '';
    log.forEach((entry, idx) => {
      const tr = document.createElement('tr');
      if (entry.pruned) {
        tr.classList.add('fila-podada');
      }

      const tdNum = document.createElement('td');
      tdNum.textContent = (idx + 1).toString();
      tr.appendChild(tdNum);

      const tdMove = document.createElement('td');
      tdMove.textContent = entry.moveStr;
      tr.appendChild(tdMove);

      const tdValue = document.createElement('td');
      tdValue.textContent = entry.value.toString();
      tr.appendChild(tdValue);

      const tdMat = document.createElement('td');
      tdMat.textContent = entry.valueMaterial.toString();
      tr.appendChild(tdMat);

      const tdPos = document.createElement('td');
      tdPos.textContent = entry.valuePositional.toString();
      tr.appendChild(tdPos);

      const tdDepthRem = document.createElement('td');
      tdDepthRem.textContent = entry.depthRem.toString();
      tr.appendChild(tdDepthRem);

      const tdAlpha = document.createElement('td');
      tdAlpha.textContent = entry.alpha === -Infinity ? '-∞' : entry.alpha.toString();
      tr.appendChild(tdAlpha);

      const tdBeta = document.createElement('td');
      tdBeta.textContent = entry.beta === +Infinity ? '+∞' : entry.beta.toString();
      tr.appendChild(tdBeta);

      const tdPV = document.createElement('td');
      tdPV.textContent = entry.pvLine.join(' ');
      tr.appendChild(tdPV);

      const tdNode = document.createElement('td');
      tdNode.textContent = entry.nodeCount.toString();
      tr.appendChild(tdNode);

      const tdMax = document.createElement('td');
      tdMax.textContent = entry.isMaximizing ? 'MAX' : 'MIN';
      tr.appendChild(tdMax);

      const tdPrune = document.createElement('td');
      tdPrune.textContent = entry.pruned ? 'Sí' : 'No';
      tr.appendChild(tdPrune);

      this.tablaAnalisisBody.appendChild(tr);
    });
  }

  private updateStatus(): void {
    const turn = this.gameState.getTurn();
    this.statusEl.textContent = turn === 'w' ? 'Turno: Blancas' : 'Turno: Negras';
  }

  private convertAlgebraicToCoords(squareId: string): [number, number] {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const fileChar = squareId[0];
    const rankNum = Number(squareId[1]);
    const col = files.indexOf(fileChar);
    const row = 8 - rankNum;
    return [row, col];
  }

  private exportLogAsCSV(logEntries: LogEntry[]): void {
    const headers = [
      '#',
      'Jugada',
      'Eval Total',
      'Eval Mat',
      'Eval Pos',
      'Prof Rem.',
      'alpha',
      'beta',
      'PV Parcial',
      '#Nodos',
      'Max/Min',
      'Poda'
    ];
    const rows = logEntries.map((entry, idx) => {
      const moveStr = `"${entry.moveStr}"`;
      const pvStr = `"${entry.pvLine.join(' ')}"`;
      const isMaxMin = entry.isMaximizing ? 'MAX' : 'MIN';
      const pruned = entry.pruned ? 'Sí' : 'No';
      return [
        (idx + 1).toString(),
        moveStr,
        entry.value.toString(),
        entry.valueMaterial.toString(),
        entry.valuePositional.toString(),
        entry.depthRem.toString(),
        entry.alpha === -Infinity ? '-∞' : entry.alpha.toString(),
        entry.beta === +Infinity ? '+∞' : entry.beta.toString(),
        pvStr,
        entry.nodeCount.toString(),
        isMaxMin,
        pruned
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analisis.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private exportLogAsJSON(logEntries: LogEntry[]): void {
    const data = {
      logEntries: logEntries.map((entry, idx) => ({
        index: idx + 1,
        moveStr: entry.moveStr,
        value: entry.value,
        valueMaterial: entry.valueMaterial,
        valuePositional: entry.valuePositional,
        depthRem: entry.depthRem,
        alpha: entry.alpha,
        beta: entry.beta,
        pvLine: entry.pvLine,
        nodeCount: entry.nodeCount,
        isMaximizing: entry.isMaximizing,
        pruned: entry.pruned
      }))
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analisis.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private isPawnPromotion(from: string, to: string): boolean {
    const [rowFrom, colFrom] = this.convertAlgebraicToCoords(from);
    const matriz = this.gameState.getBoardArray();
    const piece = matriz[rowFrom][colFrom];
    if (!piece || piece.type !== 'p') return false;

    const rankDest = parseInt(to[1], 10);
    if (piece.color === 'w' && rankDest === 8) return true;
    if (piece.color === 'b' && rankDest === 1) return true;
    return false;
  }
}
