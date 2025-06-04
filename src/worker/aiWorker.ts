import { GameState } from '../core/model/GameState';
import { MoveResult } from '../core/ai/MoveResult';
import { calcularMejorJugadaMinimax } from '../core/ai/Minimax';

type RequestMessage = {
  type: 'CALCULAR_MEJOR_JUGADA';
  payload: { fen: string; depth: number };
};

type ResponseMessage = {
  type: 'RESULTADO_JUGADA';
  payload: MoveResult;
};

self.onmessage = async (e: MessageEvent<RequestMessage>) => {
  if (e.data.type !== 'CALCULAR_MEJOR_JUGADA') return;
  const { fen, depth } = e.data.payload;

  const gameState = new GameState();
  gameState.loadFEN(fen);

  try {
    const t0 = performance.now();
    const result = await calcularMejorJugadaMinimax(gameState, depth);
    const t1 = performance.now();

    result.timeMs = Math.round(t1 - t0);

    const response: ResponseMessage = {
      type: 'RESULTADO_JUGADA',
      payload: result,
    };
    (self as any).postMessage(response);
  } catch { }
};
