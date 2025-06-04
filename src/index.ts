

import { GameState } from './core/model/GameState';
import { Renderer } from './ui/Renderer';
import { InputHandler } from './ui/InputHandler';

const gameState = new GameState();
const boardContainer = document.getElementById('chessboard')!;
const rankLabelsContainer = document.getElementById('rankLabels')!;
const fileLabelsContainer = document.getElementById('fileLabels')!;
const statusText = document.getElementById('status')!;
const renderer = new Renderer(boardContainer, rankLabelsContainer, fileLabelsContainer);

const worker = new Worker(new URL('./worker/aiWorker.ts', import.meta.url), { type: 'module', });
const inputHandler = new InputHandler(gameState, renderer, worker, 'w');

inputHandler.init();

const btnBlancas = document.getElementById('jugarBlancas')!;
const btnNegras = document.getElementById('jugarNegras')!;
const imagenInicio = document.getElementById('imagenInicio')!;
const movimientosContainer = document.getElementById('movimientosContainer')!;

function mostrarAnalisis(): void {
  imagenInicio.classList.add('hidden');
  movimientosContainer.classList.remove('hidden');
}

function generarEtiquetasBlancas(): void {
  rankLabelsContainer.innerHTML = '';
  for (let r = 8; r >= 1; r--) {
    const label = document.createElement('div');
    label.textContent = r.toString();
    rankLabelsContainer.appendChild(label);
  }
  const filesNormal = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  fileLabelsContainer.innerHTML = '';
  for (const f of filesNormal) {
    const label = document.createElement('div');
    label.textContent = f;
    fileLabelsContainer.appendChild(label);
  }
}

function generarEtiquetasNegras(): void {
  rankLabelsContainer.innerHTML = '';
  for (let r = 1; r <= 8; r++) {
    const label = document.createElement('div');
    label.textContent = r.toString();
    rankLabelsContainer.appendChild(label);
  }
  const filesInvert = ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
  fileLabelsContainer.innerHTML = '';
  for (const f of filesInvert) {
    const label = document.createElement('div');
    label.textContent = f;
    fileLabelsContainer.appendChild(label);
  }
}

generarEtiquetasBlancas();
renderer.render(gameState);

btnBlancas.addEventListener('click', (e) => {
  e.preventDefault();
  imagenInicio.classList.add('fade-out');
  movimientosContainer.classList.remove('hidden');
  setTimeout(() => { imagenInicio.classList.add('hidden'); }, 800);
  gameState.reset();
  renderer.render(gameState);
  btnBlancas.classList.add('selected');
  btnNegras.classList.remove('selected');
  inputHandler.playerColor = 'w';
  const boardWrapper = document.querySelector('.board-wrapper')!;
  boardWrapper.classList.remove('rotated');
  generarEtiquetasBlancas();
  statusText.textContent = 'Turno de Blancas';
});

btnNegras.addEventListener('click', (e) => {
  e.preventDefault();
  imagenInicio.classList.add('fade-out');
  movimientosContainer.classList.remove('hidden');
  setTimeout(() => { imagenInicio.classList.add('hidden'); }, 800);
  gameState.reset();
  renderer.render(gameState);
  btnBlancas.classList.remove('selected');
  btnNegras.classList.add('selected');
  inputHandler.playerColor = 'b';
  const boardWrapper = document.querySelector('.board-wrapper')!;
  boardWrapper.classList.add('rotated');
  generarEtiquetasNegras();
  const fenInicial = gameState.getFEN();
  const profundidad = 3;
  worker.postMessage({
    type: 'CALCULAR_MEJOR_JUGADA',
    payload: { fen: fenInicial, depth: profundidad },
  });

  statusText.textContent = 'Turno de Negras';
});