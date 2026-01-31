import fs from 'fs';
import path from 'path';

// --- Configuración ---
const OUTPUT_FILE = 'todo_el_proyecto.txt';
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', '.next', '.vscode'];
const EXTENSIONS = ['.ts', '.js', '.json', '.prisma', '.css'];

const stream = fs.createWriteStream(OUTPUT_FILE);

function readDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        readDirectory(filePath);
      }
    } else {
      // 1. Verificamos que tenga la extensión correcta
      // 2. IMPORTANTE: Verificamos que no sea el propio archivo de salida
      if (EXTENSIONS.includes(path.extname(file)) && file !== OUTPUT_FILE) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');

          stream.write(`\n\n--- INICIO ARCHIVO: ${filePath} ---\n\n`);
          stream.write(content);
          stream.write(`\n\n--- FIN ARCHIVO: ${filePath} ---\n`);
        } catch (err) {
          console.error(`No se pudo leer el archivo ${filePath}: ${err.message}`);
        }
      }
    }
  }
}

console.log('🚀 Generando archivo unificado...');

// Escribimos una pequeña cabecera inicial en el txt
stream.write(`PROYECTO UNIFICADO - FECHA: ${new Date().toLocaleString()}\n`);
stream.write(`================================================\n`);

readDirectory('./');

stream.end();

stream.on('finish', () => {
  console.log(`✅ ¡Listo! Todo el contenido está en: ${OUTPUT_FILE}`);
});