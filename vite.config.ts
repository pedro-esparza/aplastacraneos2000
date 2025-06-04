import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// 👇 Solo si tienes otros plugins, agrégalos al arreglo
export default defineConfig({
  plugins: [tsconfigPaths()],
});
