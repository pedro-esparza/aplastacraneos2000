import { GameState } from '../model/GameState';
import { MoveResult } from './MoveResult';


export interface IAI {
  calcularMejorJugada(gameState: GameState, depth: number): Promise<MoveResult>;
}
