import { GameState } from '../model/GameState';
import { evaluateBoard, getMaterialValue, getPositionalValue } from './Heuristics';
import { Move } from '../model/Move';
import { MoveResult, LogEntry } from './MoveResult';

let globalNodeCounter = 0;

export async function calcularMejorJugadaMinimax(
  gameState: GameState,
  depth: number

): Promise<MoveResult> {

  const log: LogEntry[] = [];
  globalNodeCounter = 0;

  const [bestValue, bestMove, bestPV] = minimax(
    gameState,
    depth,
    -Infinity,
    +Infinity,
    true,
    log,
    []

  );
  return {
    bestMove: bestMove!,
    positionsEvaluated: globalNodeCounter,
    timeMs: 0,
    logEntries: log,
    principalVariation: bestPV,

  };
}

function minimax(
  gs: GameState,
  depthRem: number,
  alpha: number,
  beta: number,
  isMax: boolean,
  log: LogEntry[],
  pathPV: string[]

): [number, Move | null, string[]] {
  globalNodeCounter++;

  if (depthRem === 0 || gs.isGameOver()) {
    const boardArray = gs.getBoardArray();
    let totalEval = 0;
    let evalMat = 0;
    let evalPos = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = boardArray[r][c];
        if (!piece) continue;
        const mat = getMaterialValue(piece);
        const pos = getPositionalValue(piece, r, c);
        if (piece.color === 'w') {
          evalMat += mat;
          evalPos += pos;

        } else {
          evalMat -= mat;
          evalPos -= pos;

        }
      }
    }
    totalEval = evalMat + evalPos;
    log.push({
      depthRem,
      moveStr: '—',
      value: totalEval,
      valueMaterial: evalMat,
      valuePositional: evalPos,
      isMaximizing: isMax,
      alpha,
      beta,
      pvLine: [...pathPV],
      nodeCount: globalNodeCounter,
      pruned: false,

    });
    return [totalEval, null, [...pathPV]];
  }
  let bestValue = isMax ? -Infinity : +Infinity;
  let bestMove: Move | null = null;
  let bestPV: string[] = [];

  log.push({
    depthRem,
    moveStr: pathPV.length ? pathPV[pathPV.length - 1] : 'Raíz',
    value: isMax ? -Infinity : +Infinity,
    valueMaterial: 0,
    valuePositional: 0,
    isMaximizing: isMax,
    alpha,
    beta,
    pvLine: [...pathPV],
    nodeCount: globalNodeCounter,
    pruned: false,

  });
  const logIndex = log.length - 1;
  const legalMoves = gs.getLegalMoves();
  for (const mv of legalMoves) {

    const gsCopy = gs.clone();
    const applied = gsCopy.applyMove(mv);
    if (!applied) continue;
    const sanMv = gs.getSAN(mv);
    const newPathPV = [...pathPV, sanMv];
    const [childValue, , childPV] = minimax(
      gsCopy,
      depthRem - 1,
      alpha,
      beta,
      !isMax,
      log,
      newPathPV

    );
    if (isMax) {
      if (childValue > bestValue) {
        bestValue = childValue;
        bestMove = mv;
        bestPV = [sanMv, ...childPV];

      }
      alpha = Math.max(alpha, bestValue);
    } else {
      if (childValue < bestValue) {
        bestValue = childValue;
        bestMove = mv;
        bestPV = [sanMv, ...childPV];

      }
      beta = Math.min(beta, bestValue);
    }

    const entry = log[logIndex];
    entry.value = bestValue;
    entry.alpha = alpha;
    entry.beta = beta;
    entry.pvLine = [...bestPV];

    if (alpha >= beta) {
      entry.pruned = true;
      break;

    }
  }
  return [bestValue, bestMove, bestPV];
}
