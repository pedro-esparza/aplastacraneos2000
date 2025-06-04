# Aplasta Cráneos 2000

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Build](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Made with Vite](https://img.shields.io/badge/Made%20with-Vite-646CFF.svg)](https://vitejs.dev/)

**Un motor educativo de ajedrez en el navegador**  
Este proyecto demuestra cómo construir un motor de IA (minimax con poda alfa‐beta) usando TypeScript y un Web Worker, junto con una interfaz sencilla en el DOM. Está pensado para que estudiantes, investigadores y profesores puedan:

- **Aprender** paso a paso el algoritmo de minimax y cómo evaluar posiciones de ajedrez.
- **Extender** el motor con nuevas heurísticas, diferentes profundidades o incluso motores alternativos.
- **Contribuir** fácilmente desde GitHub, gracias a la arquitectura modular.
- **Verificar** resultados con pruebas unitarias (Jest).

## Estructura de carpetas

```
/ (raíz)
├── src/
│   ├── core/
│   │   ├── model/
│   │   │   ├── Board.ts         # Clase que envuelve Chess.js (reset, FEN, legal moves, applyMove, clone, etc.)
│   │   │   ├── Piece.ts         # Tipo Piece { type: 'p'|'n'|'b'|'r'|'q'|'k'; color: 'w'|'b' }
│   │   │   ├── Move.ts          # Interfaz Move { from: string; to: string; promotion?: 'q'|'r'|'b'|'n' }
│   │   │   └── GameState.ts     # Adaptación de Board para la lógica de estado, clonación y SAN
│   │   ├── ai/
│   │   │   ├── IAI.ts           # Interfaz IAI { calcularMejorJugada(...): Promise<MoveResult>; }
│   │   │   ├── Minimax.ts       # Implementación de Minimax α‐β recursivo y logging de nodos
│   │   │   ├── Heuristics.ts    # Funciones getMaterialValue, getPositionalValue, evaluateBoard
│   │   │   └── MoveResult.ts    # Interfaces LogEntry y MoveResult con todos los campos de análisis
│   │   └── utils/
│   │       ├── Notation.ts      # Conversión FEN ↔ estado y utilidades de notación
│   │       ├── Timer.ts         # Wrapper de performance.now() para medir tiempos
│   │       └── Logger.ts        # Logs estructurados (opcional)
│   ├── worker/
│   │   └── aiWorker.ts          # Código que recibe mensajes del main thread, invoca Minimax y responde
│   ├── ui/
│   │   ├── Renderer.ts          # Dibujo del tablero en DOM, posición, etiquetas de filas/columnas
│   │   ├── InputHandler.ts      # Gestión de clics, selección de casillas, promoción, exportación, tabla de análisis
│   │   ├── PromotionSelector.ts # (Opcional) Separación de lógica de modal de promoción—aunque está integrado en InputHandler
│   │   └── MoveHistory.ts       # (Opcional) Si separamos lógica de historial de jugadas del InputHandler
│   ├── index.ts                 # Punto de entrada: monta GameState, Renderer, Worker e InputHandler, enlaza botones
│   └── index.html               # HTML base con contenedor de tablero, botones de selección y tabla de análisis
├── public/
│   ├── css/
│   │   ├── pieces.css           # Clases .wP, .bK, etc. apuntando a SVGs en public/assets/pieces/
│   │   └── style.css            # Estilos generales: layout, modal de promoción, tabla, botones exportación, etc.
│   ├── assets/pieces/           # SVGs de piezas (wpawn.svg, wrook.svg, …, bpawn.svg, …)
│   ├── assets/images/           # magician.png, fondos, placeholder
│   └── favicon.ico
├── tests/
│   ├── core/
│   │   ├── Heuristics.test.ts   # Tests unitarios para getMaterialValue, evaluateBoard…
│   │   ├── Minimax.test.ts      # Prueba de valores de Minimax en posiciones conocidas
│   │   └── GameState.test.ts    # Tests de applyMove, clone, FEN, SAN
│   └── worker/
│       └── aiWorker.test.ts     # Tests de que el Worker responda correctamente
├── tsconfig.json                # Configuración de TypeScript (target ESNext, paths, strict, etc.)
├── vite.config.ts               # Plugin de Vite para TypeScript, configuración de Worker y aliases
├── package.json                 # Dependencias (chess.js, vite, jest, @types…, scripts)
├── README.md                    # Este documento
└── LICENSE                      # Licencia MIT
```

---

## Instalación y desarrollo

1. **Clonar el repositorio**  
   ```bash
   git clone <URL_del_repositorio>
   cd aplasta-craneos-2000
   ```

2. **Instalar dependencias**  
   ```bash
   npm install
   ```

3. **Levantar servidor de desarrollo**  
   ```bash
   npm run dev
   ```  
   Vite mostrará algo como `Local: http://localhost:5173/`. Abre esa URL en tu navegador.

4. **Ver en el navegador**  
   - Verás la landing con un botón “¡Juega con Blancas!” y “¡Juega con Negras!”.  
   - Al pulsar “¡Juega con Blancas!”, el tablero se dibuja y tú mueves; la IA responde.  
   - Al pulsar “¡Juega con Negras!”, el tablero gira 180° y la IA mueve primero.  
   - En ambos casos, la tabla de análisis (debajo) se va llenando nodo a nodo.

---

## Uso de la interfaz

### 1. Selección de color y rotación de tablero

- **¡Juega con Blancas!**  
  - Resetea el GameState a la posición inicial.  
  - El jugador controla las blancas.  
  - La IA (Worker) buscará la mejor respuesta en negras tras cada jugada humana.  
  - El tablero se muestra en orientación normal (rank 1 abajo).

- **¡Juega con Negras!**  
  - Resetea el GameState a la posición inicial.  
  - Tú controlas las negras; la IA mueve primero como blancas.  
  - El tablero gira 180° para mostrar la vista de negras (“rank 8 abajo”).  

En ambos casos, las etiquetas de fila y columna (a,b,c… / 1,2,3…) se regeneran según perspectiva.

---

### 2. Movimiento de piezas y promoción de peones

- Haz clic en una casilla que contenga tu pieza (se resalta).  
- Luego haz clic en la casilla destino.  
  - Si el movimiento es válido, se aplica y se redibuja el tablero.  
  - Si ese movimiento es una promoción de peón (ej. peón blanco llega a RANK 8 o peón negro a RANK 1), en lugar de ejecutar inmediatamente, aparece un **modal** que dice “Promocionar Peón” con 4 botones: ♕ Dama, ♖ Torre, ♗ Alfil y ♘ Caballo.  
    1. Tú eliges la pieza (click en uno de los botones).  
    2. Se aplica el movimiento con `promotion: 'q'`, `'r'`, `'b'` o `'n'` y se redibuja el tablero.  
    3. Se actualiza el historial (ej. “e7-e8=Q”).  
    4. Se cierra el modal y la IA responde si la partida no terminó.

---

### 3. Historial de jugadas

- Justo debajo del tablero aparece `<p id="moveString">…</p>`.  
- Tras cada movimiento válido (humano o IA), el historial se reconstruye en notación SAN:  
  ```
  1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 …
  ```
- Las jugadas de blancas aparecen en azul y las de negras en verde (clases `.jugada-blancas` y `.jugada-negras` definidas en CSS).

---

### 4. Tabla de análisis de IA

La sección de análisis (donde se muestra la tabla) contiene:

```html
<span class="btn secondary">Análisis IA (master magician)</span>

<div class="export-buttons">
  <button id="btnExportCSV"  class="btn btn-csv">CSV</button>
  <button id="btnExportJSON" class="btn btn-json">JSON</button>
</div>

<table id="tablaAnalisisIA" style="width:100%;">
  <thead>
    <tr>
      <th>#</th>
      <th>Jugada</th>
      <th>Eval Total</th>
      <th>Eval Mat</th>
      <th>Eval Pos</th>
      <th>Prof Rem.</th>
      <th>α</th>
      <th>β</th>
      <th>PV Parcial</th>
      <th>#Nodos</th>
      <th>¿Max?</th>
      <th>Poda?</th>
    </tr>
  </thead>
  <tbody>
    <!-- Las filas se rellenan dinámicamente -->
  </tbody>
</table>
```

**Cada fila (LogEntry) muestra:**

1. **Índice (#)** – Orden en el recorrido Minimax.  
2. **Jugada** (`moveStr`) – Notación “e2-e4” o “Nf3” según SAN.  
3. **Eval Total** (`value`) – Evaluación final (material + posicional) en centipawns.  
4. **Eval Mat** (`valueMaterial`) – Contribución de material puro.  
5. **Eval Pos** (`valuePositional`) – Puntos de piece‐square (posición).  
6. **Prof Rem.** (`depthRem`) – Profundidad restante en ese nodo.  
7. **α** (`alpha`) – Valor α al entrar en el nodo (en caso de MAX).  
8. **β** (`beta`) – Valor β al entrar en el nodo (en caso de MIN).  
9. **PV Parcial** (`pvLine.join(' ')`) – Variación principal parcial (secuencia de SAN).  
10. **#Nodos** (`nodeCount`) – Contador global de nodos visitados hasta ese punto.  
11. **¿Max?** (`isMaximizing ? “MAX” : “MIN”`) – Indica si el nodo era MAX (IA trataba de maximizar) o MIN.  
12. **Poda?** (`pruned ? “Sí” : “No”`) – Marca si ese nodo provocó (o estaba tras) una poda α‐β.

- Las filas podadas llevan la clase `.fila-podada` para sombrearlas (fondo claro rojizo).  
- Cada vez que la IA termina su búsqueda, la tabla se limpia y se vuelve a llenar con la lista de `LogEntry[]` que el Worker envía como respuesta.

---

### 5. Exportar análisis: CSV / JSON

Justo encima de la tabla de análisis hay dos botones especialmente diferenciados:

- **Botón CSV** (`.btn-csv`, fondo azul oscuro): genera un archivo `analisis.csv` con todas las columnas en formato separado por comas.  
- **Botón JSON** (`.btn-json`, fondo naranja): genera un archivo `analisis.json` que contiene un objeto `{ logEntries: [ … ] }` con la misma información en formato estructurado.

Ambos botones, al pulsarlos, toman el array `LogEntry[]` almacenado en `this.ultimoLog` y construyen un `Blob` que se descarga automáticamente.

---

## Instalación de dependencias

En la raíz del proyecto:

```bash
npm install
```

- **`chess.js`** → Lógica de movimientos y reglas de ajedrez.  
- **`vite`** → Bundler dev/produce.  
- **`typescript`** + `ts‐node` → Transpilación y tipado.  
- **`jest`** + `ts‐jest` → Pruebas unitarias (ya configuradas).

---

## Scripts disponibles

- `npm run dev` → Inicia servidor de desarrollo Vite con HMR (por defecto en `http://localhost:5173/`).  
- `npm run build` → Compila TypeScript y genera los bundles optimizados en `/dist`.  
- `npm run preview` → Sirve localmente el contenido de `/dist` para revisión previa a despliegue.  
- `npm run test` → Ejecuta los tests unitarios con Jest.

---

## ¿Cómo colaborar?

1. **Explorar Minimax**  
   En `src/core/ai/Minimax.ts` verás la función recursiva `minimax(...)` con logging de cada nodo en un `LogEntry[]`. Allí puedes:  
   - Cambiar la profundidad por defecto.  
   - Modificar o añadir criterios de poda (por ejemplo, mejora de ordering).  
   - Integrar transposición de tablas (hashing).  

2. **Añadir o mejorar heurísticas**  
   Abre `src/core/ai/Heuristics.ts` y:  
   - Añade piece‐square tables para caballos, alfiles, torres, etc.  
   - Experimenta con control de centro, movilidad, seguridad de rey.  
   - Escribe tests en `tests/core/Heuristics.test.ts`.

3. **Extender la interfaz**  
   En `src/ui/` puedes:  
   - Modificar `Renderer.ts` para usar Canvas o SVG en lugar de `<div>`s.  
   - Cambiar `InputHandler.ts` para animar movimientos (transiciones CSS).  
   - Personalizar el modal de promoción (colores, íconos, posición).

4. **Agregar nuevas funcionalidades**  
   Algunas ideas:  
   - Mostrar mini‐tableros en cada fila del análisis.  
   - Graficar la evolución de la evaluación en la línea principal.  
   - Añadir filtros y ordenación interactiva en la tabla (por valor, por poda, por MAX/MIN).  
   - Exportar a formatos adicionales (por ejemplo, exportar lines de variación a PGN).  
   - Inclusión de un módulo de aperturas que detecte la apertura basada en las primeras jugadas y lo muestre.

5. **Pruebas unitarias**  
   - Los tests actuales usan Jest y cubren `GameState`, `Heuristics` y `Minimax` en `tests/core/`.  
   - Puedes añadir más pruebas en `tests/worker/aiWorker.test.ts` para verificar que el Worker devuelva siempre un `MoveResult` válido.

---

## Preguntas frecuentes (FAQ)

1. **¿Cómo funciona la promoción de peones?**  
   - Cuando un peón llega a la última fila, `InputHandler` detecta el evento y guarda un “movimiento pendiente”.  
   - Aparece un modal con cuatro botones (Dama/Torre/Alfil/Caballo).  
   - Al pulsar, se aplica el movimiento con la pieza elegida (`promotion`), se oculta el modal y enseguida la IA responde.  

2. **¿Por qué no veo la jugada de la IA en el tablero?**  
   - Asegúrate de que en `onmessage` del Worker se llame **primero** a `this.gameState.applyMove(bestMove)` y luego a `this.renderer.render(this.gameState)`. Si falta alguno, el tablero no se actualiza.  

3. **¿Dónde configuro la profundidad de búsqueda?**  
   - En `InputHandler` está fijo a `depth = 3`. Si quieres exponerlo al usuario, modifica el HTML para añadir un `<select>` o `<input type="number">` y pásalo al Worker en lugar de la constante.  

4. **El modal de promoción bloquea los clics en el tablero**  
   - Mientras el modal esté abierto (clase `.hidden` retirada), `this.selectedSquare` aún no se consumirá y `onSquareClick` ignorará cualquier otro clic hasta que elijas una pieza.  

5. **¿Cómo puedo agregar un botón “Resetear” sin recargar la página?**  
   - Crea un nuevo botón con `id="btnReset"` y en `init()` agrega:
     ```ts
     const btnReset = document.getElementById('btnReset')!;
     btnReset.addEventListener('click', () => {
       this.gameState.reset();
       this.renderer.render(this.gameState);
       this.moveStringEl.innerHTML = '';
       this.tablaAnalisisBody.innerHTML = '';
       // Remover clases “selected” de los botones “¡Juega con…” si las hubiera
     });
     ```

---

## Licencia

Este proyecto se publica bajo **MIT License**. ¡Siéntete libre de clonar, modificar y redistribuir!
