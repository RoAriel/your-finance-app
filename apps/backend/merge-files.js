const fs = require('fs');
const path = require('path');

// --- Configuración ---
const OUTPUT_FILE = 'todo_el_proyecto.txt';
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', '.next']; 
const EXTENSIONS = ['.ts', '.js', '.json', '.prisma', '.css']; // Extensiones que querés incluir

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
      if (EXTENSIONS.includes(path.extname(file))) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Escribimos un encabezado para saber de qué archivo viene cada parte
        stream.write(`\n\n--- INICIO ARCHIVO: ${filePath} ---\n\n`);
        stream.write(content);
        stream.write(`\n\n--- FIN ARCHIVO: ${filePath} ---\n`);
      }
    }
  }
}

console.log('Generando archivo unificado...');
readDirectory('./'); // Comienza en el directorio actual
stream.end();
console.log(`¡Listo! Todo el contenido está en: ${OUTPUT_FILE}`);