// Entry point for GoDaddy cPanel / Phusion Passenger Node.js hosting.
// It imports and runs the compiled production-ready full-stack server.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.resolve(__dirname, 'dist/server.cjs');

if (fs.existsSync(serverPath)) {
  await import('./dist/server.cjs');
} else {
  console.error('================================================================');
  console.error('ERRO CRÍTICO: O arquivo dist/server.cjs não foi encontrado!');
  console.error('Por favor, certifique-se de que o build de produção foi gerado');
  console.error('executando "npm run build" antes de iniciar a aplicação.');
  console.error('================================================================');
  process.exit(1);
}
