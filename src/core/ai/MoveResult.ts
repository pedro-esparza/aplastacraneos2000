import { Move } from '../model/Move';

export interface LogEntry {
  depthRem: number;
  moveStr: string;
  value: number;
  valueMaterial: number;
  valuePositional: number;
  isMaximizing: boolean;
  alpha: number;
  beta: number;
  pvLine: string[];
  nodeCount: number;
  pruned: boolean;
}

export interface MoveResult {
  bestMove: Move;
  positionsEvaluated: number;
  timeMs: number;
  logEntries: LogEntry[];
  principalVariation: string[];
}
